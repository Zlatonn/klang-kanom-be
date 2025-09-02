export const getSkipValue = (page: number, take: number): number => {
  return (page - 1) * take;
};

export const getTotalPage = (totalItems: number, take: number): number => {
  if (take <= 0) {
    return 0;
  }

  return Math.ceil(totalItems / take);
};
