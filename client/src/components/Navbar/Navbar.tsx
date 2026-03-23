import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PopupModal } from "../PopupModal/PopupModal";
import styles from "./Navbar.module.css";

const NAV_HIDE_THRESHOLD = 20;
const NAV_BG_THRESHOLD = 500;

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const prevScroll = useRef(0);

  useEffect(() => {
    function onScroll() {
      const current = window.scrollY;
      setHidden(current > NAV_HIDE_THRESHOLD && current > prevScroll.current);
      setSolid(current > NAV_BG_THRESHOLD);
      prevScroll.current = current;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`${styles.nav} ${hidden ? styles.hidden : ""} ${solid ? styles.solid : ""}`}
      >
        <Link to="/">
          <img
            src="/assets/main/logo.png"
            alt="Must Movies logo"
            className={styles.logo}
          />
        </Link>
        <ul className={styles.links}>
          <li>
            <button onClick={() => setAboutOpen(true)} className={styles.navButton}>
              ABOUT
            </button>
          </li>
          <li>
            <button onClick={() => setContactOpen(true)} className={styles.navButton}>
              CONTACT
            </button>
          </li>
        </ul>
      </nav>

      <PopupModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="ABOUT US">
        <p>
          Must Watch Movies is a curated collection of films you should see at
          least once in your life.
        </p>
        <p>
          From timeless classics to modern masterpieces, each movie has been
          carefully selected to offer an unforgettable cinematic experience.
        </p>
      </PopupModal>

      <PopupModal isOpen={contactOpen} onClose={() => setContactOpen(false)} title="CONTACT">
        <p><strong>Location:</strong> Tel-Aviv, Israel</p>
        <p><strong>Email:</strong> contact@example.com</p>
        <p><strong>Phone:</strong> +972 00-000-0000</p>
      </PopupModal>
    </>
  );
}
