export const keepShorter = (text) => {
  let newText;
  if (text.length > 60) {
    newText = text.slice(0, 60) + "...";
    return newText;
  }
  return text;
};

export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getTokenFromCookie = () => {
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("authToken=")) {
      const token = cookie.substring("authToken=".length);
      return token;
    }
  }
  return null; // Return null if token is not found in the cookies
};
