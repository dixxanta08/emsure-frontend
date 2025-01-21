import React, { useState } from "react";
import authService from "../services/authService";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill all the fields");
      return;
    }
    const result = await login(email, password);
    console.log("Login.jsx" + result);
    setError("");
  };

  return (
    <div>
      <h1>Login</h1>
      {error && (
        <p className="bg-red-300 text-red-800 font-semibold">{error}</p>
      )}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <br></br>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            authService.test();
          }}
        >
          Test
        </button>
      </form>
    </div>
  );
};

export default Login;
