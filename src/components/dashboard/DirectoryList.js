// src/components/dashboard/DirectoryList.js
import React, { useState } from "react";
import DirectoryItem from "./DirectoryItem";
import styles from "./DirectoryList.module.css";

const DirectoryList = ({ directories, files, onCreate, onRename, onDelete, onDirectoryDelete, onDirectoryDownload, onDirectoryShare, onDirectoryUpload }) => {
    const [newDirName, setNewDirName] = useState("");

    const handleCreate = (parentId = null) => {
        if (newDirName.trim()) {
            onCreate(newDirName, parentId);
            setNewDirName("");
        }
    };

    return (
        <div className={styles.directoryList}>
            <div className={styles.createDirectory}>
                <input
                    type="text"
                    value={newDirName}
                    onChange={(e) => setNewDirName(e.target.value)}
                    placeholder="New Directory Name"
                    className={styles.input}
                />
                <button onClick={() => handleCreate()} className={styles.button}>Create</button>
            </div>
            {directories.map((directory) => (
                <DirectoryItem
                    key={directory.id}
                    directory={directory}
                    files={files.filter(file => file.directoryId === directory.id)}
                    onRename={onRename}
                    onDelete={onDelete}
                    onDirectoryDelete={onDirectoryDelete}
                    onDirectoryDownload={onDirectoryDownload}
                    onDirectoryShare={onDirectoryShare}
                    onDirectoryUpload={onDirectoryUpload}
                />
            ))}
        </div>
    );
};

export default DirectoryList;
