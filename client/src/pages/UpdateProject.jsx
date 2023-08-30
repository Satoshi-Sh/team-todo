import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { baseUrl } from "../constant/constant";
import { useNavigate, useParams, Link } from "react-router-dom";

const DeleteProject = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();
  const deleteProject = async () => {
    const res = await axios.delete(`${baseUrl}/api/projects/${projectId}`);
    if ("error" in res.data) {
      console.log(res.data.error);
    } else {
      navigation("/projects");
    }
  };
  return (
    <div className="flex flex-col m-10 gap-4 items-center justify-center">
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
          Delete Project
        </button>
      )}
      {isOpen && (
        <button
          className="bg-red-500 hover:bg-red-700 block text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          onClick={deleteProject}
        >
          Confirm Delete
        </button>
      )}
    </div>
  );
};

const UpdateProject = () => {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigate();
  const { user } = useContext(UserContext);

  const { projectId } = useParams();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/projects/${projectId}`
        );
        setIsLoading(false);
        const { title, due, description, owner } = response.data;
        setTitle(title);
        setDue(due.split("T")[0]);
        setDescription(description);
        if (owner._id == user._id) {
          setIsOwner(true);
        }
      } catch (err) {
        setIsLoading(false);
        console.error("Need to be logged in and should be the project owner:");
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
        navigation(`/project/${projectId}`);
      }
    } catch (error) {
      console.log(error);
      setMessage(error.response.data.error);
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  if (isLoading) {
    return <h1 className="pt-32 text-lg text-center">Loading...</h1>;
  } else if (!isOwner) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl">Please login..</h1>
        <Link className="text-blue-600 text-lg" to="/login">
          Login
        </Link>
      </div>
    );
  }
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
        <div className="text-red-500 m-5 text-center">{message && message}</div>
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>

      <DeleteProject projectId={projectId} />
      <div className="text-center m-5">
        <Link to={`/project/${projectId}`} className="text-xl text-blue-700">
          Back
        </Link>
      </div>
    </div>
  );
};

export default UpdateProject;
