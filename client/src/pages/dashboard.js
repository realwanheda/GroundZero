import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./dashboard.module.css";
import { api } from "../api";
import docsImage from "../assets/docs.png"; // Assuming the image file is located in the assets folder

function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Retrieve user information from local storage upon component mount
    (async () => {
      try {
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        }
        const response = await api.post("/api/user/getDocuments", {
          userId: localStorage.getItem("token"),
        });

        if (response.status === 200 || response.status === 201) {
          setDocuments(response.data.data.documents);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleDocumentClick = (documentId) => {
    console.log(documentId);
    // Navigate to the document's URL
    navigate(`/document/${documentId}`);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await api.delete(`/api/user/document/${documentId}`);
      if (response.status === 200) {
        // Filter out the deleted document from the documents array
        setDocuments(documents.filter((doc) => doc._id !== documentId));
        console.log("Document deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {userInfo && (
        <div className={styles.userInfo}>
          <img src={userInfo.picture} alt="User Avatar" />
          <div>
            <h2>Welcome, {userInfo.name}</h2>
            <p>Email: {userInfo.email}</p>
          </div>
        </div>
      )}
      <button
        className={styles.dashboardButton}
        onClick={() => navigate("/document")}
      >
        New Document
      </button>

      <div className={styles.documentsContainer}>
        <div className={styles.documentsList}>
          {documents.map((document) => (
            <div key={document._id} className={styles.documentCard}>
              <div
                className={styles.documentInfo}
                
              >
                <h3>{document.title}</h3>
                <img src={docsImage} alt={document.title} onClick={() => handleDocumentClick(document._id)} />
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteDocument(document._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
