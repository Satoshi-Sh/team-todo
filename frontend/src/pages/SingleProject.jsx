import React from "react";
import { useParams } from "react-router-dom";
import { sampleData } from "../assets";
import { capitalizeFirstLetter } from "../utils";

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

const SingleProject = () => {
  const { id } = useParams();
  const data = sampleData.find((item) => item.id === Number(id));
  return (
    <div className="pt-12 text-center">
      <h1 className="pt-20 mb-3 text-4xl font-extrabold">{data.title}</h1>
      <h2 className="mb-3 text-2xl text-gray-400 italic">
        Created by {data.owner}
      </h2>
      <div className="flex flex-row justify-center p-5">
        <img
          src={data.image}
          alt="project header"
          className="max-h-96 shadow-md"
        ></img>
      </div>
      <p className="max-w-lg p-3 mx-auto">{data.description}</p>
      <div className="m-3">
        <h3 className="italic text-xl m-2">Todos</h3>

        <div className="flex flex-col items-center">
          {data.todos.length > 0 &&
            data.todos.map((todo, index) => {
              return (
                <Todo key={index} todo={todo.title} status={todo.status} />
              );
            })}
        </div>
      </div>
      <div className="m-3">
        <h3 className="italic text-xl m-2">Members</h3>
        {/* come back to show avatar and username */}
        {data.members.length > 0 &&
          data.members.map((member, index) => {
            return <div key={index}>{capitalizeFirstLetter(member)}</div>;
          })}
      </div>
      <div className="flex flex-row justify-between p-10">
        <span className="text-gray-700 italic">Due: {data.due}</span>
        <span className="text-gray-700 italic">Created By {data.owner}</span>
      </div>
    </div>
  );
};

export default SingleProject;
