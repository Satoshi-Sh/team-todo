import React, { useState, useEffect, useContext } from "react";
import AvatarImage from "./AvatarImage";
import { UserContext } from "../context/UserContext";

const MessageCard = ({ message }) => {
  console.log(message);
  const { user } = useContext(UserContext);
  const avatar = message.sender.avatar;

  const localTime = new Date(message.createdAt).toLocaleString(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  // chrome and firefox have different form of date...
  //.slice(0, -3);
  console.log(localTime);
  if (user._id == message.sender._id) {
    return (
      <div className="w-2/3">
        <div className="m-3 flex flex-row items-center justify-start gap-2">
          <AvatarImage
            imageContent={avatar.imageContent}
            contentType={avatar.contentType}
            withLink={false}
          />
          <div className="bg-lime-400 text-left rounded p-3">
            {message.message}
          </div>
        </div>
        <div className="text-left">{localTime}</div>
      </div>
    );
  } else {
    return (
      <div className="w-2/3">
        <div className="m-3 flex flex-row-reverse items-center justify-start gap-2">
          <AvatarImage
            imageContent={avatar.imageContent}
            contentType={avatar.contentType}
            withLink={false}
          />
          <div className="bg-gray-300 text-left rounded p-3">
            {message.message}
          </div>
        </div>
        <div className="text-right">{localTime}</div>
      </div>
    );
  }
};

const MessageBoard = ({ projectSocket, hidden }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const handleSend = () => {
    projectSocket.emit("sendMessage", { message });
    setMessage("");
  };

  useEffect(() => {
    projectSocket.on("newMessagesData", (data) => {
      setMessages(data);
    });
    return () => {
      projectSocket.off("newMessageData");
    };
  }, []);
  if (hidden) {
    return null;
  }
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="italic text-xl m-2">Messages</h1>
      {messages.length > 0 &&
        messages.map((mes, index) => {
          return <MessageCard message={mes} key={index} />;
        })}
      <textarea
        className="shadow appearance-none border rounded w-8/12 h-16 mt-16 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="description"
        placeholder="Send new message.."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="15"
        required
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-12 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Send
      </button>
    </div>
  );
};

export default MessageBoard;
