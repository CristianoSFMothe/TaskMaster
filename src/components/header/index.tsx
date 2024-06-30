import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react";
import { FiUser } from "react-icons/fi";
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

        {status === "loading" ? (
          <></>
        ) : session ? (
          <div className={styles.userSection}>
            <button
              className={`${styles.loginButton} loginButton`}
              onClick={() => signOut()}
            >
              Olá {session?.user?.name}
              {session?.user?.image ? (
                <Image
                  src={session?.user?.image}
                  alt="User Avatar"
                  className={styles.avatar}
                  width={40}
                  height={40}
                />
              ) : (
                <FiUser size={40} className={styles.defaultAvatar} />
              )}
            </button>
          </div>
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
