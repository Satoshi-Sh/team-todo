export const keepShorter = (text) => {
  let newText;
  if (text.length > 100) {
    newText = text.slice(0, 90) + "...";
    return newText;
  }
  return text;
};

export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
