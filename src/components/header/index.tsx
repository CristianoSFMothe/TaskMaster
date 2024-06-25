import styles from "./styles.module.css"
import Link from "next/link"

const Header = () => {
  return (
    <header className={`${styles.header} header`}>
      <section className={`${styles.content} content`}>
        <nav className={`${styles.nav} nav`}>
          <Link href="/">
            <h1 className={`${styles.logo} logo`}>
              Tarefas<span>+</span>
            </h1>
          </Link>

          <Link
            href="/dashboard"
            className={`${styles.link} link`}
          >
            Meu painel
          </Link>
        </nav>

        <button className={`${styles.loginButton} loginButton`}>
          Acessar
        </button>
      </section>
    </header>
  )
}

export default Header;