module.exports = (sequelize, DataTypes) => sequelize.define('kunden', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  kdnr: DataTypes.STRING,
  status: DataTypes.INTEGER(2),
  maxusers: DataTypes.INTEGER,
  quota: DataTypes.INTEGER,
  created: DataTypes.DATE,
  createdBy: DataTypes.STRING,
  laufzeitende: DataTypes.DATE,
  instanceUrl: DataTypes.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
});
