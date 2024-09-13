
import React, { useState } from "react";
import axios from "axios";
import './index.css'; 

const LoginPage = ({ setUser }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    const url = isLogin ? "/api/login" : "/api/register";
    try {
      const response = await axios.post(url, { name, password });
      if (response.data.userId) {
        setUser({ name, id: response.data.userId });
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error occurred');
      console.error(error.response.data);
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="User Id"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="submit-button">
          {isLogin ? "Login" : "Register"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
    </div>
  );
};

export default LoginPage;
