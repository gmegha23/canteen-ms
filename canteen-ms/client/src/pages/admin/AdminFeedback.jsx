// client/src/pages/admin/AdminFeedback.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import "./AdminFeedback.css"; // ✅ Import CSS file

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/feedback");
      setFeedbacks(data);
    } catch (err) {
      console.error("Feedback fetch error:", err);
      setMessage("❌ Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <div className="admin-feedback-container">
      {/* Main content only (sidebar removed) */}
      <main className="feedback-main full-width">
        <h1 className="feedback-header"> User Feedback</h1>

        {message && <p className="error-msg">{message}</p>}

        {loading ? (
          <p className="loading">⏳ Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p className="no-feedback">🚫 No feedback received yet.</p>
        ) : (
          <div className="feedback-grid">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="feedback-card">
                <h2 className="feedback-user">👤 {fb.user?.name || "Guest"}</h2>
                <p className="feedback-email">{fb.user?.email || "—"}</p>
                <p className="feedback-message">“{fb.message}”</p>
                <p className="feedback-date">
                  📅 {new Date(fb.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
