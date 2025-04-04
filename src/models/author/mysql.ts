// models/Author.ts
import { MysqlEntity } from '@/config/mysqlEntity';
import { DataTypes, Model, Optional } from 'sequelize';

// Define the attributes of the Author model
interface AuthorAttributes {
  id: string;
  account: string;
  password: string;
  passwordUpdateAt?: Date;
}

// Define the attributes that are optional for creation
interface AuthorCreationAttributes extends Optional<AuthorAttributes, 'id'> {}

// Define the Author model
class AuthorModel
  extends Model<AuthorAttributes, AuthorCreationAttributes>
  implements AuthorAttributes
{
  public id!: string;
  public account!: string;
  public password!: string;
  public passwordUpdateAt?: Date;

  // Timestamps
  public readonly createAt!: Date;
  public readonly updateAt!: Date;
}

export const AuthorSqlFields = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    allowNull: false,
    primaryKey: true,
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passwordUpdateAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  createAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updateAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deleteAt: {
    allowNull: true,
    type: DataTypes.DATE,
  },
};

export const AuthorTableName = 'Authors';

class AuthorEntity extends MysqlEntity<AuthorModel> {
  model = AuthorModel;
  collection = AuthorTableName;
  type = AuthorSqlFields;
  softDelete = true;
  childrens = ['user'];
}

// AuthorModel.findAll()

export const AuthorSql = AuthorEntity.createEntity();
