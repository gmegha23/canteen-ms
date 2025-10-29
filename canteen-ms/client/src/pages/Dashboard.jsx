import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("currentOrder");
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(savedCart.length);

      // ✅ Fetch user’s orders
      const { data: orders } = await api.get("/orders/user");

      // Normalize status
      const normalize = (s) => (s ? s.toLowerCase().trim() : "");

      const active = orders.find((o) =>
        ["placed", "preparing"].includes(normalize(o.status))
      );
      setActiveOrder(active || null);

      const history = orders.filter((o) =>
        ["ready", "completed", "cancelled"].includes(normalize(o.status))
      );
      setOrderHistory(history);
    } catch (err) {
      console.error("Dashboard load error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const reorder = (order) => {
    localStorage.setItem(
      "cart",
      JSON.stringify(
        order.items.map((i) => ({
          itemId: i.item,
          name: i.name,
          price: i.price,
          qty: i.qty,
        }))
      )
    );
    navigate("/cart");
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackMsg("⚠️ Please enter your feedback");
      return;
    }
    try {
      await api.post("/feedback", { message: feedbackText });
      setFeedbackMsg("✅ Feedback sent successfully!");
      setFeedbackText("");
    } catch (err) {
      console.error("Feedback submit error:", err);
      setFeedbackMsg("❌ Failed to send feedback");
    }
  };

  if (loading) return <p className="loading">⏳ Loading your dashboard...</p>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🍴 My Dashboard</h2>
        <nav>
          {[
            { key: "currentOrder", label: "📦 Current Order" },
            { key: "orderHistory", label: "📜 Order History" },
            { key: "feedback", label: "💬 Feedback" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="cart-count">
          🛒 Items in cart: <span>{cartCount}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <h1>👤 Welcome to Your Dashboard</h1>

        {/* ✅ Current Order */}
        {activeTab === "currentOrder" && (
          <section className="card green-card">
            <h2>📦 Current Order</h2>
            {!activeOrder ? (
              <p>No active orders right now.</p>
            ) : (
              <div>
                <p>
                  <strong>Order ID:</strong> #
                  {activeOrder._id.slice(-6).toUpperCase()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="status">{activeOrder.status}</span>
                </p>
                {activeOrder.notes && <p>📝 Notes: {activeOrder.notes}</p>}
                <ul>
                  {activeOrder.items.map((i, idx) => (
                    <li key={idx}>
                      {i.name} × {i.qty}
                    </li>
                  ))}
                </ul>
                <p className="total">💰 Total: ₹{activeOrder.totalAmount}</p>
                <Progress status={activeOrder.status} />
              </div>
            )}
          </section>
        )}

        {/* ✅ Order History */}
        {activeTab === "orderHistory" && (
          <section className="card blue-card">
            <h2>📜 Order History</h2>
            {orderHistory.length === 0 ? (
              <p>No past orders yet.</p>
            ) : (
              <div className="history-grid">
                {orderHistory.map((order) => (
                  <div key={order._id} className="history-card">
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <ul>
                      {order.items.map((i, idx) => (
                        <li key={idx}>
                          {i.name} × {i.qty}
                        </li>
                      ))}
                    </ul>
                    <p>
                      💰 Total:{" "}
                      <span className="price">₹{order.totalAmount}</span>
                    </p>
                    <p>
                      📦 Status:{" "}
                      <span className="status">{order.status}</span>
                    </p>
                    <button
                      className="reorder-btn"
                      onClick={() => reorder(order)}
                    >
                      🔄 Reorder
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ✅ Feedback */}
        {activeTab === "feedback" && (
          <section className="card purple-card">
            <h2>💬 Feedback</h2>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="✨ Share your thoughts about our service..."
              className="feedback-box"
            />
            <button className="feedback-btn" onClick={submitFeedback}>
              🚀 Submit Feedback
            </button>
            {feedbackMsg && <p className="feedback-msg">{feedbackMsg}</p>}
          </section>
        )}
      </main>
    </div>
  );
}

/* Progress Tracker */
function Progress({ status }) {
  const steps = ["placed", "preparing", "ready", "completed"];
  const currentStep = steps.indexOf(status?.toLowerCase() || "");

  return (
    <div className="progress">
      {steps.map((step, idx) => (
        <div key={idx} className={idx <= currentStep ? "done" : ""}>
          {step}
        </div>
      ))}
    </div>
  );
}
