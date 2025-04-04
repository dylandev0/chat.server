import { EntityAction, GetAllProps, GetOneProps } from './entityAction';

import { mysqlSequelize } from '@/config/mysqlSequelize';
import { execFormatDate } from '@/utils/datatime';
import {
  Attributes,
  CountOptions,
  FindOptions,
  Model,
  Op,
  QueryTypes,
} from 'sequelize';
import { ModelTransaction } from './model';

export class MysqlEntity<TModelAttribute extends Model>
  implements EntityAction
{
  collection!: string;
  type!: any;

  pk: string | string[] = 'id';
  softDelete: boolean = false;
  hasUpdateTime: boolean = true;
  childrens?: string[];
  dateTypeCols: string[] = [];

  // schema!: mongoose.Schema
  model!: typeof Model<any, any>;

  constructor() {}

  static createEntity() {
    const newself = new this();

    newself.createModel();

    return newself;
  }

  private createModel() {
    this.model = mysqlSequelize.define<
      TModelAttribute,
      Attributes<TModelAttribute>
    >(this.collection, this.type, {
      // sequelize: mysqlSequelize,
      tableName: this.collection,
      paranoid: this.softDelete,
      createdAt: 'createAt',
      updatedAt: this.hasUpdateTime ? 'updateAt' : false,
      deletedAt: this.softDelete ? 'deleteAt' : false,
    });
  }

  getModel() {
    return this.model;
  }

  /**
   * Get All record
   * @param params
   * @returns
   */
  async getALL(params?: GetAllProps): Promise<Attributes<TModelAttribute>[]> {
    try {
      let findOpt: FindOptions<Attributes<TModelAttribute>> = {};
      findOpt.where = params?.query ?? {};
      if (this.softDelete && params?.deleteFlag !== 'hasdel') {
        if (params?.deleteFlag === 'onlydel') {
          findOpt.where = {
            ...findOpt.where,
            deleteAt: { [Op.ne]: null as any },
          };
        } else {
          // case null or nondel
          findOpt.where = { ...findOpt.where, deleteAt: null as any };
        }
      }

      if (params?.sorters) {
        findOpt.order = [];
        try {
          for (let sort of params.sorters) {
            let orderItem: any = [
              sort.field,
              sort.order === 'desc' ? 'desc' : 'asc',
            ];
            if (sort.association) {
              if (this.childrens?.includes(sort.association)) {
                orderItem.unshift(`${sort.association}Info`);
              } else {
                orderItem.unshift(`${sort.association}`);
              }
            }
            findOpt.order.push(orderItem);
          }
        } catch (e: any) {
          console.error(`${this.collection}: ${e.message ?? 'sort fail'}`);
        }
      }

      if (params?.pagenation) {
        let limit = params.pagenation.size ?? 25;
        let current =
          params.pagenation.current && params.pagenation.current > 1
            ? params.pagenation.current
            : 1;
        let skip = (current - 1) * limit;
        findOpt.offset = skip;
        findOpt.limit = typeof limit !== 'number' ? parseInt(limit) : limit;
      }

      if (params?.virtual && params.virtual.length > 0) {
        findOpt.include = [];
        for (let name of params.virtual!) {
          let association: any = {};
          let associationRequired = null;
          let virtualModel: string = '';
          if (typeof name === 'string') {
            const [model, field] = name.split(':');
            virtualModel = model;
            if (field === 'count') {
              association.attributes = ['id'];
            } else if (field) {
              association.attributes = field.split(',');
            }

            if (this.childrens?.includes(model)) {
              association.association = `${model}Info`;
            } else {
              association.association = `${model}`;
            }
          } else {
            const [model, field] = name.main.split(':');
            virtualModel = model;
            if (field === 'count') {
              association.attributes = ['id'];
            } else if (field) {
              association.attributes = field.split(',');
            }

            if (this.childrens?.includes(model)) {
              association.association = `${model}Info`;
            } else {
              association.association = `${model}`;
            }

            if (name.sorters) {
              association.order = [];
              for (let sort of name.sorters) {
                let associationorderItem: any = [
                  sort.field,
                  sort.order === 'desc' ? 'desc' : 'asc',
                ];
                association.order.push(associationorderItem);
              }
            }

            association.include = [];
            if (name.includes) {
              for (let nestedName of name.includes) {
                const nestedAssociation: any = {};
                let [nestedModel, nestedField] = nestedName.split(':');
                if (nestedField === 'count') {
                  nestedAssociation.attributes = ['id'];
                } else if (nestedField) {
                  nestedAssociation.attributes = nestedField.split(',');
                }
                nestedAssociation.association = `${nestedModel}`;

                association.include.push(nestedAssociation);
              }
            }
          }
          /** Handle for virtual conditions query */
          if (
            params?.virtualConditions &&
            params.virtualConditions.length > 0
          ) {
            params?.virtualConditions.forEach((query: any) => {
              if (query.model === virtualModel) {
                if (query.conditions.length > 0) {
                  association.where = [];
                  query.conditions.forEach((objCondition: any) => {
                    association.where.push(objCondition);
                  });
                }
                // check if association is required in conditions query
                if (typeof query.required !== 'undefined') {
                  associationRequired = query.required;
                }
              }
            });
          }
          /** Handle nested relation queries */
          if (
            params.virtualNested !== undefined &&
            params.virtualNested.length > 0
          ) {
            association.include = [];
            const nestedAssociation = this.buildNestedAssociation(
              virtualModel,
              params.virtualNested
            );
            if (nestedAssociation && nestedAssociation !== null) {
              association.include = nestedAssociation;
              if (nestedAssociation.required !== 'undefined') {
                association.required = nestedAssociation.required;
              }
            }
          }

          findOpt.include.push(association);
        }
      }

      // select
      if (params?.select) {
        findOpt.attributes = params?.select.split(',');
      }

      // group by
      if (params?.groupby) {
        findOpt.group = params?.groupby;
      }

      // @ts-ignore
      const result = await this.model.findAll(findOpt);

      return result.map(p => {
        let row = p.toJSON();
        if (params?.virtual && params.virtual.length > 0) {
          for (let name of params.virtual!) {
            let modelName = typeof name === 'string' ? name : name.main;
            const [model, field] = modelName.split(':');

            if (field === 'count') {
              row[`${model}Count`] = row[model].length ?? 0;
            }

            if (this.childrens?.includes(model) && row[`${model}Info`]) {
              row[model] = row[`${model}Info`];
              delete row[`${model}Info`];
            }
            if (row?.hasOwnProperty(`${model}Info`)) {
              delete row[`${model}Info`];
            }
          }
        }
        return row;
      });
    } catch (e: any) {
      console.error('Select all Errors', e.message);
      return [];
    }
  }

  private buildNestedAssociation = (model: any, objQuery: any) => {
    let objAcssociation: any = [];
    objQuery.forEach((query: any) => {
      if (query.required !== undefined) {
      }
      if (query.src === model) {
        if (query.dst !== undefined && query.dst.length > 0) {
          objAcssociation = this.processingNestedObj(query);
        }
      }
    });
    return objAcssociation;
  };

  private processingNestedObj = (targetObj: any) => {
    const nested: {
      association: string;
      attributes: string;
      where: any;
      include: any;
      required: any;
    } = {
      association: '',
      attributes: '',
      where: [],
      include: [],
      required: true,
    };
    // Iterate through the keys in the object
    for (const key in targetObj) {
      // Check if the current property is an object itself (nested object)
      if (typeof targetObj[key] === 'object' && targetObj[key] !== null) {
        // Recursively call the function to check nested objects
        if (key === 'dst') {
          nested.association = targetObj[key][0].alias;
          nested.attributes = targetObj[key][0].cols;
          if (targetObj.required !== undefined)
            nested.required = targetObj.required;

          if (
            targetObj[key][0].conditions &&
            targetObj[key][0].conditions.length > 0
          ) {
            nested.where = targetObj[key][0].conditions;
          }
          // If the current value matches the targetName, increment the count
          if (
            typeof targetObj[key][0].dst !== 'undefined' &&
            targetObj[key][0].dst.length > 0
          ) {
            nested.include.push(this.processingNestedObj(targetObj['dst'][0]));
          } else {
            delete nested['include'];
            delete nested['where'];
            delete nested['required'];
          }
        }
      }
    }
    return nested;
  };

  async count(
    query: any,
    group?: string[],
    deleteFlag: 'nondel' | 'hasdel' | 'onlydel' = 'nondel'
  ) {
    try {
      let countOpt: any = { where: query };
      if (group) {
        countOpt['group'] = group;
        countOpt['attributes'] = group;
      } else {
        countOpt = countOpt as Omit<CountOptions<Attributes<any>>, 'group'>;
      }
      if (deleteFlag == 'hasdel' || deleteFlag == 'onlydel') {
        countOpt.paranoid = false;
      }

      // @ts-ignore
      const count = await this.model.count(countOpt);

      if (group) {
        return count;
      } else {
        //@ts-ignore
        return count as number;
      }
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  async getOne(params?: GetOneProps): Promise<Attributes<TModelAttribute>> {
    try {
      let findOpt: FindOptions<Attributes<TModelAttribute>> = {};
      findOpt.where = params?.query ?? {};

      if (params?.virtual && params.virtual.length > 0) {
        findOpt.include = [];
        for (let name of params.virtual!) {
          let association: any = {};
          let virtualModel: string = '';
          if (typeof name === 'string') {
            const [model, field] = name.split(':');
            virtualModel = model;
            if (field === 'count') {
              association.attributes = ['id'];
            } else if (field) {
              association.attributes = field.split(',');
            }

            if (this.childrens?.includes(model)) {
              association.association = `${model}Info`;
            } else {
              association.association = `${model}`;
            }
          } else {
            const [model, field] = name.main.split(':');
            virtualModel = model;
            if (field === 'count') {
              association.attributes = ['id'];
            } else if (field) {
              association.attributes = field.split(',');
            }

            if (this.childrens?.includes(model)) {
              association.association = `${model}Info`;
            } else {
              association.association = `${model}`;
            }

            if (name.alias) {
              association.alias = name.alias;
            }

            association.include = [];
            if (name.includes) {
              for (let nestedName of name.includes) {
                const nestedAssociation: any = {};
                let [nestedModel, nestedField] = nestedName.split(':');
                if (nestedField === 'count') {
                  nestedAssociation.attributes = ['id'];
                } else if (nestedField) {
                  nestedAssociation.attributes = nestedField.split(',');
                }
                nestedAssociation.association = `${nestedModel}`;

                association.include.push(nestedAssociation);
              }
            }
          }

          /** Handle for virtual conditions query */
          if (
            params?.virtualConditions &&
            params.virtualConditions.length > 0
          ) {
            params?.virtualConditions.forEach((query: any) => {
              if (query.model === virtualModel) {
                if (query.conditions.length > 0) {
                  association.where = [];
                  query.conditions.forEach((objCondition: any) => {
                    association.where.push(objCondition);
                  });
                }
              }
            });
          }
          /** Handle nested relation queries */
          if (
            params.virtualNested !== undefined &&
            params.virtualNested.length > 0
          ) {
            association.include = [];
            const nestedAssociation = this.buildNestedAssociation(
              virtualModel,
              params.virtualNested
            );
            if (nestedAssociation && nestedAssociation !== null) {
              association.include = nestedAssociation;
            }
          }

          findOpt.include.push(association);
        }
      }

      if (params?.select) {
        findOpt.attributes = params?.select.split(',');
      }

      // @ts-ignore
      const result = await this.model.findOne(findOpt);

      const data = result?.toJSON() ?? null;

      if (params?.virtual && params.virtual.length > 0) {
        for (let name of params.virtual!) {
          let modelName = typeof name === 'string' ? name : name.main;
          const [model, field] = modelName.split(':');

          if (field === 'count') {
            data[`${model}Count`] = data[model].length ?? 0;
          }

          if (this.childrens?.includes(model) && data[`${model}Info`]) {
            data[model] = data[`${model}Info`];
            delete data[`${model}Info`];
          }
          if (data?.hasOwnProperty(`${model}Info`)) {
            delete data[`${model}Info`];
          }
        }
      }

      return data;
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  async getOneById(id: string, params?: { virtual?: string[] }) {
    try {
      if (!id) {
        return null;
      }

      let findOpt: FindOptions<Attributes<TModelAttribute>> = {};

      if (params?.virtual && params.virtual.length > 0) {
        findOpt.include = [];
        for (let name of params.virtual!) {
          const [model, field] = name.split(':');
          let association: any = {};
          if (field === 'count') {
            association.attributes = ['id'];
          } else if (field) {
            association.attributes = field.split(',');
          }

          if (this.childrens?.includes(model)) {
            association.association = `${model}Info`;
          } else {
            association.association = `${model}`;
          }

          findOpt.include.push(association);
        }
      }

      // @ts-ignore
      const result = await this.model.findByPk(id, findOpt);

      const data = result?.toJSON() ?? null;

      if (data && params?.virtual && params.virtual.length > 0) {
        for (let name of params.virtual!) {
          const [model, field] = name.split(':');

          if (field === 'count') {
            data[`${model}Count`] = data[model].length ?? 0;
          }

          if (this.childrens?.includes(model) && data[`${model}Info`]) {
            data[model] = data[`${model}Info`];
            delete data[`${model}Info`];
          }
        }
      }

      return data;
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  // CREATE
  async createOne(data: any, t?: ModelTransaction) {
    try {
      let submitData = this.handelDataCreateUpdate(data);
      // @ts-ignore
      const result = await this.model.create(submitData, {
        returning: true,
        transaction: t?.transaction() ?? null,
      });

      return result?.toJSON();
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  async createMany(data: any[], t?: ModelTransaction) {
    try {
      let entity = this;
      let submitData = data.map(row => {
        return entity.handelDataCreateUpdate(row);
      });
      // @ts-ignore
      const result = await this.model.bulkCreate(submitData, {
        transaction: t?.transaction() ?? null,
      });

      return result.map(p => {
        return p.toJSON();
      });
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  // UPDATE
  async updateById(id: string, data: any, t?: ModelTransaction) {
    let query = this.handelPkQuery({}, [id]);

    try {
      let submitData = this.handelDataCreateUpdate(data);
      // @ts-ignore
      const [count, _] = await this.model.update(submitData, {
        where: query,
        transaction: t?.transaction() ?? null,
      });
      if (count <= 0) {
        return null;
      }

      // @ts-ignore
      const result = await this.model.findOne({
        where: query,
      });

      return result?.toJSON();
    } catch (e: any) {
      console.error(e);
      return false;
    }
    // return await this.model.findByIdAndUpdate(id, {...data}, {"new" : true});
  }

  async updateManyByQuery(query: any, data: any, t?: ModelTransaction) {
    try {
      let submitData = this.handelDataCreateUpdate(data);
      // @ts-ignore
      const [count, _] = await this.model.update(submitData, {
        where: query,
        transaction: t?.transaction() ?? null,
      });
      if (count <= 0) {
        return null;
      }

      // @ts-ignore
      const rows = await this.model.findAll({
        where: query,
      });
      const result = rows.map(p => {
        return p.toJSON();
      });

      return {
        count: count,
        rows: result,
      };
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  /**
   * Uopdate multiple rows with muliple columns by one query
   * The sample raw query will be like this:
   * UPDATE table_name
   * SET column1 = CASE
   *    WHEN id = 1 THEN 'NewValue1'
   *    WHEN id = 2 THEN 'NewValue2'
   *    ELSE column1
   *   END,
   *   column2 = CASE
   *   WHEN id = 1 THEN 'NewValue1'
   *   WHEN id = 2 THEN 'NewValue2'
   *   ELSE column2
   *   END
   * WHERE id IN ('1', '2');
   * @param fields require an format like this:
   * fields: {
   *     queryConditions: {id: '1'},
   *     dataCollection: {column1: 'NewValue1', column2: 'NewValue2'}
   * }
   * @returns
   */
  async bulkUpdateById(fields: any, data: any, t?: ModelTransaction) {
    if (data.length === 0) return;
    try {
      fields.indexOf('updateAt') === -1 ? fields.push('updateAt') : fields;
      const statementContent: any = [];
      fields.forEach((field: string, index: number) => {
        statementContent.push({
          [field]: `${field} = CASE `,
        });
      });
      /** Build Condition Statement Query */
      const idList = data.map((item: any) => item.queryConditions.id);
      let updateQueryStatement = /*sql*/ '';
      const renderQueryStatements: any = [];
      data.forEach((item: any) => {
        let countConditions = 1;
        const totalConditions = Object.keys(item.queryConditions).length;
        let conditionStatement = '';
        for (const [conditionKey, conditionValue] of Object.entries(
          item.queryConditions
        )) {
          conditionStatement += /*sql*/ `${conditionKey} = "${conditionValue}"`;
          conditionStatement +=
            countConditions < totalConditions ? ' AND ' : '';
          countConditions++;
        }
        for (const [key, value] of Object.entries(item.dataCollection)) {
          renderQueryStatements.push({
            [key]: `WHEN ${conditionStatement} THEN "${value}" `,
          });
        }
      });

      /** Find total elements by keys  */
      const totalElementStatementByKey: any = [];
      fields.forEach((field: any) => {
        let count = 0;
        totalElementStatementByKey[field] = 0;
        renderQueryStatements.forEach((data: any) => {
          if (field === Object.keys(data)[0]) {
            count++;
            totalElementStatementByKey[field] = count;
          }
        });
      });

      /** Build Ending statement Query */
      statementContent.forEach((field: any) => {
        const flag: any = {};
        flag[field] = 0;
        let targetFieldCount = 0;
        renderQueryStatements.forEach((data: any, countQuery: number) => {
          if (Object.keys(field)[0] === Object.keys(data)[0]) {
            targetFieldCount++;
            if (flag[field] === 0) {
              updateQueryStatement += `${field[Object.keys(field)[0]]} ${data[Object.keys(field)[0]]}`;
            } else {
              updateQueryStatement += `${data[Object.keys(field)[0]]}`;
            }
            if (
              targetFieldCount <
              totalElementStatementByKey[Object.keys(field)[0]]
            ) {
              flag[field]++;
            } else {
              updateQueryStatement += ' END';
              if (countQuery < renderQueryStatements.length - 1) {
                updateQueryStatement += ', ';
              } else {
                updateQueryStatement += ' ';
              }
            }
          }
        });
      });

      const rawQuery = `
        UPDATE ${this.model.tableName}
        SET 
            ${updateQueryStatement}
        WHERE id IN (:id_list)`;
      const result: any = await this.model.sequelize?.query(rawQuery, {
        type: QueryTypes.UPDATE,
        transaction: t?.transaction() ?? null,
        replacements: {
          id_list: idList,
        },
      });

      /** Result will contain an empty array and  the number of affected rows. => Results: Promise<[undefined, number]>
       * If the number of affected rows is equal to the length of the data array, then the update was successful
       */
      if (result[1] === data.length) {
        return true;
      } else {
        return false;
      }
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  // DELETE
  async deleteOne(id: string, t?: ModelTransaction) {
    try {
      let query = this.handelPkQuery({}, [id]);
      // @ts-ignore
      return await this.model.destroy({
        where: query,
        transaction: t?.transaction() ?? null,
      });
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  async deleteMany(query: any, t?: ModelTransaction) {
    try {
      // @ts-ignore
      return await this.model.destroy({
        where: query,
        transaction: t?.transaction() ?? null,
      });
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  private handelPkQuery = (query: any, pkVal: string[]) => {
    let newQuery = { ...query };
    if (typeof this.pk == 'string') {
      newQuery[this.pk] = pkVal[0];
    } else {
      let idx = 0;
      for (let pkField of this.pk) {
        newQuery[pkField] = pkVal[idx] ?? null;
        idx++;
      }
    }
    return newQuery;
  };

  private handelDataCreateUpdate = (data: any) => {
    let handelData = { ...data };
    for (let field in handelData) {
      if (this.type[field] && handelData[field] != '') {
        if (
          this.type[field].type?.key == 'DATEONLY' &&
          typeof handelData[field] == 'string'
        ) {
          handelData[field] = execFormatDate(handelData[field], 'YYYY-MM-DD');
        }
      }
    }

    return handelData;
  };
}
