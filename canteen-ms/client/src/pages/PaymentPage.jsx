import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import qrCodeImg from "../assets/upi_qr.png";
import "./PaymentPage.css";

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error("Load order error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "⚠️ Failed to load order. Please make sure you are logged in."
        );
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const notifyPayment = async () => {
    try {
      await api.post(`/orders/${orderId}/notify-payment`);
      alert("✅ Payment notification sent! Admin will verify shortly.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Notify payment error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Failed to confirm payment");
    }
  };

  if (loading) return <p className="payment-container">⏳ Loading order...</p>;
  if (error) return <p className="payment-container" style={{ color: "red" }}>{error}</p>;
  if (!order) return <p className="payment-container">❌ Order not found</p>;

  return (
    <div className="payment-container">
      <h1 className="payment-title">💳 Complete Your Payment</h1>
      <p className="payment-amount">
        Total Amount: <span>₹{order.totalAmount}</span>
      </p>

      <img src={qrCodeImg} alt="UPI QR Code" className="payment-qr" />

      <p className="payment-info">
        📱 Scan using <strong>Google Pay / PhonePe / Paytm</strong>
      </p>
      <p className="payment-note">
        Money goes instantly to the canteen account.
      </p>

      <button className="payment-btn" onClick={notifyPayment}>
        ✅ I have paid
      </button>
    </div>
  );
}
