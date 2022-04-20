export const isSsr = () => typeof window === 'undefined';

export const uniqueID = () => {
  const head = Date.now().toString(36);
  const tail = Math.random().toString(36).substr(2);

  return head + tail;
};

// Checks if value is an empty object or collection.
export const isEmpty = (obj: any) =>
  [Object, Array].includes((obj || {}).constructor) &&
  !Object.entries(obj || {}).length;

// Checks if value is null or undefined.
export const isNil = (value: any) => value === null || value === undefined;
