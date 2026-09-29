import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth.js";
import SplashCursor from "../../../components/ui/SplashCursor.jsx";
import Spinner from "../../../components/ui/Spinner.jsx";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password });
    navigate('/')
  };

  if(loading){
    return <Spinner label="Loading..." />
  }

  return (
    <main>
      <SplashCursor />
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              onChange={(e) => { setUsername(e.target.value) }}
              type="text"
              id="name"
              name="name"
              placeholder="Enter your Name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => { setEmail(e.target.value) }}
              type="text"
              id="email"
              name="email"
              placeholder="Enter your Email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => { setPassword(e.target.value) }}
              type="password"
              id="password"
              name="password"
              placeholder="Enter your Password"
            />
          </div>

          <button className="button button-primary" type="submit">
            Register
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
