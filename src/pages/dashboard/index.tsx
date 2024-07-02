import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import Textarea from "../../components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash, FaEdit, FaCheck } from "react-icons/fa";
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
  completed: boolean;
  startDate: Date;
  endDate: Date;
}

const Dashboard = ({ user }: IHomeProps) => {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<ITasksProps[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
            completed: doc.data().completed || false,
            startDate: doc.data().startDate?.toDate(),
            endDate: doc.data().endDate?.toDate(),
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

    if (input === "" || !startDate || !endDate) {
      CustomToast({
        message: "Todos os campos devem ser preenchidos!",
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
          startDate: new Date(startDate),
          endDate: new Date(endDate),
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
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
        CustomToast({
          message: "Tarefa registrada com sucesso!",
          type: "success",
        });
      }

      setInput("");
      setPublicTask(false);
      setStartDate("");
      setEndDate("");
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

  const handleEditTask = (task: ITasksProps) => {
    setInput(task.task);
    setPublicTask(task.public);

    const startDate =
      task.startDate instanceof Date
        ? task.startDate
        : new Date(task.startDate);
    const endDate =
      task.endDate instanceof Date ? task.endDate : new Date(task.endDate);

    setStartDate(
      !isNaN(startDate.getTime())
        ? startDate.toISOString().substring(0, 10)
        : ""
    );
    setEndDate(
      !isNaN(endDate.getTime()) ? endDate.toISOString().substring(0, 10) : ""
    );

    setIsEditing(true);
    setCurrentTaskId(task.id);
  };

  const handleCancelEdit = () => {
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

  const handleCompleteTask = async (id: string) => {
    const docRef = doc(db, "tasks", id);
    try {
      await updateDoc(docRef, {
        completed: true,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      );

      CustomToast({
        message: "Tarefa marcada como concluída!",
        type: "success",
      });
    } catch (err) {
      CustomToast({
        message: "Erro ao marcar a tarefa como concluída.",
        type: "error",
      });
      console.log(err);
    }
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

              <div className={`${styles.dateContainer} dateContainer`}>
                <label>
                  Data de Início:
                  <input
                    type="date"
                    value={startDate}
                    className="start-date"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setStartDate(event.target.value)
                    }
                  />
                </label>
                <label>
                  Data Prevista de Término:
                  <input
                    type="date"
                    value={endDate}
                    className="end-date"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setEndDate(event.target.value)
                    }
                  />
                </label>
              </div>

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
                  onClick={handleCancelEdit}
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

                  <button
                    className={`${styles.shareButton} shareButton`}
                    onClick={() => handleShare(item.id)}
                  >
                    <FiShare2 size={12} color="#3183FF" />
                  </button>
                </div>
              )}

              <div className={`${styles.taskContent} taskContent`}>
                {item.public && !item.completed ? (
                  <Link href={`/task/${item.id}`}>
                    <p className={item.completed ? styles.completedTask : ""}>
                      {item.task}
                    </p>
                  </Link>
                ) : (
                  <p className={item.completed ? styles.completedTask : ""}>
                    {item.task}
                  </p>
                )}

                <div className={styles.actions}>
                  <button
                    onClick={() => !item.completed && handleEditTask(item)}
                    disabled={item.completed}
                    className={item.completed ? styles.disabledButton : ""}
                  >
                    <FaEdit
                      size={24}
                      color={item.completed ? "#B0B0B0" : "#3183FF"}
                    />
                  </button>
                  <button
                    onClick={() =>
                      !item.completed && confirmDeleteTask(item.id)
                    }
                    disabled={item.completed}
                    className={item.completed ? styles.disabledButton : ""}
                  >
                    <FaTrash
                      size={24}
                      color={item.completed ? "#B0B0B0" : "#FF3636"}
                    />
                  </button>
                  <button
                    onClick={() =>
                      !item.completed && handleCompleteTask(item.id)
                    }
                    disabled={item.completed}
                    className={item.completed ? styles.disabledButton : ""}
                  >
                    <FaCheck
                      size={24}
                      color={item.completed ? "#B0B0B0" : "#34A853"}
                    />
                  </button>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={`${styles.dateInfo} dateInfo`}>
                <p className="startDate">
                  <strong>Data de Início:</strong>{" "}
                  {item.startDate
                    ? new Date(item.startDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="endDate">
                  <strong>Data Prevista de Término:</strong>{" "}
                  {item.endDate
                    ? new Date(item.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
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
