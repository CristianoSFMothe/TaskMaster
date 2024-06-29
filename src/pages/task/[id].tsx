import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConection";
import { doc, collection, query, where, getDoc } from "firebase/firestore";

import Textarea  from '../../components/textarea/index';

interface ITaskProps {
  item: {
    task: string;
    public: boolean;
    created: string;
    user: string;
    taskId: string;
  }
}

export default function Task({ item }: ITaskProps) {
  return (
    <div className={`${styles.container} container`}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={`${styles.main} main`}>
        <h1>Tarefa</h1>

        <article className={`${styles.task} task`}>
          <p>
            {item.task}
          </p>
        </article>
      </main>

      <section className={`${styles.commentsContainer} commentsContainer`}>
        <h2>Deixar comentário</h2>

        <form action="">
          <Textarea
            placeholder="Deixe seu comentário"
          />

          <button className={`${styles.buttonComment} buttonComment`}>
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

  const snapshot = await getDoc(docRef)

  if(snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      }
    }
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      }
    }
  }

  const milliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    created: new Date(milliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id
  }

  return {
    props: {
      item: task
    },
  };
};
