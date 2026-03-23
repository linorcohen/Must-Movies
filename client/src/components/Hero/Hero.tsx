import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrap}>
        <img
          src="/assets/main/iron_man.jpg"
          alt="Hero banner"
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>MUST WATCH MOVIES</h1>
        <p className={styles.subtitle}>
          Presenting you a list of movies you must watch at least once in your
          life
        </p>
        <a href="#movie-grid" className={styles.cta}>
          THE LIST
        </a>
      </div>
    </section>
  );
}
