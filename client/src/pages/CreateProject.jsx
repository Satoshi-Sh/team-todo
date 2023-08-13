import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { baseUrl } from "../constant/constant";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

axios.defaults.withCredentials = true;

const TodoSection = ({ todos, setTodos }) => {
  const [todoTitle, setTodoTitle] = useState("");
  const handleAdd = (e) => {
    e.preventDefault();
    if (todoTitle === "") return;
    setTodos((prevArray) => [...prevArray, todoTitle]);
    setTodoTitle("");
  };
  const handleDelete = (e) => {
    const indexDelete = Number(e.target.parentNode.id);
    setTodos((prevArray) =>
      prevArray.filter((todo, index) => index !== indexDelete)
    );
  };
  return (
    <div>
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="todo"
      >
        Todos
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="todo"
        type="text"
        placeholder="Enter todo"
        value={todoTitle}
        onChange={(e) => setTodoTitle(e.target.value)}
      />
      <div className="flex flex-row justify-center items-center m-3">
        <button
          onClick={handleAdd}
          className="p-0 w-10 h-8 bg-gray-500 rounded-full hover:bg-gray-400 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
        >
          <svg
            viewBox="0 0 20 20"
            enableBackground="new 0 0 20 20"
            className="w-6 h-6 inline-block"
          >
            <path
              fill="#FFFFFF"
              d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                    C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                    C15.952,9,16,9.447,16,10z"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col items-center m-4">
        {todos.length > 0 &&
          todos.map((todo, index) => {
            return (
              <div key={index} className="w-2/3 flex flex-row justify-between">
                <span>{todo}</span>
                <span id={index}>
                  <FontAwesomeIcon
                    id={index}
                    icon={faTrash}
                    className="text-red-500 ml-auto cursor-pointer"
                    onClick={handleDelete}
                  />
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const CreateProject = () => {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [todos, setTodos] = useState([]);
  const [message, setMessage] = useState("");
  const navigation = useNavigate();
  const { user } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (todos.length == 0) {
      setMessage("Need at least one todo..");
      return;
    }
    // Perform form submission logic here
    const formData = new FormData();
    formData.append("title", title);
    formData.append("due", due);
    formData.append("description", description);
    formData.append("todos", JSON.stringify(todos));
    formData.append("selectedFile", selectedFile);
    try {
      const res = await axios.post(`${baseUrl}/api/projects`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { error, projectId } = res.data;
      if (error) {
        setMessage(error);
      } else {
        console.log(res.data.message);
        setMessage("");

        navigation(`/project/${projectId}`);
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

  if (!user) {
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
      <h1 className="text-2xl mb-3 font-bold text-center">
        Create New Project
      </h1>
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
        </div>
        <TodoSection todos={todos} setTodos={setTodos} />
        <div className="mb-6">
          <label
            htmlFor="file-input"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose Image (jpeg, jpg, png)
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

export default CreateProject;
