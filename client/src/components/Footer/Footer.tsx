import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <img
          src="/assets/main/logo.png"
          alt="Must Movies logo"
          className={styles.logo}
        />
        <div className={styles.icons}>
          <a
            href="https://github.com/linorcohen/Must-Movies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/main/github.png"
              alt="GitHub"
              className={styles.icon}
            />
          </a>
        </div>
        <div className={styles.attribution}>
          <span className={styles.attribute}>
            Design inspiration from{" "}
            <a href="https://hatchet.com.au/case-studies/">Hatchet</a>
          </span>
          <span className={styles.attribute}>
            Movies data from{" "}
            <a href="https://www.imdb.com/">IMDB</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
