import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { UserContext } from "../context/UserContext";
import { baseUrl } from "../constant/constant";
import axios from "axios";
import AvatarImage from "./AvatarImage";

const LogoutButton = () => {
  const { logout } = useContext(UserContext);
  const navigation = useNavigate();
  const handleClick = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/logout`);
      if ("error" in res.data) {
        console.log(res.data.error);
      } else {
        logout();
        navigation("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
      onClick={handleClick}
    >
      Logout
    </div>
  );
};

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const { user } = useContext(UserContext);

  return (
    <nav className="flex fixed w-full items-center justify-between flex-wrap bg-teal-500 p-6">
      <Link
        to={user ? "/projects" : "/"}
        className="flex items-center flex-shrink-0 text-white mr-6"
      >
        <span className="font-semibold text-xl tracking-tight">Team Todo</span>
      </Link>
      <div className="flex flex-row gap-3 lg:hidden ">
        <button
          className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white"
          onClick={handleClick}
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
        {user && (
          <AvatarImage
            imageContent={user.avatar.imageContent}
            contentType={user.avatar.contentType}
          />
        )}
      </div>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } w-full block flex-grow lg:flex lg:items-center lg:w-auto`}
      >
        <div className="text-sm lg:flex-grow">
          {user ? (
            <>
              <Link
                to="/projects"
                className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
              >
                Projects
              </Link>
              <Link
                to="/create-project"
                className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
              >
                Create Project
              </Link>
              <Link
                to={`/account/${user._id}`}
                className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
              >
                Account
              </Link>
            </>
          ) : null}
        </div>

        {user ? (
          <div className="flex flex-row gap-4">
            <LogoutButton />
            {user && (
              <Link to={`/account/${user._id}`}>
                <AvatarImage
                  imageContent={user.avatar.imageContent}
                  contentType={user.avatar.contentType}
                  extraClass={"hidden lg:block"}
                />
              </Link>
            )}
          </div>
        ) : (
          <div>
            <Link
              to="/signup"
              className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
            >
              Signup
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
