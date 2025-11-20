// lib/uploadClient.ts
import axios from "axios";

const uploadClient = axios.create({
  baseURL: 
    process.env.NODE_ENV === "production"
      ? "https://exact-fit-server.vercel.app"  // Live URL (no /api/admin)
      : "http://localhost:4446",                 // Local dev
  timeout: 30000,
  withCredentials: true, // if you use cookies/auth
});

export default uploadClient;