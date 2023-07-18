import React from "react";
import Project from "../components/Project";
import { sampleData } from "../assets";

const Projects = () => {
  return (
    <div className="p-5 flex flex-wrap mx-auto justify-center gap-5">
      {sampleData.map((data, index) => {
        return <Project key={index} data={data} />;
      })}
    </div>
  );
};

export default Projects;
