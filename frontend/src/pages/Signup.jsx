import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../constant/constant";
axios.defaults.withCredentials = true;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("selectedFile", selectedFile);

    try {
      const res = await axios.post(`${baseUrl}/api/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if ("error" in res.data) {
        console.log(res.data.error);
        setMessage(res.data.error);
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-48">
      <h1 className="text-2xl font-bold text-center">Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mr-2 ml-2"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            User Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="confirm"
          >
            Confirm Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirm"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="file-input"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose Avatar (jpeg, jpg, png)
          </label>
          <input
            type="file"
            id="file-input"
            onChange={onFileChange}
            className="block w-full border border-gray-200 shadow rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 file:bg-transparent file:border-0 file:bg-gray-100 file:mr-4 file:py-3 file:px-4"
            accept=".jpg,.jpeg,.png"
          />
        </div>
        <p className="text-center m-5">
          * If you have an account.{" "}
          {
            <Link to="/login" className="text-blue-500">
              Log in
            </Link>
          }
        </p>
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign Up
          </button>
        </div>
      </form>
      <div id="message" className="text-red-500 mt-6 text-center">
        {message && message}
      </div>
    </div>
  );
};

export default Signup;
