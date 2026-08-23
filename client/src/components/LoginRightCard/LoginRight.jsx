import React, { useState } from "react";
import "./LoginRight.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const LoginRight = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="loginBox" onSubmit={handleLogin}>
        <h1 id="title">StockFlow</h1>

        {error && <p className="errorText">{error}</p>}

        <input
          type="text"
          placeholder="Phone number, username, or email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="loginBtn" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <span id="seperator"></span>

        <div className="signup" style={{ color: "white" }}>
          Do not have an Account?{" "}
          <button
            id="signUp_btn"
            type="button"
            style={{ color: "#ffaa00" }}
            onClick={() => navigate("/login/signup")}
          >
            Sign Up
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginRight;
