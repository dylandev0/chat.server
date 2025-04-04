import mongoose, { Model } from 'mongoose';
import { EntityAction, GetAllProps } from './entityAction';
import { VirtualType, createModel } from './model';

export class MongoEntity implements EntityAction {
  collection!: string;
  type!: any;
  virtual?: VirtualType[];

  schema!: mongoose.Schema;
  model!: Model<any>;

  constructor() {}

  static createEntity() {
    const newself = new this();

    newself.createModel();

    return newself;
  }

  private createModel() {
    this.model = createModel(this.collection, this.type, this.virtual);
  }

  getModel() {
    return this.model;
  }

  /**
   * Get All record
   * @param params
   * @returns
   */
  async getALL(params?: GetAllProps) {
    let result = this.model.find(params?.query ?? {});

    if (params?.sorters) {
      let mogoSort: { [key: string]: 1 | -1 } = {};
      try {
        for (let sort of params.sorters) {
          mogoSort[sort.field] = sort.order === 'desc' ? -1 : 1;
        }
        result.sort(mogoSort);
      } catch (e: any) {
        console.log(`${this.collection}: ${e.message ?? 'sort fail'}`);
      }
    }

    if (params?.pagenation) {
      let limit = params.pagenation.size ?? 25;
      let current =
        params.pagenation.current && params.pagenation.current > 1
          ? params.pagenation.current
          : 1;
      let skip = (current - 1) * limit;
      result.skip(skip).limit(limit);
    }

    if (params?.virtual && params.virtual.length > 0) {
      let populate: any = [];
      for (let name of params.virtual!) {
        populate?.push({ path: name });
      }
      result.populate(populate);
    }

    if (params?.select) {
      result.select(params?.select);
    }

    return await result.exec();
  }

  async count(query: any) {
    let result = this.model.countDocuments(query);

    return await result.exec();
  }

  async getOne(params?: { query?: any; virtual?: string[]; select?: string }) {
    let result = this.model.findOne(params?.query ?? {});

    if (params?.virtual && params.virtual.length > 0) {
      let populate: any = [];
      for (let name of params.virtual!) {
        populate?.push({ path: name });
      }
      result.populate(populate);
    }

    if (params?.select) {
      result.select(params?.select);
    }

    return await result.exec();
  }

  async getOneById(id: string, params?: { virtual?: string[] }) {
    let result = this.model.findById(id);

    if (params?.virtual && params.virtual.length > 0) {
      let populate: any = [];
      for (let name of params.virtual!) {
        populate?.push({ path: name });
      }
      result.populate(populate);
    }

    return await result.exec();
  }

  // CREATE
  async createOne(data: any) {
    const newRecord = new this.model(data);
    return await newRecord.save();
  }

  async createMany(data: any[]) {
    return await this.model.create(data);
  }

  // UPDATE
  async updateById(id: string, data: any) {
    return await this.model.findByIdAndUpdate(id, { ...data }, { new: true });
  }

  async updateManyByQuery(query: any, data: any) {
    return await this.model.updateMany(query, data);
  }

  // DELETE
  async deleteOne(id: string) {
    let obj = await this.model.findById(id);

    if ('deleteAt' in this.type) {
      return await this.model.findByIdAndUpdate(id, { deleteAt: Date.now() });
    } else {
      return await this.model.deleteOne({ _id: obj._id });
    }
  }

  async deleteMany(query: any) {
    if ('deleteAt' in this.type) {
      return await this.model.updateMany(query, { deleteAt: Date.now() });
    } else {
      return await this.model.deleteMany(query);
    }
  }
}
