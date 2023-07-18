import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../constant/constant";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useContext(UserContext);
  const navigation = useNavigate();

  // check cookie
  useEffect(() => {}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform form submission logic here
    const data = { username, password };
    try {
      const res = await axios.post(`${baseUrl}/api/login`, data);
      if ("error" in res.data) {
        console.log(res.data.error);
        setMessage(res.data.error);
      } else {
        login(res.data.user);
        navigation("/projects");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-48">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mr-2 ml-2"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <p className="text-center m-5">
          * If you don't have an account.{" "}
          {
            <Link to="/Signup" className="text-blue-500">
              Signup
            </Link>
          }
        </p>
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Login
          </button>
        </div>
      </form>
      <div id="message" className="text-red-500 mt-6 text-center">
        {message && message}
      </div>
    </div>
  );
};

export default Login;
