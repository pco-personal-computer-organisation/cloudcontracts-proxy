module.exports = (sequelize, DataTypes) => sequelize.define('AccessToken', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  ttl: DataTypes.INTEGER,
  created: DataTypes.DATE,
  userId: DataTypes.INTEGER,
}, {
  freezeTableName: true,
  timestamps: false,
});
