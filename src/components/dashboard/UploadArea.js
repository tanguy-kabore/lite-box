import React, { useRef } from "react";
import styles from "./UploadArea.module.css";

const UploadArea = ({ onFileUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            className={styles.uploadArea}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleUploadAreaClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={styles.fileInput}
                style={{ display: 'none' }} // Hide the file input element
            />
            <p>Drag & Drop files here or click to upload</p>
        </div>
    );
};

export default UploadArea;
