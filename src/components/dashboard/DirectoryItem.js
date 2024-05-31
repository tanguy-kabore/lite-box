"use client";

import React, { useState } from "react";
import { FiFolder, FiEdit, FiTrash2, FiDownload, FiShare2, FiChevronDown, FiChevronRight, FiUpload } from "react-icons/fi";
import { Modal, Button, Form } from 'react-bootstrap';
import styles from "./DirectoryItem.module.css";
import { useRouter } from "next/navigation";
import FileItem from "./FileItem";

const DirectoryItem = ({ directory, files = [], onRename, onDelete, onDirectoryDelete, onDirectoryDownload, onDirectoryShare, onDirectoryUpload }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(directory.name);
    const [expanded, setExpanded] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const router = useRouter();

    const handleRename = () => {
        setShowRenameModal(true);
    };

    const handleRenameSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update the local state
            onRename(directory.id, newName);

            setIsEditing(false);
            setShowRenameModal(false);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleDelete = () => {
        onDirectoryDelete(directory.id);
    };

    const handleDownload = () => {
        onDirectoryDownload(directory.id);
    };

    const handleShare = () => {
        onDirectoryShare(directory.id);
    };

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const handleUpload = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUploadSubmit = async () => {
        if (selectedFile) {
            await onDirectoryUpload(selectedFile, directory.id);
            setSelectedFile(null);
            setShowUploadModal(false);
        }
    };

    return (
        <div className={styles.directoryItem}>
            <div className={styles.header} onClick={handleExpand}>
                {expanded ? <FiChevronDown /> : <FiChevronRight />}
                <FiFolder className={styles.icon} />
                <span>{directory.name}</span>
                {/* <span onClick={handleNavigate}>{directory.name}</span> */}
                <div className={styles.actions}>
                    <FiEdit onClick={handleRename} className={styles.icon} />
                    <FiUpload onClick={() => setShowUploadModal(true)} className={styles.icon} />
                    <FiDownload onClick={handleDownload} className={styles.icon} />
                    <FiShare2 onClick={handleShare} className={styles.icon} />
                    <FiTrash2 onClick={handleDelete} className={styles.icon} />
                </div>
            </div>

            {expanded && files.length > 0 && (
                <div className={styles.files}>
                    {files.map(file => (
                        <FileItem key={file.id} file={file} onDelete={() => onDelete(file.id, file.name)} />
                    ))}
                </div>
            )}

            {/* Rename Modal */}
            <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rename Directory</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRenameSubmit}>
                        <Form.Group controlId="formDirectoryName">
                            <Form.Label>New Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className={styles.divButton}>
                            <Button variant="primary" type="submit">
                                Save
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Upload Modal */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFileUpload">
                            <Form.Label>Select File</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleUpload}
                                required
                            />
                        </Form.Group>
                        <div className={styles.divButton}>
                            <Button variant="primary" onClick={handleUploadSubmit}>
                                Upload
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DirectoryItem;