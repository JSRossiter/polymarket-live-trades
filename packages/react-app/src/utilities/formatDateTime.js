const pad = (n) => (n < 10 ? `0${n.toString()}` : n.toString());

export const formatDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatDateShort = (date) =>
  `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatTime = (date, prec = 's') => {
  let time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (prec === 's' || prec === 'ms') {
    time += `:${pad(date.getSeconds())}`;
  }
  if (prec === 'ms') {
    time += `.${pad(date.getMilliseconds())}`;
  }
  return time;
};

export const formatDateTime = (date, prec = 's') =>
  prec === 'd'
    ? formatDate(date)
    : `${formatDate(date)} ${formatTime(date, prec)}`;
