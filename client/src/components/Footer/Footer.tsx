import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.item}>
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
          <span className={styles.attribute}>
            Design inspiration from{" "}
            <a href="https://hatchet.com.au/case-studies/">Hatchet</a>
          </span>
          <span className={styles.attribute}>
            Movies data from{" "}
            <a href="https://www.imdb.com/">IMDB</a>
          </span>
        </div>

        <div className={styles.item} id="about_section">
          <h4 className={styles.heading}>ABOUT US</h4>
          <p className={styles.paragraph}>
            Must Watch Movies is a curated collection of films you should see at
            least once in your life.
          </p>
        </div>

        <div className={styles.item} id="contact_section">
          <h4 className={styles.heading}>CONTACT</h4>
          <span className={styles.contact}>Tel-Aviv, Israel</span>
          <span className={styles.contact}>contact@example.com</span>
          <span className={styles.contact}>+972 00-000-0000</span>
        </div>
      </div>
    </footer>
  );
}
