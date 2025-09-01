export const getSkipValue = (page: number, take: number) => {
  const skip = (page - 1) * take;

  return skip;
};

export const getTotalPage = (totalItems: number, take: number) => {
  let totalPage = 0;

  if (take <= 0) {
    return totalPage;
  }

  totalPage = Math.ceil(totalItems / take);

  return totalPage;
};
