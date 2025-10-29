import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Menu.css'; // ✅ Import CSS file

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Breakfast', 'Lunch', 'Snacks'];

  const loadMenu = async () => {
    try {
      const { data } = await api.get('/menu');
      setMenuItems(data);
      const initialQuantities = {};
      data.forEach((item) => (initialQuantities[item._id] = 1));
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, parseInt(value) || 1),
    }));
  };

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const qty = parseInt(quantities[item._id], 10) || 1;
    const existing = cart.find((c) => c.itemId === item._id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ itemId: item._id, name: item.name, price: item.price, qty });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} added to cart`);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-header">
        <h1 className="logo">🍴 Canteen Menu</h1>
        <Link to="/cart" className="cart-btn">🛒 View Cart</Link>
      </div>

      {/* Search & Filter */}
      <div className="menu-filter">
        <input
          className="search-input"
          placeholder="🔍 Search for food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item._id} className="menu-card">
            <img
              src={item.imageUrl || 'https://via.placeholder.com/150'}
              alt={item.name}
              className="menu-image"
            />
            <h3 className="item-name">{item.name}</h3>
            <p className="price">₹{item.price}</p>
            <p className="category">{item.category}</p>
            <p className={`stock ${item.count > 0 ? 'in-stock' : 'out-stock'}`}>
              {item.count > 0 ? `Stock: ${item.count}` : 'Out of Stock'}
            </p>

            <div className="actions">
              <input
                type="number"
                min="1"
                value={quantities[item._id] || 1}
                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                className="qty-input"
              />

              <button
                className={`add-btn ${item.count === 0 ? 'disabled' : ''}`}
                disabled={item.count === 0}
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}

        {!filteredItems.length && (
          <p className="no-items">❌ No items match your search.</p>
        )}
      </div>
    </div>
  );
}
