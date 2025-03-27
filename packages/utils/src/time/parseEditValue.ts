export const parseEditValue = (editValueString: string): number => {
  if (editValueString.length <= 2) {
    return parseInt(editValueString);
  } else if (editValueString.length === 3) {
    return (
      parseInt(editValueString.slice(0, 1)) * 60 +
      parseInt(editValueString.slice(1, 3))
    );
  } else if (editValueString.length === 4) {
    return (
      parseInt(editValueString.slice(0, 2)) * 60 +
      parseInt(editValueString.slice(2, 4))
    );
  }

  throw new Error("Invalid edit value string");
};
