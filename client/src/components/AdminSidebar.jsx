// client/src/components/AdminSidebar.jsx
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5 space-y-6">
      <h2 className="text-xl font-bold">⚙️ Admin Panel</h2>
      <nav className="space-y-3">
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${
              isActive ? "bg-green-600 font-bold" : "hover:bg-gray-700"
            }`
          }
        >
          📦 Orders
        </NavLink>
        <NavLink
          to="/admin/feedback"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${
              isActive ? "bg-blue-600 font-bold" : "hover:bg-gray-700"
            }`
          }
        >
          💬 Feedback
        </NavLink>
      </nav>
    </aside>
  );
}
