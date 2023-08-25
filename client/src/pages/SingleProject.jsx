import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import AvatarImage from "../components/AvatarImage";
import TodoUpdateModal from "../components/TodoUpdateModal";
import MessageBoard from "../components/MessageBoard";
import { UserContext } from "../context/UserContext";
import { capitalizeFirstLetter } from "../utils";
import ProjectImage from "../components/ProjectImage";
import { baseUrl } from "../constant/constant";
import axios from "axios";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";

const checkProjectStatus = (project) => {
  let count = 0;
  for (let todo of project.todos) {
    if (todo.status == "Completed") {
      count++;
    }
  }
  if (count == project.todos.length && count > 0) {
    return true;
  }
  return false;
};

const Todo = ({ todo, isMember, projectSocket, isOwner }) => {
  const { user } = useContext(UserContext);
  const assignTask = () => {
    projectSocket.emit("assignTask", { todoId: todo._id });
  };
  const completeTask = () => {
    projectSocket.emit("completeTask", { todoId: todo._id });
  };

  const unassignTask = () => {
    projectSocket.emit("unassignTask", { todoId: todo._id });
  };
  const unmarkComplete = () => {
    projectSocket.emit("unmarkComplete", { todoId: todo._id });
  };

  const deleteTodo = (e) => {
    const todoId = e.target.parentNode.id;
    projectSocket.emit("deleteTodo", { todoId: todoId });
  };
  if (todo.status == "Open") {
    return (
      <>
        <div className="w-2/3 max-w-[400px] text-left flex flex-row justify-between flex-wrap">
          <span className="whitespace-nowrap w-[150px]">{todo.title}</span>
          <span className={`w-[100px] text-emerald-300`}>{todo.status}</span>
        </div>
        {isMember ? (
          <div>
            <button
              onClick={assignTask}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-3 py-1 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Assign
            </button>
          </div>
        ) : null}
        {isOwner ? (
          <span id={todo._id} onClick={deleteTodo}>
            <FontAwesomeIcon
              id={todo._id}
              icon={faTrash}
              className="text-red-500 ml-auto cursor-pointer"
            />
          </span>
        ) : null}
      </>
    );
  } else if (todo.status == "Assigned") {
    return (
      <>
        <div className="w-2/3 max-w-[400px] text-left flex flex-row justify-between flex-wrap">
          <span className="whitespace-nowrap w-[150px]">{todo.title}</span>
          <span
            className={`w-[100px] text-gray-400`}
          >{`${todo.status}: ${todo.assignee.username}`}</span>
        </div>
        {todo.assignee._id === user._id ? (
          <div>
            <button
              onClick={completeTask}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-3 py-1 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Mark Complete
            </button>
            <button
              onClick={unassignTask}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold m-3 py-1 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Unassign
            </button>
          </div>
        ) : null}
        {isOwner ? (
          <span id={todo._id} onClick={deleteTodo}>
            <FontAwesomeIcon
              id={todo._id}
              icon={faTrash}
              className="text-red-500 ml-auto cursor-pointer"
            />
          </span>
        ) : null}
      </>
    );
  } else {
    return (
      <>
        <div className="w-2/3 max-w-[400px] text-left flex flex-row justify-between flex-wrap">
          <span className="whitespace-nowrap w-[150px]">
            <span className="m-1 text-lime-500">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            {todo.title}
          </span>
          <span className={`w-[100px] text-lime-500`}>
            {todo.status} <span>{`By ${todo.assignee.username}`}</span>
          </span>
        </div>
        {todo.assignee._id === user._id ? (
          <div>
            <button
              onClick={unmarkComplete}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold m-3 py-1 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Unmark Complete
            </button>
          </div>
        ) : null}
        {isOwner ? (
          <span id={todo._id} onClick={deleteTodo}>
            <FontAwesomeIcon
              id={todo._id}
              icon={faTrash}
              className="text-red-500 ml-auto cursor-pointer"
            />
          </span>
        ) : null}
      </>
    );
  }
};

const Member = ({ username, imageContent, contentType }) => {
  return (
    <div className="flex flex-row items-center justify-between mt-3 mx-auto w-[150px]">
      <span>{capitalizeFirstLetter(username)}</span>
      <AvatarImage imageContent={imageContent} contentType={contentType} />
    </div>
  );
};

