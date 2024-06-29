import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConection";
import { doc, collection, query, where, getDoc, addDoc, } from "firebase/firestore";

import Textarea from "../../components/textarea/index";

interface ITaskProps {
  item: {
    task: string;
    public: boolean;
    created: string;
    user: string;
    taskId: string;
  };
}

export default function Task({ item }: ITaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");

  const handleComment = async (event: FormEvent) => {
    event.preventDefault();

    if (input === "") {
      alert("INFORME O COMENTÁRIO")
      return
    }

    if (!session?.user?.email || !session?.user.name) return
    
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user.email,
        name: session?.user.name,
        taskId: item?.taskId,
      })

      setInput("")

    }catch(err) {
      console.log(err)
    }
    // TODO: Usar o Toastify
    alert("TESTE")
  }

  return (
    <div className={`${styles.container} container`}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={`${styles.main} main`}>
        <h1>Tarefa</h1>

        <article className={`${styles.task} task`}>
          <p>{item.task}</p>
        </article>
      </main>

      <section className={`${styles.commentsContainer} commentsContainer`}>
        <h2>Deixar comentário</h2>

        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
            placeholder="Deixe seu comentário"
          />

          <button
            className={`${styles.buttonComment} buttonComment`}
            disabled={!session?.user}
          >
            Enviar comentário
          </button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tasks", id);

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const milliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    created: new Date(milliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
    },
  };
};
