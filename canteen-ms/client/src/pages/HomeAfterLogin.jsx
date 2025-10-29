// client/src/pages/HomeAfterLogin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeAfterLogin.css";

export default function HomeAfterLogin() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    else navigate("/login"); // redirect if not logged in
  }, [navigate]);

  return (
    <div className="home-wrap">
      <div className="home-overlay">
        <div className="home-card">
          <h1>🍴 Welcome to Our Canteen</h1>
          <h2>Hello, {user?.name || "Guest"} 👋</h2>
          <p>
            {user?.role === "admin"
              ? "Manage menus, track daily sales, and keep the canteen running smoothly!"
              : "Order your favorite meals, enjoy quick service, and have a great dining experience!"}
          </p>
        </div>
      </div>
    </div>
  );
}
