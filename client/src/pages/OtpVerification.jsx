// src/pages/OtpVerification.jsx
import React, { useState } from "react";
import api from "../api"; // Axios instance with baseURL

export default function OtpVerification() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("register"); // 'register' or 'verify'

  // 1️⃣ Send OTP
  const sendOtp = async () => {
    try {
      const res = await api.post("/auth/send-otp", { name, email, password });
      setMessage(res.data.message);
      setStep("verify");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  // 2️⃣ Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
      // Optionally, store token and user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Registration complete! You can now login.");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>NEC Canteen Registration</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      {step === "register" && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <input
            type="email"
            placeholder="Email (@nec.edu.in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <button onClick={sendOtp} style={{ width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "5px" }}>
            Send OTP
          </button>
        </>
      )}

      {step === "verify" && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <button onClick={verifyOtp} style={{ width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "5px" }}>
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
