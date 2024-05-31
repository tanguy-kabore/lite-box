"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/dashboard/Navbar";
import { useRouter } from "next/navigation"; // Utilisez `next/navigation` au lieu de `next/router`
import { auth, storage } from "../../firebase/config"; // Importez la configuration Firebase
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./Profile.module.css"; // Créez ce fichier CSS pour styliser le formulaire

const Profile = () => {
    const router = useRouter();
    const user = auth.currentUser;

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user) {
            router.push("/signin");
        }
    }, [user, router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            let updatedPhotoURL = photoURL;

            if (photoFile) {
                const storageRef = ref(storage, `profilePictures/${user.uid}`);
                console.log("Uploading file to:", storageRef);
                const snapshot = await uploadBytes(storageRef, photoFile);
                console.log("File uploaded:", snapshot);
                updatedPhotoURL = await getDownloadURL(snapshot.ref);
                console.log("Download URL:", updatedPhotoURL);
            }

            await updateProfile(user, { displayName, photoURL: updatedPhotoURL });
            console.log("Profile updated");
            router.push("/dashboard");
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(`Error updating profile: ${err.message}`);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
            setPhotoURL(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <Navbar user={user} router={router} />
            <div className={styles.profileDiv}>
                <div className={styles.profileContainer}>
                    <h2 className={styles.profileTitle}>Profile</h2>
                    <form onSubmit={handleUpdateProfile} className={styles.form}>
                        <div className={styles.photoContainer}>
                            <img
                                src={photoURL || "/default-profile.png"}
                                alt="Profile"
                                className={styles.profileImage}
                                onClick={handlePhotoClick}
                            />
                            <input
                                type="file"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: "none" }}
                            />
                        </div>
                        <label className={styles.formLabel}>
                            Display Name:
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className={styles.formInput}
                            />
                        </label>
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.formButton}>Update Profile</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
