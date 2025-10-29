// client/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [ordersStats, setOrdersStats] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topItem: "-",
  });
  const [weeklySummary, setWeeklySummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topItem: "-",
  });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const statsResp = await api.get("/orders/stats?days=7");
      setOrdersStats(statsResp.data || []);

      const { data: orders } = await api.get("/orders/list");

      const todayISO = new Date().toISOString().split("T")[0];
      const todays = orders.filter(
        (o) => new Date(o.createdAt).toISOString().split("T")[0] === todayISO
      );
      setTodayOrders(todays);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekly = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
      setWeeklyOrders(weekly);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (acc, o) => acc + (o.totalAmount || 0),
        0
      );
      const itemsCount = {};
      orders.forEach((order) =>
        (order.items || []).forEach((it) => {
          itemsCount[it.name] =
            (itemsCount[it.name] || 0) + (it.qty || 0);
        })
      );
      const topItem =
        Object.entries(itemsCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "-";
      setSummary({ totalOrders, totalRevenue, topItem });

      const wTotalOrders = weekly.length;
      const wTotalRevenue = weekly.reduce(
        (acc, o) => acc + (o.totalAmount || 0),
        0
      );
      const wItemsCount = {};
      weekly.forEach((order) =>
        (order.items || []).forEach((it) => {
          wItemsCount[it.name] =
            (wItemsCount[it.name] || 0) + (it.qty || 0);
        })
      );
      const wTopItem =
        Object.entries(wItemsCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "-";
      setWeeklySummary({
        totalOrders: wTotalOrders,
        totalRevenue: wTotalRevenue,
        topItem: wTopItem,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }

  // ✅ Only Excel export
  const generateExcel = (
    ordersToExport,
    filename = "report.xlsx",
    addSummaryObj = null
  ) => {
    const data = ordersToExport.map((order) => ({
      User: order.userName,
      Items: (order.items || [])
        .map((i) => `${i.name} x${i.qty}`)
        .join(", "),
      "Total Amount (₹)": order.totalAmount,
    }));
    if (addSummaryObj) {
      data.push({
        User: "SUMMARY",
        Items: `Top: ${addSummaryObj.topItem}`,
        "Total Amount (₹)": addSummaryObj.totalRevenue,
      });
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, filename);
  };

  return (
    <div className="admin-wrap" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🌟 Admin Dashboard</h1>
          <div style={{ color: "#374151" }}>
            Welcome, <b>{user?.name || "Admin"}</b>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: "#fef3c7" }}>
          <h4 style={{ margin: 0 }}>Total Orders</h4>
          <div style={{ fontSize: 22, fontWeight: "700" }}>{summary.totalOrders}</div>
        </div>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: "#d1fae5" }}>
          <h4 style={{ margin: 0 }}>Total Revenue</h4>
          <div style={{ fontSize: 22, fontWeight: "700" }}>₹{summary.totalRevenue}</div>
        </div>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: "#fee2e2" }}>
          <h4 style={{ margin: 0 }}>Top Item</h4>
          <div style={{ fontSize: 18, fontWeight: "700" }}>{summary.topItem}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>📊 Last 7 days</h3>
        {ordersStats.length ? (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#374151" />
                <YAxis allowDecimals={false} stroke="#374151" />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>No stats</div>
        )}
      </div>

      {/* Today's Orders */}
      <div style={{ marginBottom: 24 }}>
        <h3>📄 Today's Orders</h3>
        {todayOrders.length ? (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>User</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Items</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ padding: 8 }}>{o.userName}</td>
                    <td style={{ padding: 8 }}>
                      {(o.items || []).map(it => `${it.name} x${it.qty}`).join(", ")}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>{o.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => generateExcel(todayOrders, "todays_orders.xlsx")}
              style={{ padding: 8 }}
            >
              📊 Download Excel
            </button>
          </>
        ) : (
          <div>No orders today</div>
        )}
      </div>

      {/* Weekly Orders */}
      <div>
        <h3>📅 Weekly Orders</h3>
        {weeklyOrders.length ? (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>User</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Items</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {weeklyOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ padding: 8 }}>{o.userName}</td>
                    <td style={{ padding: 8 }}>
                      {(o.items || []).map(it => `${it.name} x${it.qty}`).join(", ")}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>{o.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginBottom: 8 }}>
              <b>Summary:</b> Total Orders: {weeklySummary.totalOrders} •
              Total Revenue: ₹{weeklySummary.totalRevenue} • Top Item: {weeklySummary.topItem}
            </div>

            <button
              onClick={() =>
                generateExcel(weeklyOrders, "weekly_orders.xlsx", {
                  topItem: weeklySummary.topItem,
                  totalRevenue: weeklySummary.totalRevenue,
                })
              }
              style={{ padding: 8 }}
            >
              📊 Weekly Excel
            </button>
          </>
        ) : (
          <div>No weekly orders</div>
        )}
      </div>
    </div>
  );
}