const SingleProject = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { user } = useContext(UserContext);

  const [isCompleted, setIsCompleted] = useState(false);

  const connectionObject = {
    withCredentials: true,
    autoConnect: false,
    query: { projectId: id },
  };
  const socketRef = useRef(io.connect(baseUrl, connectionObject));
  const projectSocketRef = useRef(
    io.connect(`${baseUrl}/${id}`, connectionObject)
  );

  const joinProject = () => {
    const projectSocket = projectSocketRef.current;
    if (projectSocket.connected) {
      projectSocket.emit("joinProject");
    } else {
      console.error("Socket not connected. Unable to join project.");
    }
  };
  const leaveProject = () => {
    const projectSocket = projectSocketRef.current;
    if (projectSocket.connected) {
      projectSocket.emit("leaveProject");
    } else {
      console.error("Socket not connected. Unable to leave project.");
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${baseUrl}/api/projects/${id}`);
        const project = response.data;
        // check if todos are completed or not
        if (checkProjectStatus(project)) {
          setIsCompleted(true);
        }
        // check if the user is owner or not
        if (user._id === project.owner._id) {
          setIsOwner(true);
        }
        // check if the user is the member of the project
        for (let member of project.members) {
          if (user._id === member._id) {
            setIsMember(true);
          }
        }
        setProject(project);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };
    fetchProject();
  }, [id]);
  useEffect(() => {
    const socket = socketRef.current;
    const projectSocket = projectSocketRef.current;
    socket.connect();
    socket.on("connect", () => {
      console.log("socket.connected:", socket.connected);
    });
    socket.on("connectRoom", (data) => {
      if (!data.hasOwnProperty("error")) {
        projectSocket.on("connect", () => {
          console.log("Projecsocket.connected:", socket.connected);
          //socket.disconnect();
        });
        projectSocket.connect();

        projectSocket.on("newProjectData", (data) => {
          let check = false;
          for (let member of data.members) {
            if (user._id === member._id) {
              setIsMember(true);
              check = true;
            }
          }
          if (checkProjectStatus(data)) {
            setIsCompleted(true);
          } else {
            setIsCompleted(false);
          }
          if (!check) {
            setIsMember(false);
          }
          setProject(data);
        });
        projectSocket.on("projectError", (data) => {
          console.error(data);
          alert(data.message);
        });
      }
    });
    return () => {
      projectSocket.off("newProjectData");
      projectSocket.off("projectError");

      socket.off("roomReady");
      socket.off("connectRoom");
      socket.disconnect();
      projectSocket.disconnect();
    };
  }, [id]);
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

  if (!project) {
    return <h1 className="pt-12">Loading Data...</h1>;
  }
  return (
    <div className="pt-12 text-center">
      <h1 className="pt-20 mb-3 text-4xl font-extrabold">{project.title}</h1>
      {isCompleted ? (
        <h2 className="text-lime-400 text-3xl m-3">~ Project Completed ~</h2>
      ) : null}
      <h2 className="mb-3 text-2xl text-gray-400 italic">
        Created by {project.owner.username}
      </h2>
      <ProjectImage
        imageContent={project.image.imageContent}
        contentType={project.image.contentType}
        extraClass={"max-w-[800px] h-auto mx-auto p-4"}
      />
      <p className="max-w-lg p-3 mx-auto">{project.description}</p>
      <div className="m-3">
        {isOwner ? (
          <div className="m-4">
            <Link
              to={`/update-project/${project._id}`}
              className="border  hover:bg-blue-500 hover:text-white hover:font-bold p-2 rounded"
            >
              Update Project
            </Link>
          </div>
        ) : null}
        <h3 className="italic text-xl m-2">Todos</h3>

        <div className="flex flex-col items-center">
          {project.todos.length > 0 &&
            project.todos.map((todo, index) => {
              return (
                <Todo
                  key={index}
                  todo={todo}
                  projectSocket={projectSocketRef.current}
                  isMember={isMember}
                  isOwner={isOwner}
                />
              );
            })}
        </div>
      </div>
      {isOwner ? (
        <TodoUpdateModal
          todos={project.todos}
          projectSocketRef={projectSocketRef}
        />
      ) : null}
      <div className="m-3">
        <h3 className="italic text-xl m-2">Members</h3>
        {/* test with owner for now */}
        {project.members.map((member, index) => {
          return (
            <Member
              key={index}
              username={member.username}
              imageContent={member.avatar.imageContent}
              contentType={member.avatar.contentType}
            />
          );
        })}
      </div>
      <div className="flex flex-row items-center justify-between p-10">
        <span className="text-gray-700 italic">
          Due: {project.due?.split("T")[0]}
        </span>
        <div className="flex flex-row items-center justify-center gap-3">
          <span className="text-gray-700 italic">
            Created By {project.owner.username}
          </span>
          <AvatarImage
            imageContent={project.owner.avatar.imageContent}
            contentType={project.owner.avatar.contentType}
          />
        </div>
      </div>
      {isOwner || isMember ? (
        <MessageBoard projectSocket={projectSocketRef.current} />
      ) : (
        <MessageBoard projectSocket={projectSocketRef.current} hidden={true} />
      )}
      <div>
        {/* if not the owner and already are team member */}
        {isMember ? (
          <button
            className="bg-red-400 hover:bg-red-500 text-white font-bold m-12 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => leaveProject()}
          >
            Leave
          </button>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-12 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => joinProject()}
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
};

export default SingleProject;
