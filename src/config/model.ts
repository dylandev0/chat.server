import mongoose, { Schema } from 'mongoose';
import { Op, QueryTypes, Transaction } from 'sequelize';
import { mysqlSequelize } from './mysqlSequelize';

export type VirtualType = {
  des: string;
  name: string;
  localField: string;
  foreignField: string;
  relation?: string;
  justOne?: boolean;
  count?: boolean;
  match?: Object | Function;
};

export type sqlChildrenAliasType = {
  field: string;
  alias: string;
};

export const childenType = (desColection: string) => {
  return {
    type: mongoose.Types.ObjectId,
    ref: desColection,
  };
};

export const createModel = (
  collection: string,
  schema: any,
  virtuals?: VirtualType[]
) => {
  const modelSchema = new Schema(schema, {
    collection: collection,
    toObject: {
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
      },
      virtuals: true,
      getters: true,
    },
    toJSON: {
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
      },
      virtuals: true,
      getters: true,
    },
  });

  if (virtuals && virtuals.length > 0) {
    for (let virtual of virtuals) {
      modelSchema.virtual(virtual.name, {
        ref: virtual.des,
        localField: virtual.localField,
        foreignField: virtual.foreignField,
        justOne: virtual.justOne ?? false,
        count: virtual.count ?? false,
        match: { deleteAt: null, ...virtual.match },
      });
    }
  }

  return mongoose.model(collection, modelSchema);
};

export class ModelTransaction {
  private _transaction!: Transaction;

  public static async start() {
    const newself = new this();

    newself._transaction = await mysqlSequelize.transaction();

    return newself;
  }

  public transaction(): Transaction {
    return this._transaction;
  }

  public async commit(): Promise<void> {
    try {
      await this._transaction.commit().catch(reason => {
        console.log('commit error: ' + reason);
      });
    } catch (e) {}
  }

  public async rollback(): Promise<void> {
    try {
      console.log('roll back');
      await this._transaction.rollback().catch(reason => {
        console.log('rollback error: ' + reason);
      });
    } catch (e) {}
  }
}

// operatorsAliases
export const OpA = {
  $and: Op.and,
  $or: Op.or,
  $is: Op.is,
  $like: Op.like,
  $ilike: Op.iLike,
  $in: Op.in,
  $gt: Op.gt,
  $gte: Op.gte,
  $lt: Op.lt,
  $lte: Op.lte,
  $ne: Op.ne,
  $eq: Op.eq,
  $not: Op.not,
  $nin: Op.notIn,
};

export type RawQueryType = {
  sqlStr: string;
  replacements?: any;
  type?: QueryTypes;
  tran?: ModelTransaction;
};

/**
 *
 * @param sqlStr
 * @param replacements
 * @param t
 * @returns
 */
export const rawQuery = async ({
  sqlStr,
  replacements,
  type = QueryTypes.SELECT,
  tran,
}: RawQueryType) => {
  try {
    return await mysqlSequelize.query(`${sqlStr}`, {
      raw: true,
      replacements: replacements ?? undefined,
      type: type,
      transaction: tran?.transaction() ?? undefined,
    });
  } catch (e: any) {
    console.error(e.message);
    return false;
  }
};
