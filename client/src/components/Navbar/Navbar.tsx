import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const NAV_HIDE_THRESHOLD = 20;
const NAV_BG_THRESHOLD = 500;

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
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
          <a href="#about_section">ABOUT</a>
        </li>
        <li>
          <a href="#contact_section">CONTACT</a>
        </li>
      </ul>
    </nav>
  );
}
