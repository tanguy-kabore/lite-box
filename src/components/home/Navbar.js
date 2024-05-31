// src/components/Navbar.js
"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Lite-Box</Link>
      </div>
      <div className={styles.links}>
        <Link href="/signup">Sign Up</Link>
        <Link href="/signin">Sign In</Link>
      </div>
    </nav>
  );
};

export default Navbar;