module.exports = (sequelize, DataTypes) => sequelize.define('Analytics', {
  browser: DataTypes.STRING,
  version: DataTypes.STRING,
  useragent: DataTypes.STRING,
  os: DataTypes.STRING,
  device: DataTypes.STRING,
  path: DataTypes.STRING,
  user: DataTypes.STRING,
}, {
  freezeTableName: true,
  timestamps: true,
});
