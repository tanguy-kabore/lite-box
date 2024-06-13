"use client";

// Dashboard.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { auth, storage, firestore } from "../../firebase/config";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import FileItem from "../../components/dashboard/FileItem";
import UploadArea from "../../components/dashboard/UploadArea";
import StorageUsage from "../../components/dashboard/StorageUsage";
import DirectoryList from "./DirectoryList";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const router = useRouter();
    const user = auth.currentUser;

    const [directories, setDirectories] = useState([]);
    const [files, setFiles] = useState([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const storageLimit = 100; // Set storage limit in MB
    const storage = getStorage();

    useEffect(() => {
        if (user) {
            fetchDirectories();
            fetchFiles();
            calculateStorageUsed();
        } else {
            router.push("/signin");
        }
    }, [user, router]);

    const fetchDirectories = async () => {
        const querySnapshot = await getDocs(collection(firestore, `users/${user.uid}/directories`));
        const dirs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDirectories(dirs);
    };

    const fetchFiles = async () => {
        const querySnapshot = await getDocs(collection(firestore, `users/${user.uid}/files`));
        const filesList = [];
        querySnapshot.forEach(doc => {
            filesList.push({ id: doc.id, ...doc.data() });
        });
        setFiles(filesList);
    };

    const calculateStorageUsed = async () => {
        const querySnapshot = await getDocs(collection(firestore, `users/${user.uid}/files`));
        let totalSize = 0;
        querySnapshot.forEach(doc => {
            totalSize += doc.data().size;
        });
        setStorageUsed(totalSize / (1024 * 1024)); // Convert bytes to MB
    };

    const handleFileUpload = async (file, directoryId = null) => {
        // Vérifie si l'espace de stockage utilisé après l'ajout du nouveau fichier dépasse la limite de stockage
        if (storageUsed + file.size / (1024 * 1024) > storageLimit) {
            alert("Storage limit exceeded. Cannot upload file."); // Affiche une alerte si la limite de stockage est dépassée
            return; // Arrête l'exécution de la fonction
        }

        // Crée une référence de fichier dans le stockage Firebase pour l'utilisateur actuel
        const fileRef = ref(storage, `users/${user.uid}/files/${file.name}`);

        // Télécharge le fichier dans le stockage Firebase
        await uploadBytes(fileRef, file);

        // Récupère l'URL de téléchargement du fichier téléchargé
        const downloadURL = await getDownloadURL(fileRef);

        // Ajoute un document dans Firestore avec les informations du fichier
        await addDoc(collection(firestore, `users/${user.uid}/files`), {
            name: file.name, // Nom du fichier
            size: file.size, // Taille du fichier
            type: file.type, // Type MIME du fichier
            url: downloadURL, // URL de téléchargement
            directoryId: directoryId, // ID du répertoire (peut être null)
        });

        // Rafraîchit la liste des fichiers
        fetchFiles();

        // Recalcule l'espace de stockage utilisé
        calculateStorageUsed();
    };


    const handleFileDelete = async (fileId, fileName) => {
        const fileRef = ref(storage, `users/${user.uid}/files/${fileName}`);

        // Vérifier si le fichier existe avant de tenter de le supprimer
        try {
            await getDownloadURL(fileRef);
            // Le fichier existe, donc on peut le supprimer
            await deleteObject(fileRef);
            await deleteDoc(doc(firestore, `users/${user.uid}/files`, fileId));
            fetchFiles();
            calculateStorageUsed();
        } catch (error) {
            // Le fichier n'existe pas, donc il a probablement déjà été supprimé
            console.log("File does not exist or has already been deleted");
        }
    };

    const handleDirectoryRename = async (directoryId, newName) => {
        const directoryRef = doc(firestore, `users/${user.uid}/directories`, directoryId);
        await updateDoc(directoryRef, { name: newName });
        fetchDirectories(); // Rafraîchir la liste des répertoires après la modification
    };

    const handleDirectoryCreate = async (name, parentId = null) => {
        const directoryRef = await addDoc(collection(firestore, `users/${user.uid}/directories`), {
            name: name,
            parentId: parentId,
        });
        fetchDirectories(); // Rafraîchir la liste des répertoires après la création
        return directoryRef.id; // Retourner l'ID du répertoire créé
    };

    const handleDirectoryDelete = async (directoryId) => {
        const dirRef = doc(firestore, `users/${user.uid}/directories`, directoryId);
        await deleteDoc(dirRef);

        // Delete all files in the directory
        const filesToDelete = files.filter(file => file.directoryId === directoryId);
        filesToDelete.forEach(async file => {
            await handleFileDelete(file.id, file.name);
        });

        // Delete all subdirectories
        const subDirsToDelete = directories.filter(dir => dir.parentId === directoryId);
        subDirsToDelete.forEach(async subDir => {
            await handleDirectoryDelete(subDir.id);
        });

        fetchDirectories();
        fetchFiles();
        calculateStorageUsed();
    };
    const handleDownload = async (file) => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        link.target = "_blank"; // Ouvre le lien dans un nouvel onglet
        link.rel = "noopener noreferrer"; // Sécurité recommandée pour les liens ouverts dans un nouvel onglet
        document.body.appendChild(link); // Ajouter le lien au DOM
        link.click();
        document.body.removeChild(link); // Retirer le lien du DOM après le clic
    };

    const onDirectoryDownload = async (directoryId) => {
        const dirRef = doc(firestore, `users/${user.uid}/directories`, directoryId);

        // Récupérer les fichiers dans le répertoire à télécharger
        const filesToDownload = files.filter(file => file.directoryId === directoryId);

        // Créer une instance JSZip
        const zip = new JSZip();

        // Ajouter chaque fichier à l'archive
        filesToDownload.forEach(async (file) => {
            const blob = await fetch(file.url).then(response => response.blob());
            zip.file(file.name, blob);
        });

        // Générer l'archive RAR
        zip.generateAsync({ type: 'blob' }).then((content) => {
            // Créer un lien de téléchargement pour l'archive
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'archive.rar';
            link.click();
        });
    };


    const onDirectoryShare = async (directoryId) => {
        // Récupérer le lien de téléchargement de l'archive depuis Firebase Storage
        const storageRef = ref(storage, `archives/${directoryId}/archive.rar`);
        const downloadURL = await getDownloadURL(storageRef);

        // Afficher le lien de téléchargement
        console.log("Lien de téléchargement de l'archive:", downloadURL);
        // Vous pouvez maintenant partager ce lien avec les utilisateurs de votre application

        // Copier le lien de téléchargement dans le presse-papiers
        navigator.clipboard.writeText(downloadURL)
            .then(() => {
                console.log('Lien de téléchargement copié dans le presse-papiers :', downloadURL);
                // Vous pouvez afficher un message de confirmation ici si nécessaire
                alert("Link copied to clipboard!");
            })
            .catch((error) => {
                console.error('Erreur lors de la copie du lien de téléchargement :', error);
                // Gérer les erreurs de copie du lien de téléchargement ici
            });
    };

    return (
        // Conteneur principal du tableau de bord, avec des styles appliqués
        <div className={styles.dashboard}>
            {/* Titre du tableau de bord */}
            <h1>Dashboard</h1>

            {/* Zone de téléchargement de fichiers, avec un gestionnaire pour le téléchargement des fichiers */}
            <UploadArea onFileUpload={handleFileUpload} />

            {/* Composant affichant l'utilisation du stockage, avec les valeurs de stockage utilisées et la limite de stockage */}
            <StorageUsage storageUsed={storageUsed} storageLimit={storageLimit} />

            {/* Liste des répertoires et des fichiers, avec divers gestionnaires pour les opérations sur les répertoires et les fichiers */}
            <DirectoryList
                directories={directories}
                files={files}
                onCreate={handleDirectoryCreate} // Gestionnaire pour la création de répertoires
                onDirectoryDelete={handleDirectoryDelete} // Gestionnaire pour la suppression de répertoires
                onDirectoryDownload={onDirectoryDownload} // Gestionnaire pour le téléchargement de répertoires
                onDirectoryShare={onDirectoryShare} // Gestionnaire pour le partage de répertoires
                onDirectoryUpload={handleFileUpload} // Gestionnaire pour le téléchargement de fichiers dans un répertoire
                onFileDelete={handleFileDelete} // Gestionnaire pour la suppression de fichiers
                onDelete={handleFileDelete} // Gestionnaire pour la suppression de fichiers (redondant avec onFileDelete)
                onRename={handleDirectoryRename} // Gestionnaire pour le renommage de répertoires
            />

            {/* Liste des fichiers qui ne sont pas dans un répertoire spécifique */}
            <div className={styles.fileList}>
                {files
                    .filter(file => file.directoryId === null) // Filtre les fichiers qui ne sont pas dans un répertoire
                    .map(file => (
                        // Composant pour chaque fichier, avec un gestionnaire pour la suppression des fichiers
                        <FileItem
                            key={file.id}
                            file={file}
                            onDelete={() => handleFileDelete(file.id, file.name)}
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default Dashboard;