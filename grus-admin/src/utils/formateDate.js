import moment from "moment";

export const formatTimestamp = (timestamp) => {
  // Convert nanoseconds to milliseconds
  const milliseconds = Math.floor(Number(timestamp) / 1_000_000);
  // Format the timestamp using Moment.js
  return moment(milliseconds).format('DD-MM-YYYY HH:mm');
};