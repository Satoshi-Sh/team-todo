import React from "react";
import { keepShorter } from "../utils";
import { useNavigate } from "react-router-dom";

const Project = (props) => {
  const { data } = props;

  const navigate = useNavigate();
  const handleClick = (e) => {
    navigate(`/project/${e.currentTarget.id}`);
  };

  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg mt-20 p-4 cursor-pointer"
      onClick={handleClick}
      id={data.id}
    >
      <img className="w-full" src={data.image} alt="Project" />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{data.title}</div>
        <div className="h-30">
          <p className="text-gray-700 text-base">
            {keepShorter(data.description)}
          </p>
        </div>
      </div>
      <div className="text-center">
        <span className="inline-block  bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {data.businessName}
        </span>
        <span className="inline-block  bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          ${data.goalAmount}
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <span className="text-gray-700 italic">{data.due}</span>
        <span className="text-gray-700 italic">{data.location}</span>
      </div>
    </div>
  );
};

export default Project;
