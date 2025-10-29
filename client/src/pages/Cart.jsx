import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Cart.css"; // 🎨 custom styles

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'upi'
  const [notes, setNotes] = useState("");
  const [total, setTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  useEffect(() => {
    const base = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
    setTotal(orderType === "takeaway" ? base + 10 : base);
  }, [cart, orderType]);

  const updateQuantity = (idx, newQty) => {
    const updated = [...cart];
    updated[idx].qty = Math.max(1, parseInt(newQty) || 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (idx) => {
    const updated = cart.filter((_, i) => i !== idx);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("🛒 Cart is empty!");
      return;
    }
    setIsPlacingOrder(true);

    const payload = {
      items: cart.map((i) => ({
        itemId: i.itemId || i._id || i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      orderType,
      notes,
      paymentMethod,
    };

    try {
      const { data } = await api.post("/orders", payload);
      const createdOrder = data.order;

      if (paymentMethod === "upi") {
        navigate(`/payment/${createdOrder._id}`);
      } else {
        clearCart();
        navigate("/order-success");
      }
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty. Go to the menu to add items.</p>
          <button className="menu-btn" onClick={() => navigate("/menu")}>
            🍴 Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Order type toggle */}
          <div className="toggle-wrap">
            <button
              className={`toggle-btn ${orderType === "dine-in" ? "active" : ""}`}
              onClick={() => setOrderType("dine-in")}
            >
              🍽️ Dine-in
            </button>
            <button
              className={`toggle-btn ${orderType === "takeaway" ? "active" : ""}`}
              onClick={() => setOrderType("takeaway")}
            >
              🛍️ Takeaway (+₹10)
            </button>
          </div>

          {/* Payment method */}
          <div className="toggle-wrap">
            <button
              className={`toggle-btn ${paymentMethod === "cod" ? "active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              💵 Cash on Delivery
            </button>
            <button
              className={`toggle-btn ${paymentMethod === "upi" ? "active" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              📱 Pay via UPI (Scan QR)
            </button>
          </div>

          {/* Notes */}
          <div className="notes-box">
            <label className="notes-label">📝 Special Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Extra spicy, no onions..."
              className="notes-input"
            />
          </div>

          {/* Cart items */}
          <div className="cart-header">
            <span>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</span>
            <button className="clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
          </div>

          <div className="cart-list">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div className="item-info">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">₹{item.price} each</p>
                </div>
                <div className="item-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQuantity(idx, e.target.value)}
                    className="qty-input"
                  />
                  <button className="remove-btn" onClick={() => removeItem(idx)}>❌</button>
                </div>
                <p className="item-total">₹{(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2 className="total">💰 Total: ₹{total.toFixed(2)}</h2>
            <button
              className={`order-btn ${isPlacingOrder ? "disabled" : ""}`}
              onClick={placeOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder
                ? "⏳ Placing Order..."
                : paymentMethod === "upi"
                ? "📱 Pay & Place Order"
                : "✅ Place Order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
