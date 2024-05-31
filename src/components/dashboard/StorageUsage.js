import React from "react";
import styles from "./StorageUsage.module.css";

const StorageUsage = ({ storageUsed, storageLimit }) => {
    const percentageUsed = (storageUsed / storageLimit) * 100;

    return (
        <div className={styles.storageUsageContainer}>
            <p>Storage Used: {storageUsed.toFixed(2)} MB / {storageLimit} MB</p>
            <div className={styles.storageBar}>
                <div
                    className={styles.storageUsed}
                    style={{ width: `${percentageUsed}%` }}
                />
            </div>
        </div>
    );
};

export default StorageUsage;
