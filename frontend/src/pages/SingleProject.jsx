import React from "react";
import { useParams } from "react-router-dom";
import { sampleData } from "../assets";

const SingleProject = () => {
  const { id } = useParams();
  const data = sampleData.find((item) => item.id === Number(id));
  return (
    <div className="pt-12 text-center">
      <h1 className="pt-20 mb-3 text-4xl font-extrabold">{data.title}</h1>
      <h2 className="mb-3 text-2xl text-gray-400 italic">
        {data.businessName}
      </h2>
      <div className="flex flex-row justify-center p-5">
        <img
          src={data.image}
          alt="project header"
          className="max-h-96 shadow-md"
        ></img>
      </div>
      <p className="max-w-lg p-3 mx-auto">{data.description}</p>
      <div className="flex flex-row justify-evenly p-10">
        <span className="text-gray-700 text-lg italic">
          Current: ${data.currentAmount}
        </span>
        <span className="text-gray-700 italic text-lg">
          Goal: ${data.goalAmount}
        </span>
      </div>
      <div className="flex flex-row justify-between p-10">
        <span className="text-gray-700 italic">Due: {data.due}</span>
        <span className="text-gray-700 italic">{data.location}</span>
      </div>
    </div>
  );
};

export default SingleProject;
