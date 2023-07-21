import React, { useEffect, useState } from "react";
import Project from "../components/Project";
import axios from "axios";
import { baseUrl } from "../constant/constant";

const Projects = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/projects`);
        setData(response.data);
      } catch (err) {
        console.error(`Error fetching data: ${err}`);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-5 flex flex-wrap mx-auto justify-center gap-5">
      {data.length > 0 &&
        data.map((d, index) => {
          return <Project key={index} data={d} />;
        })}
    </div>
  );
};

export default Projects;
