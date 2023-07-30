import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../constant/constant";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
axios.defaults.withCredentials = true;

const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col mt-10 gap-4 items-center justify-center">
      {isOpen ? (
        <button
          className="bg-slate-200 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          onClick={() => setIsOpen(!isOpen)}
        >
          Cancel
        </button>
      ) : (
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          onClick={() => setIsOpen(!isOpen)}
        >
          Delete account
        </button>
      )}
      {isOpen && (
        <button
          className="bg-red-500 hover:bg-red-700 block text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          onClick={() => setIsOpen(!isOpen)}
        >
          Confirm Delete
        </button>
      )}
    </div>
  );
};

const UpdateAccount = () => {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { login, logout } = useContext(UserContext);
  const navigation = useNavigate();

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("selectedFile", selectedFile);
    formData.append("userId", user._id);

    try {
      const res = await axios.patch(`${baseUrl}/api/auth/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if ("error" in res.data) {
        console.log(res.data.error);
        setMessage(res.data.error);
      } else {
        console.log(res.data);
        login(res.data.user);
        navigation("/projects");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-48">
      <h1 className="text-2xl font-bold text-center">Update Account</h1>
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
            htmlFor="file-input"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose New Avatar if you want (jpeg, jpg, png)
          </label>
          <input
            type="file"
            id="file-input"
            onChange={onFileChange}
            className="block w-full border border-gray-200 shadow rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 file:bg-transparent file:border-0 file:bg-gray-100 file:mr-4 file:py-3 file:px-4"
            accept=".jpg,.jpeg,.png"
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Update
          </button>
        </div>
      </form>
      <div id="message" className="text-red-500 mt-6 text-center">
        {message && message}
      </div>
      <DeleteAccount />
    </div>
  );
};

export default UpdateAccount;
