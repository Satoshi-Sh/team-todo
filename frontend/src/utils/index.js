export const keepShorter = (text) => {
  let newText;
  if (text.length > 100) {
    newText = text.slice(0, 90) + "...";
    return newText;
  }
  return text;
};
