import { GetStaticProps } from "next";
import Head from "next/head";
import styles from "../../styles/home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConection";

interface IHomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: IHomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>TaskMaster+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={`${styles.main} main`}>
        <div className={`${styles.logoContent}`}>
          <Image
            className={`${styles.hero} hero`}
            alt="Logo TaskMaster+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={`${styles.title}`}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={`${styles.infoContent} infoContent`}>
          <section className={styles.box}>
            <span className="post">+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span className="comments">+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tasks");

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60
  };
};
