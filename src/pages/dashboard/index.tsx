import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import Textarea from "../../components/textarea";
import { FiShare2 } from "react-icons/fi"
import { FaTrash} from "react-icons/fa"

const Dashboard = () => {
  return (
    <div className={`${styles.container} container`}>
      <Head>
        <title>Meu painel de tarefa</title>
      </Head>

      <main className={`${styles.main} main`}>

        <section className={`${styles.content} content`}>

          <div className={`${styles.contentForm} contentForm`}>

            <h1 className={`${styles.title} title`}>Qual sua tarefa?</h1>

            <form className={`${styles.form} form`} action="">

              <Textarea 
                placeholder="Digite qual a sua tarefa..."
              />

              <div className={`${styles.checkboxArea} checkboxArea`}>
                <input type="checkbox" className={`${styles.checkbox} checkbox`} />
                <label>Deixar tarefa pública?</label>
              </div>

              <button type="submit" className={`${styles.buttonSubmit} buttonSubmit`}>
                Registrar
              </button>

            </form>

          </div>

        </section>

        <section className={`${styles.taskContainer} taskContainer`}>

          <h1>Minhas tarefas</h1>

          <article className={`${styles.task} task`}>
            <div className={`${styles.tagContainer} tagContainer`}>
              <label className={`${styles.tag} tag`}>PÚBLICO</label>

              <button className={`${styles.shareButton} shareButton`}>
                <FiShare2 
                  size={12}
                  color="#3183FF"
                />
              </button>

            </div>

            <div className={`${styles.taskContent} taskContent`}>
              <p>Estudar JavasScript e NodeJs</p>
              <button className={`${styles.trashButton} trashButton`}>
                <FaTrash 
                  size={24}
                  color="#EA3140"
                />
              </button>
            </div>

          </article>

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
    props: {},
  };
};
