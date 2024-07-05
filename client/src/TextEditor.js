import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import "./styles.css";
import { useParams } from "react-router-dom";
import { api } from "./api";
import { useNavigate } from "react-router-dom";

const SAVE_INTERVAL_MS = 2000; // Interval for saving document changes
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]; // Quill toolbar options

function TextEditor() {
  const navigate = useNavigate();

  const { id: documentId } = useParams(); // Extracting document ID from URL params
  const [socket, setSocket] = useState(); // Socket.io client instance
  const [quill, setQuill] = useState();
  const [title, setTitle] = useState("");
  const userId = localStorage.getItem("token");

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      const loadedTitle = document.title || "Untitled Document";
      setTitle(loadedTitle);
      console.log(document.title);
      quill.setContents(document.data);
      quill.enable();
    });
    socket.emit("get-document", documentId, userId);
  }, [socket, quill, documentId, userId]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents(), title);
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill, title]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable(); // Disable editor until document content is loaded
    q.setText("Loading..."); // Display loading message
    setQuill(q);
  }, []);

  useEffect(() => {
    // Create bubbles dynamically
    const createBubble = () => {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      bubble.style.width = `${Math.random() * 30 + 10}px`; // Random size between 10px and 40px
      bubble.style.height = bubble.style.width;
      bubble.style.borderRadius = "50%"; // Make it round
      bubble.style.background = "rgba(255, 255, 255, 0.2)"; // Semi-transparent white
      bubble.style.position = "absolute";

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;

      // document.querySelector(".bubbles-container").appendChild(bubble);
    };

    for (let i = 0; i < 30; i++) {
      createBubble();
    }
  }, []);
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  const handleShare = () => {
    const email = prompt("Enter email to share:");
    if (email) {
      const url = `${window.location.origin}/document/${documentId}`;
      // You can use an email service or API to send the email with the document link
      alert(`Sharing document link: ${url} with ${email}`);
      sendSharedDocument(email, url); // Send the email with the document link (see next step
    }
  };
  const sendSharedDocument = async (email, documentUrl) => {
    try {
      const response = await api.post("/api/user/send-email", {
        email,
        url: documentUrl,
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="editor-container">
      <div className="title-and-button-container">
        <input
          type="text"
          placeholder="Enter document title"
          value={title}
          onChange={handleTitleChange}
          className="title-input"
        />
        {/* Update navigate to go to the dashboard */}
        <button className="home-button" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
        <button className="share-button" onClick={handleShare}>
        Share
      </button>
      </div>
      {/* <div className="bubbles-container"></div> */}
      <div className="quill-container" ref={wrapperRef}></div>
      {/* <button className="share-button" onClick={handleShare}>
        Share
      </button> */}
    </div>
  );
}
export default TextEditor;
