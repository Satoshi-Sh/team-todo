import React from "react";
import { keepShorter } from "../utils";
import { useNavigate } from "react-router-dom";
import AvatarImage from "./AvatarImage";
import ProjectImage from "./ProjectImage";

const Project = (props) => {
  const { data } = props;
  let projectDone = false;
  let countComplete = 0;
  for (let todo of data.todos) {
    if (todo.status == "Completed") {
      countComplete++;
    }
  }
  if (data.todos.length == countComplete && countComplete > 0) {
    projectDone = true;
  }

  const navigate = useNavigate();
  const handleClick = (e) => {
    navigate(`/project/${e.currentTarget.id}`);
  };

  return (
    <div
      className=" relative max-w-sm rounded overflow-hidden shadow-lg mt-20 p-4 cursor-pointer"
      onClick={handleClick}
      id={data._id}
    >
      {projectDone ? (
        <div class="absolute left-0 top-0 h-16 w-16">
          <div class="absolute left-[-34px] top-[32px] w-[170px] transform -rotate-45 bg-lime-500 text-center text-white font-semibold py-1">
            Completed
          </div>
        </div>
      ) : null}
      <div className="h-[280px] grid place-items-center overflow-clip">
        <ProjectImage
          imageContent={data.image.imageContent}
          contentType={data.image.contentType}
        />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{data.title}</div>
        <div className="h-30">
          <p className="text-gray-700 text-base h-14">
            {keepShorter(data.description)}
          </p>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <span className="text-gray-700 italic flex flex-row items-center">
          Due {data.due?.split("T")[0]}
        </span>
        <div className="flex flex-row items-center justify-center gap-2">
          <span className="text-gray-700 italic">
            Created by {data.owner.username}
          </span>

          <AvatarImage
            imageContent={data.owner.avatar.imageContent}
            contentType={data.owner.avatar.contentType}
            extraClass={"inline"}
          />
        </div>
      </div>
    </div>
  );
};

export default Project;
