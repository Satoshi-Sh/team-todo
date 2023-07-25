import React from "react";
import { teamWork2 } from "../assets";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="pt-32 flex flex-col justify-center items-center">
      <div className="w-2/3 min-w-[280px]">
        <img src={teamWork2} alt="team mark"></img>
      </div>
      <div className="w-2/3 m-16">
        <h1 className=" text-xl font-bold text-red-500 italic">Team Todo</h1>
        <p className="pt-5">
          Welcome to the Team Todo Application! This application is designed to
          help your team manage tasks, collaborate, and stay organized. With
          live update features, you can work together in real-time, ensuring
          everyone is on the same page and tasks are efficiently managed.
        </p>
      </div>
      <div className="flex flex-row gap-5 m-10">
        <Link
          to="/signup"
          className="inline-block text-sm px-4 py-2 leading-none bg-teal-400 border rounded text-white border-white hover:border-transparent hover:bg-teal-600 mt-4 lg:mt-0"
        >
          Signup
        </Link>
        <Link
          to="/login"
          className="inline-block text-sm px-4 py-2 leading-none bg-teal-400 border rounded text-white border-white hover:border-transparent hover:bg-teal-600 mt-4 lg:mt-0"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Index;
