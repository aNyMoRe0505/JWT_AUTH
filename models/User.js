import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

import {
  jwtSign,
  jwtSignRefreshToken,
} from '../helper/jwt';

export default (sequelize) => {
  class User extends Model {
    validatePassword = (plainPassword) => bcrypt.compare(plainPassword, this.password);

    accessToken = (role) => jwtSign({
      id: this.id,
      name: this.name,
      role,
    });

    refreshToken = (role) => jwtSignRefreshToken({
      id: this.id,
      name: this.name,
      role,
    });
  }

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(plainPassword) {
        this.setDataValue('password', bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(10)));
      },
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['NORMAL', 'ADMIN'],
    },
  }, { sequelize });

  User.associate = () => {
    User.hasMany(sequelize.models.RefreshToken);
  };

  return User;
};
