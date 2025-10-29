import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return null; // Hide navbar if not logged in

  // Role-based links
  const links =
    user.role === "admin"
      ? [
           { name: "Dashboard", path: "/admin" },
          { name: "Orders", path: "/admin/orders" },
          { name: "Menu", path: "/admin/menu" },
          { name: "Feedback", path: "/admin/feedback" },
        ]
      : [
          { name: "Home", path: "/home" },
          { name: "Menu", path: "/menu" },
          { name: "Cart", path: "/cart" },
          { name: "Dashboard", path: "/dashboard" },
        ];

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Left side logo */}
      <div className="nav-left">
        <h2 className="brand">🍴 Canteen System</h2>
      </div>

      {/* Middle links */}
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? "active" : ""}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side actions */}
      <div className="nav-right">
        <button className="nav-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
        <button className="nav-btn" onClick={() => navigate(1)}>
          ➡ Forward
        </button>
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
