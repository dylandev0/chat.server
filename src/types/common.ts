import { convertDateNoTimeUTC } from '@/utils/datatime';

export const DateNoTimeType = {
  type: Date,
  get: (value: any) => {
    if (!value) {
      return '';
    }
    let date = new Date(
      value.getTime() - value.getTimezoneOffset() * 60 * 1000
    );
    return date.toISOString().substring(0, 10).replaceAll('-', '/');
  },
  set: (value: any) => {
    if (typeof value == 'undefined' || !value) {
      return '';
    }

    return convertDateNoTimeUTC(value);
  },
};

export type FilterOptionType = {
  name: string;
  operations: string[];
  alias?: string;
};

export type OptionToNameType = {
  [key: string]: string;
};
