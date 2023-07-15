import React from "react";
import { teamWork2 } from "../assets";

const Index = () => {
  return (
    <div className="pt-32 flex flex-col justify-center items-center">
      <div className="w-2/3 min-w-[320px]">
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
    </div>
  );
};

export default Index;
