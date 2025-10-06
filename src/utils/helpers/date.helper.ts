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

export const formatDateYYYYMMDD = (date: Date) => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};
