// src/app/page.js
// Activer le mode client-side rendering
"use client";

// Importer le hook useRouter de Next.js pour la navigation
import { useRouter } from "next/navigation";
// Importer le composant Navbar
import Navbar from "../components/home/Navbar";
// Importer les styles pour la page
import styles from "./page.module.css";

// Définir le composant fonctionnel Home
export default function Home() {
  // Utiliser le hook useRouter pour obtenir l'objet router
  const router = useRouter();

  // Fonction pour rediriger l'utilisateur vers la page d'inscription
  const handleSignUp = () => {
    router.push("/signup");
  };

  // Fonction pour rediriger l'utilisateur vers la page de paiement
  const handlePayment = () => {
    router.push("/");
  };

  // Rendre le contenu de la page
  return (
    <main className={styles.main}>
      {/* Inclure la barre de navigation */}
      <Navbar />
      {/* Section d'en-tête de la page */}
      <header className={styles.header}>
        <h1>Welcome to Lite-Box</h1>
        <p>Your modern cloud storage solution. Securely store, manage, and share your files.</p>
        <p>Sign up now and get started with our free plan!</p>
      </header>
      {/* Section des plans tarifaires */}
      <section className={styles.pricingSection}>
        <h2>Our Plans</h2>
        <div className={styles.pricingContainer}>
          {/* Plan gratuit */}
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
          {/* Plan premium */}
          <div className={styles.plan}>
            <h3>Premium Plan: Coming soon</h3>
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
