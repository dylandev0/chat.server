import { ModelTransaction } from './model';

export type SorterType = {
  field: string;
  order: string;
  association?: string;
};

export type GetAllProps = {
  query?: any;
  select?: string;
  virtual?: (
    | string
    | {
        main: string;
        includes?: string[];
        alias?: string;
        sorters?: SorterType[];
      }
  )[];
  virtualConditions?: any[];
  virtualNested?: any;
  sorters?: SorterType[];
  pagenation?: { size?: number; current?: number };
  t?: ModelTransaction;
  deleteFlag?: 'nondel' | 'hasdel' | 'onlydel';
  groupby?: string;
};

export type GetOneProps = {
  query?: any;
  virtual?: (
    | string
    | {
        main: string;
        includes?: string[];
        alias?: string;
        sorters?: SorterType[];
      }
  )[];
  virtualConditions?: any[];
  virtualNested?: any;
  select?: string;
  t?: ModelTransaction;
};

export interface EntityAction {
  getALL(params: GetAllProps): Promise<any>;
  getOne(params?: {
    query?: any;
    virtual?: string[];
    select?: string;
  }): Promise<any>;

  createOne(data: any): Promise<any>;
  createMany(data: any[]): Promise<any>;

  updateById(id: string, data: any): Promise<any>;
  updateManyByQuery(quey: any, data: any): Promise<any>;

  deleteOne(id: string): Promise<any>;
  deleteMany(query: string): Promise<any>;
}
