const { Sequelize, Model, DataTypes } = require('@sequelize/core');
const db = require('../db');

const File = db.sequelize.define('file', {
  name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    album: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
});

(async () => {
  await db.sequelize.sync({ force: false });
  // Code here
})();

exports.File = File;