import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../constant/constant";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProject = () => {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigation = useNavigate();

  const { projectId } = useParams();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/projects/${projectId}`
        );
        const { title, due, description } = response.data;
        setTitle(title);
        setDue(due.split("T")[0]);
        setDescription(description);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };
    fetchProject();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform form submission logic here
    const formData = new FormData();
    formData.append("title", title);
    formData.append("due", due);
    formData.append("description", description);
    formData.append("selectedFile", selectedFile);
    try {
      const res = await axios.patch(
        `${baseUrl}/api/projects/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if ("error" in res.data) {
        setMessage(res.data.error);
      } else {
        console.log(res.data.message);
        setMessage("");
        navigation(`/projects`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="max-w-md mx-auto pt-48">
      <h1 className="text-2xl mb-3 font-bold text-center">Update Project</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mr-2 ml-2"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Project Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Enter project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="due"
          >
            Due Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="due"
            type="date"
            placeholder="Enter your due date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            min={minDate}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Enter your project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="15"
            required
          />
          <label
            htmlFor="file-input"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose a new image - optional (jpeg, jpg, png)
          </label>
          <input
            type="file"
            id="file-input"
            onChange={handleFileUpload}
            className="block w-full border border-gray-200 shadow rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 file:bg-transparent file:border-0 file:bg-gray-100 file:mr-4 file:py-3 file:px-4"
            accept=".jpg,.jpeg,.png"
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="text-red-500 m-20 text-center">{message && message}</div>
    </div>
  );
};

export default UpdateProject;