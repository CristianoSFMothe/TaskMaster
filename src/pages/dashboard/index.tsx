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

  async function handlerRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;

    try {
      if (isEditing && currentTaskId) {
        const docRef = doc(db, "tasks", currentTaskId);
        await updateDoc(docRef, {
          task: input,
          public: publicTask,
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
      }

      setInput("");
      setPublicTask(false);
    } catch (err) {
      console.log(err);
    }
  }

  const handlerShare = async (id: string) => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );
    // TODO: Usar o Toastify
    alert("URL Copiada com sucesso!");
  };

  const handlerDeleteTask = async (id: string) => {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
    // TODO: Usar o Toastify
    console.log("Tarefa removida");
  };

  const handlerEditTask = (task: ITasksProps) => {
    setInput(task.task);
    setPublicTask(task.public);
    setIsEditing(true);
    setCurrentTaskId(task.id);
  };

  const handlerCancelEdit = () => {
    setIsEditing(false);
    setCurrentTaskId(null);
    setInput("");
    setPublicTask(false);
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
              onSubmit={handlerRegisterTask}
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
                {isEditing ? "Atualizar Tarefa" : "Registrar"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className={`${styles.buttonCancel} buttonCancel`}
                  onClick={handlerCancelEdit}
                >
                  Cancelar Edição
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
                    onClick={() => handlerShare(item.id)}
                  >
                    <FiShare2 size={12} color="#3183FF" />
                  </button>
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

                <div className={`${styles.taskActions} taskActions`}>
                  <button
                    className={`${styles.editButton} editButton`}
                    onClick={() => handlerEditTask(item)}
                  >
                    <FaEdit size={24} color="#007bff" />
                  </button>
                  <button
                    className={`${styles.trashButton} trashButton`}
                    onClick={() => handlerDeleteTask(item.id)}
                  >
                    <FaTrash size={24} color="#EA3140" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
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
