// src/app/page.js
"use client";

import { useRouter } from "next/navigation"; // Utilisez `next/navigation` pour la navigation côté client
import Navbar from "../components/home/Navbar";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter(); // Utilisation de useRouter pour la navigation côté client

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handlePayment = () => {
    router.push("/payment");
  };

  return (
    <main className={styles.main}>
      <Navbar />
      <header className={styles.header}>
        <h1>Welcome to Lite-Box</h1>
        <p>Your modern cloud storage solution. Securely store, manage, and share your files.</p>
        <p>Sign up now and get started with our free plan!</p>
      </header>
      <section className={styles.pricingSection}>
        <h2>Our Plans</h2>
        <div className={styles.pricingContainer}>
          <div className={styles.plan}>
            <h3>Free Plan</h3>
            <p>0 XOF/month</p>
            <ul>
              <li>100 MB Storage</li>
              <li>Basic Support</li>
              <li>Access to basic features</li>
            </ul>
            <button onClick={handleSignUp}>Sign Up</button>
          </div>
          <div className={styles.plan}>
            <h3>Premium Plan</h3>
            <p>5000 XOF/month</p>
            <ul>
              <li>1 GB Storage</li>
              <li>Priority Support</li>
              <li>Access to all features</li>
            </ul>
            <button onClick={handlePayment}>Get Premium</button>
          </div>
        </div>
      </section>
    </main>
  );
}
