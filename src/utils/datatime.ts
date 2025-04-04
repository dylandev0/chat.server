import dayjs, { ManipulateType } from 'dayjs';

import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(duration);

const offset = 7 * 60;

/**
 * create dayjs
 * @param dateString
 * @param format
 * @returns
 */
export const createDayjs = (dateString: string, format?: string) => {
  return dayjs(dateString, format).tz('Asia/Saigon');
};

/**
 * check if a date string is valid
 * @param dateString
 * @param format
 * @returns
 */
export const isValidDate = (dateString: string): boolean => {
  const date = dayjs(dateString);
  return date.isValid();
};

/**
 * get date now with string format YYYYMMDD
 * @returns string
 */
export const getFolderNameByDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
};

/**
 * get string of today
 * @returns
 */
export const getTodaySytemString = (format: string = 'YYYY-MM-DD') => {
  return dayjs().format(format);
};

/**
 * get string of today
 * @returns
 */
export const getTodayString = (format: string = 'YYYY-MM-DD') => {
  return dayjs().utcOffset(offset).format(format);
};

/**
 * get string of today
 * @returns
 */
export const getTimeUTCString = (format: string = 'YYYY-MM-DD') => {
  return dayjs().utc().format(format);
};

/**
 * get string of today
 * @returns
 */
export const execFormatDate = (
  dateStr: string,
  format: string = 'YYYY-MM-DD'
) => {
  return dayjs(dateStr).format(format);
};

/**
 * get string of today
 * @returns
 */
export const execFormatTimeOnly = (
  timeStr: string,
  format: string = 'HH:mm:ss'
) => {
  return dayjs('1970-00-00 ' + timeStr).format(format);
};

/**
 * get string of today
 * @returns
 */
export const execFormatDateForQuery = (
  dateStr: string,
  endOfDay: boolean = false
) => {
  let date = dayjs(dateStr);
  // Regular expression to match date format YYYY-MM-DD
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  // Check if the date string matches the date-only format
  if (dateOnlyRegex.test(dateStr) && endOfDay) {
    date = date.endOf('day');
  }

  return date.add(offset * -1, 'minute').format('YYYY-MM-DD HH:mm:ss');
};

/**
 * get string of today
 * @returns
 */
export const getDayOrNow = (dateStr: string, format: string = 'YYYY-MM') => {
  if (dateStr == '') {
    return dayjs().format(format);
  }

  const date = dayjs(dateStr);
  if (!date.isValid()) {
    return dayjs().format(format);
  }

  return date.format(format);
};

/**
 * operation date
 * @returns
 */
export const execAddDay = (
  dateStr: string,
  num: number,
  type: ManipulateType = 'day',
  format: string = 'YYYY-MM-DD'
) => {
  const date = dayjs(dateStr).add(num, type);
  return date.format(format);
};

/**
 * get month of the moment with timezone UTC and time at 0h00
 * @returns
 */
export const getNowLocalMonth = () => {
  let now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return `${month}-${year}`;
};

/**
 * convert string to date of UTC with Oh00
 * @param dateStr
 * @returns
 */
export const convertDateNoTimeUTC = (dateStr: string) => {
  let date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return new Date(Date.UTC(year, month, day, 0, 0, 0));
};

/**
 * convert string to date of local with Oh00
 * @param dateStr
 * @returns
 */
export const convertDateNoTimeLocal = (dateStr: string) => {
  let date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return new Date(`${year}-${month}-${day} 0:0:0`);
};

/**
 * generate days of month
 * @param year number
 * @param month number
 * @returns string[]
 */
export const getDaysInMonth = (year: number, month: number) => {
  let startDay = dayjs(`${year}-${month}-01`);
  const endDay = startDay.endOf('month');

  const daysOfMonth = [];
  // Loop through each day of the month
  while (startDay.isBefore(endDay)) {
    // Using dayjs to clone the date object
    daysOfMonth.push(startDay.format('YYYY-MM-DD'));
    startDay = startDay.add(1, 'day');
  }

  return daysOfMonth;
};

/**
 * use check string format of month
 * @param month MM/YYYY or MM-YYYY
 * @returns true|false
 */
export const isValidMonthString = (month: string) => {
  const monthRegex = /^(0[1-9]|1[0-2])[-\/]\d{4}$/;
  if (!monthRegex.test(month.toString())) {
    return false;
  }
  return true;
};

/**
 * use check string format of date
 * @param date
 * @returns
 */
export const isValidDateString = (date: string) => {
  try {
    return dayjs(date).isValid();
  } catch (e) {
    return false;
  }
};

/**
 *
 * @param date1Str string format YYYY-MM-DD
 * @param date2Str string format YYYY-MM-DD
 * @returns
 */
export const isDateLessThan = (date1Str: string, date2Str: string) => {
  // Parse the input dates
  const date1 = dayjs(date1Str);
  const date2 = dayjs(date2Str);

  // Compare the two dates
  return date2.isAfter(date1);
};

/**
 *
 * @param date1Str string format YYYY-MM-DD
 * @param date2Str string format YYYY-MM-DD
 * @returns
 */
export const isDateAfter = (date1Str: string, date2Str: string) => {
  // Parse the input dates
  const date1 = dayjs(date1Str);
  const date2 = dayjs(date2Str);

  // Compare the two dates
  return date1.isAfter(date2);
};

/**
 *
 * @param date1Str string format YYYY-MM-DD
 * @param date2Str string format YYYY-MM-DD
 * @returns
 */
export const checkDateRange = (start: string, end: string) => {
  // Parse the input dates
  const date1 = dayjs(start);
  const date2 = dayjs(end);

  // Compare the two dates
  return !date2.isBefore(date1);
};

/**
 *  Calculate Difference between  two date
 * @param startDate
 * @param endDate
 * @returns
 */
export const getDateDifference = (
  startDate: string,
  endDate: string,
  hasTime: boolean = false
) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Calculate the difference in milliseconds
  const diffInMillis = end.diff(start);

  // Create a duration from the milliseconds difference
  const diffDuration = dayjs.duration(diffInMillis);

  return {
    years: diffDuration.years(),
    months: diffDuration.months(),
    days: diffDuration.days(),
    hours: diffDuration.hours(),
    minutes: diffDuration.minutes(),
    seconds: diffDuration.seconds(),
  };
};

/**
 *  Calculate Difference between  two date
 * @param startDate
 * @param endDate
 * @returns
 */
export const getDaysDifference = (startDate: string, endDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Calculate the difference in milliseconds
  const diffDays = end.diff(start, 'day');

  return diffDays;
};

/**
 * get all dates between two dates
 * @param startDate
 * @param endDate
 * @param format
 * @returns
 */
export const getAllDateString = (
  startDate: string,
  endDate: string,
  format: string = 'YYYY-MM-DD'
): string[] => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const dates: string[] = [];

  // Ensure endDate is later than startDate
  if (end.isBefore(start)) {
    throw new Error('End date must be later than start date.');
  }

  let current = start;
  dates.push(current.format(format));
  while (current.isBefore(end)) {
    current = current.add(1, 'd'); // Move to the next day
    dates.push(current.format(format));
  }

  return dates;
};

/**
 *
 * @param dateStr
 * @returns
 */
export const getFisrtLastDay = (
  dateStr: string,
  format: string = 'YYYY-MM-DD'
) => {
  let date = dayjs(dateStr).local();

  let fisrt = date.startOf('month').format(format);
  let last = date.endOf('month').format(format);

  return {
    fisrt,
    last,
  };
};

export const getTimeZone = () => {
  return dayjs.tz.guess();
};
