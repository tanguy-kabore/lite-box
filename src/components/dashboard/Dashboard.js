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
        if (storageUsed + file.size / (1024 * 1024) > storageLimit) {
            alert("Storage limit exceeded. Cannot upload file.");
            return;
        }

        const fileRef = ref(storage, `users/${user.uid}/files/${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        await addDoc(collection(firestore, `users/${user.uid}/files`), {
            name: file.name,
            size: file.size,
            type: file.type,
            url: downloadURL,
            directoryId: directoryId,
        });
        fetchFiles();
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
        <div className={styles.dashboard}>
            <h1>Dashboard</h1>
            <UploadArea onFileUpload={handleFileUpload} />
            <StorageUsage storageUsed={storageUsed} storageLimit={storageLimit} />
            <DirectoryList
                directories={directories}
                files={files}
                onCreate={handleDirectoryCreate}
                onDirectoryDelete={handleDirectoryDelete}
                onDirectoryDownload={onDirectoryDownload}
                onDirectoryShare={onDirectoryShare}
                onDirectoryUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                onDelete={handleFileDelete}
                onRename={handleDirectoryRename}
            />

            <div className={styles.fileList}>
                {files
                    .filter(file => file.directoryId === null)
                    .map(file => (
                        <FileItem key={file.id} file={file} onDelete={() => handleFileDelete(file.id, file.name)} />
                    ))
                }
            </div>

        </div>
    );
};

export default Dashboard;