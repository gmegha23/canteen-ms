import { useEffect, useState } from "react";
import api from "../../api";
import "./AdminOrders.css";

const STATUSES = ["placed", "preparing", "ready", "completed", "cancelled"];
const STATUS_COLORS = {
  placed: "status-yellow",
  preparing: "status-blue",
  ready: "status-green",
  completed: "status-gray",
  cancelled: "status-red",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders?status=${filter}`);
      setOrders(data);
    } catch (err) {
      console.error("Load orders error:", err);
      setMessage("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    let interval;
    if (autoRefresh) interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [filter, autoRefresh]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setMessage("");
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      await loadOrders();
      setMessage("✅ Status updated successfully");
    } catch (err) {
      console.error("Update status error:", err);
      setMessage(err.response?.data?.message || "❌ Failed to update status");
    }
  };

  const handlePaymentAction = async (orderId, action) => {
    try {
      await api.patch(`/orders/${orderId}/payment`, { action });
      await loadOrders();
      setMessage(`Payment ${action}ed`);
    } catch (err) {
      console.error("Payment update error:", err);
      setMessage("❌ Failed to update payment");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="orders-page">
      {/* Sidebar removed → full width */}
      <main className="orders-main full-width">
        <div className="orders-header">
          <h1>📦 Order Management</h1>
          <label className="refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>

        {message && (
          <div className={`message ${message.includes("❌") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {loading ? (
          <p className="loading">⏳ Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="no-orders">🚫 No orders found</div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Notes</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o._id} className={idx % 2 === 0 ? "even" : "odd"}>
                    <td>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      <div>{o.user?.name || "Guest"}</div>
                      <div className="customer-email">{o.user?.email || "-"}</div>
                    </td>
                    <td>{o.orderType}</td>
                    <td>{o.notes || "-"}</td>
                    <td>
                      <ul>
                        {o.items.map((it, i) => (
                          <li key={i}>
                            {it.name} × {it.qty} — ₹{it.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>₹{o.totalAmount.toFixed(2)}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="status-select"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className={`status-badge ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </div>
                    </td>
                    <td className="p-3">
                      <div><strong>{o.paymentMethod?.toUpperCase()}</strong></div>
                      <div className="text-xs">{o.paymentStatus}</div>
                      {o.paymentMethod === "upi" &&
                        o.paymentStatus === "awaiting_confirmation" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded"
                              onClick={() => handlePaymentAction(o._id, "confirm")}
                            >
                              Confirm
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => handlePaymentAction(o._id, "reject")}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
