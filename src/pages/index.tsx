import Head from "next/head";
import styles from "../../styles/home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={`${styles.main} main`}>
        <div className={`${styles.logoContent}`}>
          <Image
            className={`${styles.hero} hero`}
            alt="Logo Tarefas+"
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
            <span className="post">+12 posts</span>
          </section>
          <section className={styles.box}>
            <span className="comments">+90 comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}