import { Generator } from "rotating-file-stream";

const APPLICATION_NAME = "quicksend";

export const generateLogFilename: Generator = (timestamp, index): string => {
  const now = timestamp instanceof Date ? timestamp : new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const date = `${year}-${month}-${day}`;

  const hour = now.getHours();
  const minute = now.getMinutes();
  const millisecond = now.getMilliseconds();

  const time = `${hour}-${minute}-${millisecond}`;

  return index
    ? `${APPLICATION_NAME}_${date}_${time}_${index}.log`
    : `${APPLICATION_NAME}_${date}_${time}.log`;
};
