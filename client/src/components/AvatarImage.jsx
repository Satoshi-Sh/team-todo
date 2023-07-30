import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { Link } from "react-router-dom";
const AvatarImage = ({ imageContent, contentType, userId, extraClass }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const buffer = Buffer.from(imageContent);
    const base64String = buffer.toString("base64");
    const url = `data:${contentType};base64,${base64String}`;
    setImageUrl(url);
  }, []);

  return (
    <>
      <Link to={`/update-account/${userId}`}>
        <img
          className={
            extraClass
              ? "w-8 h-8 rounded-full " + extraClass
              : "w-8 h-8 rounded-full "
          }
          src={imageUrl}
          alt="avatar"
        />
      </Link>
    </>
  );
};

export default AvatarImage;
