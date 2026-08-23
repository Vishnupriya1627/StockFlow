import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../LoginRightCard/LoginRight.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:3000/users/register", {
        name,
        email,
        password,
      });

      navigate("/login");
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
      <form className="loginBox" onSubmit={handleSignup}>
        <h1 id="title">StockFlow</h1>

        {error && <p className="errorText">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
        <p className="passwordHint">
          Min 8 characters, with uppercase, lowercase, number & special
          character
        </p>

        <button type="submit" className="loginBtn" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <span id="seperator"></span>

        <div className="signup" style={{ color: "white" }}>
          Already have an Account?{"  "}
          <button
            id="signUp_btn"
            type="button"
            style={{ color: "#ffaa00" }}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </form>
    </>
  );
};

export default Signup;
