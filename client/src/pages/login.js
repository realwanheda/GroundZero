import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import styles from "./login.module.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import loginPic from "../assets/loginpic.png"; // Importing the image
import mortyPic from "../assets/morty.png";

import { api } from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const loginUser = async (res) => {
    const { name, email, picture } = jwtDecode(res.credential);
    localStorage.setItem("userInfo", JSON.stringify({ name, email, picture }));

    const response = await api.post("/api/user/register", {
      name,
      email,
      picture,
    });

    if (response.status === 200 || response.status === 201) {
      console.log(response.data);
      localStorage.setItem("token", response.data.data._id);
      navigate("/dashboard");
    }
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeText}>Welcome to Ground Zero</h1>
      <div className={styles.content}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            loginUser(credentialResponse);
          }}
          size="large"
          theme="filled_black"
          type="standard"
          shape="pill"
          width="400px"
          // height="5000px"
          onError={() => {
            console.log("Login Failed");
          }}
          useOneTap
        />
      </div>
      <div className={styles.imageContainer}>
        <img src={loginPic} alt="Login Pic" className={styles.loginPic} />
        <img src={mortyPic} alt="Morty" className={styles.morty} />
      </div>
    </div>
  );
}
