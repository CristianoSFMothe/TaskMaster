import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./styles.module.css";
import Link from "next/link";

const Header = () => {
  const { data: session, status } = useSession();

  return (
    <header className={`${styles.header} header`}>
      <section className={`${styles.content} content`}>
        <nav className={`${styles.nav} nav`}>
          <Link href="/">
            <h1 className={`${styles.logo} logo`}>
            TaskMaster<span>+</span>
            </h1>
          </Link>

          {session?.user && (
            <Link href="/dashboard" className={`${styles.link} link`}>
              Meu painel
            </Link>
          )}
        </nav>

        {status == "loading" ? (
          <></>
        ) : session ? (
          <button
            className={`${styles.loginButton} loginButton`}
            onClick={() => signOut()}
          >
            Olá {session?.user?.name}
          </button>
        ) : (
          <button
            className={`${styles.loginButton} loginButton`}
            onClick={() => signIn("google")}
          >
            Acessar
          </button>
        )}
      </section>
    </header>
  );
};

export default Header;
