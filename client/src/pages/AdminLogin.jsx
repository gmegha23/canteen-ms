import axios from "axios";
import { useState } from "react";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin/login", {
        username,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        window.location.href = "/admin/dashboard"; // redirect after login
      }
    } catch (err) {
      setError("Login failed! Invalid credentials.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
