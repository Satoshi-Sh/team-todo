import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
const AvatarImage = ({ imageContent, contentType, extraClass }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const buffer = Buffer.from(imageContent);
    const base64String = buffer.toString("base64");
    const url = `data:${contentType};base64,${base64String}`;
    setImageUrl(url);
  }, []);

  return (
    <img
      className={
        extraClass
          ? "w-8 h-8 rounded-full " + extraClass
          : "w-8 h-8 rounded-full "
      }
      src={imageUrl}
      alt="avatar"
    />
  );
};

export default AvatarImage;
