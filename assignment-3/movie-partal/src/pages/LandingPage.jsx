import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

const HOLES = Array(12).fill(0);

function LandingPage() {
  const [fading, setFading] = useState(false);
  const navigate = useNavigate();

  function handleEnter() {
    setFading(true);
    setTimeout(() => navigate("/movies"), 580);
  }

  return (
    <div className={`${styles.page} ${fading ? styles.fadeOut : ""}`}>
      <div className={styles.glow} style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(139,26,42,0.28) 0%, transparent 70%)", top: "-15%", left: "-18%" }} />
      <div className={styles.glow} style={{ width: 550, height: 550, background: "radial-gradient(circle, rgba(201,168,76,0.11) 0%, transparent 70%)", bottom: "-10%", right: "5%" }} />
      <div className={styles.glow} style={{ width: 350, height: 350, background: "radial-gradient(circle, rgba(139,26,42,0.14) 0%, transparent 70%)", top: "30%", right: "15%" }} />

      <div className={styles.inner}>
        <div className={styles.strip} style={{ marginBottom: 36 }}>
          {HOLES.map((_, i) => <div key={i} className={styles.hole} />)}
        </div>

        <div className={styles.badge}>Est. · MMX · VII</div>
        <div className={styles.rule} style={{ marginBottom: 28 }} />

        <h1 className={styles.titleMain}>The Grand</h1>
        <h1 className={styles.titleSub}>Cinémathèque</h1>

        <div className={styles.rule} style={{ marginBottom: 28 }} />

        <p className={styles.tagline}>
          A curated passage through the world's<br />most celebrated moving pictures
        </p>

        <button className={styles.enterBtn} onClick={handleEnter}>
          Enter the Theatre
        </button>

        <div className={styles.strip} style={{ marginTop: 52 }}>
          {HOLES.map((_, i) => <div key={i} className={styles.hole} />)}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
