import { DataTypes, Model, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

interface CardsAttributes {
  id: number;
  title: string;
  content: string;
  position: number;
  fk_dropper: number;
  elements_draw: string;
  created_at: Date;
  updated_at: Date;
}
//TO DO: Change upperCase Columns Table to lowerCase
interface CardsCreationAttributes extends Optional<CardsAttributes, 'id'> {}

export class Cards extends Model<CardsAttributes, CardsCreationAttributes> {
  public id!: number;
  public title!: string;
  public content!: string;
  public position!: number;
  public fk_dropper!: number;
  public elements_draw!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    Cards.belongsTo(models.Dropper, {
      foreignKey: 'fk_dropper',
      as: 'dropper',
    });
  }
}

export default (sequelize: Sequelize, DataTypes: any) => {
  Cards.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fk_dropper: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      elements_draw: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'cards',
    }
  );

  return Cards;
};