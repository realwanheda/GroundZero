import axios from "axios";
export const api = axios.create({
  baseURL: "https://groundzero.onrender.com",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
