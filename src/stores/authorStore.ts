import { GetAllProps, GetOneProps } from '@/config/entityAction';
import { ModelTransaction } from '@/config/model';
import { Author } from '@/models/author';

export const getAllAuthors = async (query?: GetAllProps) =>
  await Author.getALL(query);

export const getAuthor = async (option?: GetOneProps) =>
  await Author.getOne(option);

export const getAuthorById = async (authorId: string) =>
  await Author.getOneById(authorId);

export const updateAuthorById = async (authorId: string, data: any, t?: any) =>
  await Author.updateById(authorId, data, t);

export const createAuthor = async (data: any, t?: ModelTransaction) =>
  await Author.createOne(data, t);

export const removeAuthorById = async (id: string, t?: ModelTransaction) =>
  await Author.deleteOne(id, t);

export const removeAuthorByUser = async (userId: string, t?: any) =>
  await Author.deleteMany({ user: userId }, t);
