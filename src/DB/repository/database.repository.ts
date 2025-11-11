import {
  CreateOptions,
  DeleteResult,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

export type Lean<T> = FlattenMaps<T>;

export abstract class DatabaseRepository<
  TRowDocument,
  TDocument = HydratedDocument<TRowDocument>,
> {
  protected constructor(protected model: Model<TDocument>) {}
  async find({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TRowDocument>;
    select?: ProjectionType<TRowDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
  }): Promise<TDocument[] | [] | Lean<TDocument>[]> {
    const doc = this.model.find(filter || {}).select(select || '');

    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.skip) {
      doc.skip(options.skip);
    }
    if (options?.limit) {
      doc.limit(options.limit);
    }
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();
  }

  async paginate({
    filter = {},
    select,
    options = {},
    page = 'all',
    size = 5,
  }: {
    filter?: RootFilterQuery<TRowDocument>;
    select?: ProjectionType<TRowDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
    page?: number | 'all';
    size?: number;
  }): Promise<{
      docsCount?:number,
      limit?:number,
      pages?:number,
      currentPage?:number|undefined,
      result:TDocument[]|Lean<TDocument>[],
    }> {
    let docsCount: number | undefined = undefined;
    let pages: number | undefined = undefined;
    if (page !== 'all') {
      page = Math.floor(!page || page < 1 ? 1 : page);
      options.limit = Math.floor(size < 1 || !size ? 5 : size);
      options.skip = (page - 1) * options.limit;

      docsCount = await this.model.countDocuments(filter);
      pages = Math.ceil(docsCount / options.limit);
    }
    const result = await this.find({ filter, select, options });
    return {
      docsCount,
      limit: options.limit,
      pages,
      currentPage: page !== 'all' ? page : undefined,
      result,
    };
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TRowDocument>;
    select?: ProjectionType<TRowDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | null | Lean<TDocument>> {
    const doc = this.model.findOne(filter).select(select || '');

    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();
  }

  async create({
    data,
    options,
  }: {
    data: Partial<TRowDocument>[];
    options?: CreateOptions | undefined;
  }): Promise<TDocument[]> {
    return (await this.model.create(data, options)) || [];
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<TRowDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument>;
  }): Promise<UpdateWriteOpResult> {
    if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: { $add: ['$__v', 1] },
        },
      });
      return await this.model.updateOne(filter || {}, update, options);
    }
    return await this.model.updateOne(
      filter || {},
      {  $inc: { __v: 1 },...update },
      options,
    );
  }

  async deleteOne({
    filter,
  }: {
    filter: RootFilterQuery<TRowDocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async deleteMany({
    filter,
  }: {
    filter: RootFilterQuery<TRowDocument>;
  }): Promise<DeleteResult> {
    return await this.model.deleteMany(filter || {});
  }

  async findById({
    id,
    options = {},
  }: {
    id: Types.ObjectId;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | Lean<TDocument> | null> {
    return this.model.findById(id, null, options);
  }

  async findByIdAndUpdate({
    id,
    update,
    options = {},
  }: {
    id: Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | Lean<TDocument> | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
  }

  async findByIdAndDelete({
    id,
    options = {},
  }: {
    id: Types.ObjectId;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | Lean<TDocument> | null> {
    return this.model.findByIdAndDelete(id, { ...options });
  }

  async findOneAndUpdate({
    filter,
    update,
    options = {new:true},
  }: {
    filter: FilterQuery<TRowDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | Lean<TDocument> | null> {
      if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: { $add: ['$__v', 1] },
        },
      });
      return await this.model.findOneAndUpdate(filter || {}, update, options);
    }
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });
  }

   async findOneAndDelete({
    filter
  }: {
    filter?: RootFilterQuery<TRowDocument>;
  }): Promise<TDocument | Lean<TDocument> | null> {
    return await this.model.findOneAndDelete(filter||{});
  }

  async insertMany({
    data,
  }: {
    data: Partial<TDocument>[];
  }): Promise<TDocument[]> {
    return (await this.model.insertMany(data)) as TDocument[];
  }
}
