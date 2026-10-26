export const delay = () => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 500);
  });
};
