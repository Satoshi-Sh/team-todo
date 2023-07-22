import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AvatarImage from "../components/AvatarImage";
import { capitalizeFirstLetter } from "../utils";
import ProjectImage from "../components/ProjectImage";
import { baseUrl } from "../constant/constant";
import axios from "axios";

const Todo = ({ todo, status }) => {
  let color;
  if (status == "Open") {
    color = "text-emerald-300";
  } else if (status == "Assigned") {
    color = "text-gray-400";
  } else {
    color = "text-lime-500";
  }
  return (
    <div className="w-1/2 max-w-[300px] text-left flex flex-row justify-between flex-wrap">
      <span className="whitespace-nowrap w-[150px]">{todo}</span>
      <span className={`w-[100px] ${color}`}>{status}</span>
    </div>
  );
};

const Member = ({ username, imageContent, contentType }) => {
  return (
    <div className="flex flex-row items-center justify-between mx-auto w-[150px]">
      <span>{capitalizeFirstLetter(username)}</span>
      <AvatarImage imageContent={imageContent} contentType={contentType} />
    </div>
  );
};

const SingleProject = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/project/${id}`);
        console.log(response.data);
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };
    fetchProject();
  }, [id]);
  if (!project) {
    return <h1 className="pt-12">Loading Data...</h1>;
  }
  return (
    <div className="pt-12 text-center">
      <h1 className="pt-20 mb-3 text-4xl font-extrabold">{project.title}</h1>
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
        <h3 className="italic text-xl m-2">Todos</h3>

        <div className="flex flex-col items-center">
          {project.todos.length > 0 &&
            project.todos.map((todo, index) => {
              return (
                <Todo key={index} todo={todo.title} status={todo.status} />
              );
            })}
        </div>
      </div>
      <div className="m-3">
        <h3 className="italic text-xl m-2">Members</h3>
        {/* test with owner for now */}
        <Member
          username={project.owner.username}
          imageContent={project.owner.avatar.imageContent}
          contentType={project.owner.avatar.contentType}
        />
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
    </div>
  );
};

export default SingleProject;
