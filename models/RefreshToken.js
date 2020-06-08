import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class RefreshToken extends Model {
  }

  RefreshToken.init({
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, { sequelize });

  RefreshToken.associate = () => {
    RefreshToken.belongsTo(sequelize.models.User);
  };

  return RefreshToken;
};
