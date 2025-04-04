import { SorterType } from '@/config/entityAction';
import { OpA } from '@/config/model';
import { FilterOptionType } from '@/types/common';
import {
  execFormatDate,
  execFormatDateForQuery,
  isValidDate,
} from './datatime';

/**
 * convert csv data to json
 * @param csvString
 * @param cusHeaders
 * @returns
 */
export function csvToData(csvString: string, cusHeaders: string[] = []) {
  const rows = csvString.split('\n');

  if (rows.length < 2) {
    throw Error('csv format incorrect');
  }

  let headers = cusHeaders;
  if (cusHeaders.length <= 0) {
    headers = rows[0].split(',');
  }

  const jsonData = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',');

    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      const value = values[j].trim();

      obj[key] = value;
    }

    jsonData.push(obj);
  }
  return jsonData;
}

/**
 * handle sort for sort param of mongooes
 * @param query
 * @returns
 */
export const handleSort = (query: any, sortDefault?: SorterType[]) => {
  let sort = (query?._sort ?? '').split(',');
  let order = (query?._order ?? '').split(',');

  const sorters: { field: string; order: string }[] = [];

  if (sort.length > 0) {
    for (let key in sort) {
      if (sort[key] != '') {
        sorters.push({
          field: sort[key],
          order: order[key] ?? 'asc',
        });
      }
    }
  }

  if (sortDefault && sorters.length == 0) {
    return sortDefault;
  }

  return sorters;
};

/**
 * handle sort for sort param of mongooes
 * @param query
 * @returns
 */
export const handlePagenation = (query: any) => {
  let current = query?._pgCur;
  let size = query?._pgSize;

  if (current || size) {
    return {
      current,
      size,
    };
  }

  return undefined;
};

/**
 * handle update key from input
 * @param query
 * @returns
 */
export const handleInputData = (input: any, keys: string[]) => {
  try {
    const updateData: any = {};

    for (let key in input) {
      // skip with key no update
      if (key == 'updateAt' || key == 'createAt') continue;
      if (!keys.includes(key)) continue;
      // convert to date no time
      if (key.endsWith('Date')) {
        if (input[key] == '' || !isValidDate(input[key])) {
          updateData[key] = null;
        } else {
          updateData[key] = execFormatDate(input[key]);
        }
      } else {
        updateData[key] =
          typeof input[key] == 'string' ? input[key].trim() : input[key];
      }
    }
    updateData['updateAt'] = Date.now();

    return updateData;
  } catch (e) {
    return {};
  }
};

export function escapeLikeString(str: string) {
  return str.replace(/[%_]/g, '\\$&');
}

/**
 * handle sort for sort param of mongooes
 * @param query
 * @returns
 */
export const handleAddfilterSort = (
  fields: FilterOptionType[],
  reqQuery: any,
  _Logical: 'or' | 'and' = 'and'
) => {
  let filter: any = {};

  for (let field of fields) {
    for (let opera of field.operations) {
      let querykey = field.alias ? `${field.alias}` : `${field.name}`;
      // if(reqQuery[querykey]){
      switch (opera) {
        case 'ilike':
          querykey += '_ilike';
          if (!reqQuery[querykey]) break;
          let ilikeStr = escapeLikeString(reqQuery[querykey]);
          filter[field.name] = { [OpA.$ilike]: `%${ilikeStr}%` };
          break;
        case 'like':
          querykey += '_like';
          if (!reqQuery[querykey]) break;
          let likeStr = escapeLikeString(reqQuery[querykey]);
          filter[field.name] = { [OpA.$like]: `%${likeStr}%` };
          break;
        case 'startwith':
          querykey += '_swi';
          if (!reqQuery[querykey]) break;
          let startStr = escapeLikeString(reqQuery[querykey]);
          filter[field.name] = { [OpA.$like]: `${startStr}%` };
          break;
        case 'endwith':
          querykey += '_ewi';
          if (!reqQuery[querykey]) break;
          let endStr = escapeLikeString(reqQuery[querykey]);
          filter[field.name] = { [OpA.$like]: `%${endStr}` };
          break;
        case 'in':
          querykey += '_in';
          if (!reqQuery[querykey]) break;
          let filterVals = reqQuery[querykey]
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: any) => item);
          filter[field.name] = { ...filter[field.name], [OpA.$in]: filterVals };
          break;
        case 'not':
        case 'ne':
          querykey += `_${opera}`;
          if (!reqQuery[querykey]) break;
          filter[field.name] = {
            ...filter[field.name],
            [OpA.$ne]: reqQuery[querykey],
          };
          break;
        case 'min':
        case 'from':
        case 'gte':
          querykey += `_${opera}`;
          if (!reqQuery[querykey]) break;
          filter[field.name] = {
            ...filter[field.name],
            [OpA.$gte]: execFormatDateForQuery(
              reqQuery[querykey].replaceAll('/', '-')
            ),
          };
          break;
        case 'max':
        case 'to':
        case 'lte':
          querykey += `_${opera}`;
          if (!reqQuery[querykey]) break;
          filter[field.name] = {
            ...filter[field.name],
            [OpA.$lte]: execFormatDateForQuery(
              reqQuery[querykey].replaceAll('/', '-'),
              true
            ),
          };
          break;
        case 'gt':
          querykey += `_${opera}`;
          if (!reqQuery[querykey]) break;
          filter[field.name] = {
            ...filter[field.name],
            [OpA.$gt]: reqQuery[querykey],
          };
          break;
        case 'lt':
          querykey += `_${opera}`;
          if (!reqQuery[querykey]) break;
          filter[field.name] = {
            ...filter[field.name],
            [OpA.$lt]: reqQuery[querykey],
          };
          break;
        case 'equal':
        case 'eq':
          let eqQuerykey = querykey + '_eq';
          if (reqQuery[eqQuerykey]) {
            if (Array.isArray(reqQuery[eqQuerykey])) {
              filter[field.name] = {
                ...filter[field.name],
                [OpA.$in]: reqQuery[eqQuerykey],
              };
            } else {
              filter[field.name] = {
                ...filter[field.name],
                [OpA.$eq]: reqQuery[eqQuerykey],
              };
            }
            break;
          }
        default:
          if (!reqQuery[querykey]) break;
          if (Array.isArray(reqQuery[querykey])) {
            filter[field.name] = {
              ...filter[field.name],
              [OpA.$in]: reqQuery[querykey],
            };
          } else {
            filter[field.name] = {
              ...filter[field.name],
              [OpA.$eq]: reqQuery[querykey],
            };
          }
        // }
      }
    }
  }

  if (_Logical == 'or') {
    filter = Object.entries(filter).map(([field, val]) => {
      let query: any = {};
      query[field] = val;
      return query;
    });
  }

  return filter;
};
