import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import Textarea from "../../components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash, FaEdit } from "react-icons/fa";
import { db } from "../../services/firebaseConection";
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import Modal from "../../components/modal";
import { CustomToast } from "../../components/toast/customToast";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface IHomeProps {
  user: {
    email: string;
  };
}

interface ITasksProps {
  id: string;
  create: Date;
  public: boolean;
  task: string;
  user: string;
}

const Dashboard = ({ user }: IHomeProps) => {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<ITasksProps[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      const taskRef = collection(db, "tasks");
      const q = query(
        taskRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      );

      onSnapshot(q, (snapshot) => {
        let list = [] as ITasksProps[];

        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            create: doc.data().created,
            public: doc.data().public,
            user: doc.data().user,
          });
        });

        setTasks(list);
      });
    };
    loadTasks();
  }, [user?.email]);

  const handleChangePublic = (event: ChangeEvent<HTMLInputElement>) => {
    setPublicTask(event.target.checked);
  };

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === "") {
      CustomToast({
        message: "O campo de tarefa está vazio!",
        type: "error",
      });
      return;
    }

    try {
      if (isEditing && currentTaskId) {
        const docRef = doc(db, "tasks", currentTaskId);
        await updateDoc(docRef, {
          task: input,
          public: publicTask,
        });
        CustomToast({
          message: "Tarefa atualizada com sucesso!",
          type: "success",
        });
        setIsEditing(false);
        setCurrentTaskId(null);
      } else {
        await addDoc(collection(db, "tasks"), {
          task: input,
          created: new Date(),
          user: user?.email,
          public: publicTask,
        });
        CustomToast({
          message: "Tarefa registrada com sucesso!",
          type: "success",
        });
      }

      setInput("");
      setPublicTask(false);
    } catch (err) {
      CustomToast({
        message: "Erro ao registrar a tarefa.",
        type: "error",
      });
      console.log(err);
    }
  }

  const handleShare = async (id: string) => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );
    CustomToast({ message: "URL copiada com sucesso!", type: "info" });
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      const docRef = doc(db, "tasks", taskToDelete);
      await deleteDoc(docRef);
      CustomToast({
        message: "Tarefa removida com sucesso!",
        type: "error",
      });
      setIsModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handlerEditTask = (task: ITasksProps) => {
    setInput(task.task);
    setPublicTask(task.public);
    setIsEditing(true);
    setCurrentTaskId(task.id);
  };

  const handlerCancelEdit = () => {
    setInput("");
    setPublicTask(false);
    setIsEditing(false);
    setCurrentTaskId(null);
  };

  const confirmDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToDelete(null);
  };

  return (
    <div className={`${styles.container} container`}>
      <Head>
        <title>Meu painel de tarefa</title>
      </Head>

      <main className={`${styles.main} main`}>
        <section className={`${styles.content} content`}>
          <div className={`${styles.contentForm} contentForm`}>
            <h1 className={`${styles.title} title`}>Qual sua tarefa?</h1>

            <form
              className={`${styles.form} form`}
              onSubmit={handleRegisterTask}
            >
              <Textarea
                placeholder="Digite qual a sua tarefa..."
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
              />

              <div className={`${styles.checkboxArea} checkboxArea`}>
                <input
                  type="checkbox"
                  className={`${styles.checkbox} checkbox`}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública?</label>
              </div>

              <button
                type="submit"
                className={`${styles.buttonSubmit} buttonSubmit`}
              >
                {isEditing ? "Atualizar" : "Registrar"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className={`${styles.buttonCancel} buttonCancel`}
                  onClick={handlerCancelEdit}
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </section>

        <section className={`${styles.taskContainer} taskContainer`}>
          <h1>Minhas tarefas</h1>

          {tasks.map((item) => (
            <article key={item.id} className={`${styles.task} task`}>
              {item.public && (
                <div className={`${styles.tagContainer} tagContainer`}>
                  <label className={`${styles.tag} tag`}>PÚBLICO</label>
                </div>
              )}

              <div className={`${styles.taskContent} taskContent`}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.task}</p>
                  </Link>
                ) : (
                  <p>{item.task}</p>
                )}

                <div className={styles.actions}>
                  <button onClick={() => handlerEditTask(item)}>
                    <FaEdit size={24} color="#3183FF" />
                  </button>
                  <button onClick={() => confirmDeleteTask(item.id)}>
                    <FaTrash size={24} color="#FF3636" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        title="Confirmar remoção"
        onClose={handleCloseModal}
        onConfirm={handleDeleteTask}
      >
        <p>Tem certeza que deseja remover esta tarefa?</p>
      </Modal>

      <ToastContainer transition={Slide} />
    </div>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
