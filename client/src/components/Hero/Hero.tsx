import styles from "./Hero.module.css";

interface HeroProps {
  onShowList?: () => void;
}

export function Hero({ onShowList }: HeroProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onShowList) {
      e.preventDefault();
      onShowList();
    }
  };

  return (
    <section className={styles.hero}>
      <div className={`${styles.imageWrap} heroBackground`}>
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
        <button onClick={handleClick} className={styles.cta}>
          THE LIST
        </button>
      </div>
    </section>
  );
}
