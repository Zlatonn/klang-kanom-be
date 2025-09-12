export const getStartDate = (date: string) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

export const getEndDate = (date: string) => {
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};
