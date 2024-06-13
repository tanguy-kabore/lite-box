import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, facebookProvider, googleProvider, firestore } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { GoogleLoginButton, FacebookLoginButton } from "react-social-login-buttons";
import styles from "./SignUpForm.module.css";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      // Créer un dossier racine pour cet utilisateur dans Firestore
      await createRootDirectory(userCredential.user.uid);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const createRootDirectory = async (userId) => {
    try {
      // Ajouter un nouveau dossier racine pour l'utilisateur dans Firestore
      await addDoc(collection(firestore, `users/${userId}/directories`), {
        name: "Root",
        parentId: null, // Pas de parent pour le dossier racine
      });
    } catch (err) {
      console.error("Erreur lors de la création du dossier racine :", err);
      throw err; // Propager l'erreur
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Créer un dossier racine pour cet utilisateur dans Firestore
      await createRootDirectory(userCredential.user.uid);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      // Créer un dossier racine pour cet utilisateur dans Firestore
      await createRootDirectory(userCredential.user.uid);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignUp} className={styles.form}>
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit">Sign Up</button>

      <GoogleLoginButton
        onClick={handleGoogleSignIn}
      />
      {/* <FacebookLoginButton
        onClick={handleFacebookSignIn}
      /> */}
    </form>
  );
};

export default SignUpForm;
