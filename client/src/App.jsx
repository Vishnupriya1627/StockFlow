import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import Login from "./components/Login/Login.jsx";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/SignUp/Signup.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import Inventory from "./components/Inventory/Inventory.jsx";
import ProductDetail from "./components/Inventory/ProductDetail.jsx";
import Orders from "./components/Orders/Orders.jsx";
import OrderDetail from "./components/Orders/OrderDetail.jsx";
import Alerts from "./components/Alerts/Alerts.jsx";
import Users from "./components/Users/Users.jsx";
import Settings from "./components/Settings/Settings.jsx";
import ActiveDrops from "./components/Drops/ActiveDrops.jsx";
import DropDetail from "./components/Drops/DropDetail.jsx";
import OpsDashboard from "./components/Dashboard/OpsDashboard.jsx";
import LandingPage from "./components/Landing/Landingpage.jsx";
import { getActiveDrops } from "./api/flashSaleApi";
import socket from "./socket";

function App() {
  useEffect(() => {
    getActiveDrops()
      .then(() => {
        socket.connect();
      })
      .catch(() => {
        socket.connect();
      });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/drops" element={<ActiveDrops />} />
        <Route path="/drops/:id" element={<DropDetail />} />
        <Route path="/login/*" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/ops-dashboard" element={<OpsDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<ProductDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
