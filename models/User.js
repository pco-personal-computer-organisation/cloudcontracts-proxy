module.exports = (sequelize, DataTypes) => sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  realm: DataTypes.STRING(512),
  username: DataTypes.STRING(512),
  password: DataTypes.STRING(512),
  credentials: DataTypes.TEXT,
  challenges: DataTypes.TEXT,
  email: DataTypes.STRING(512),
  emailVerified: DataTypes.BOOLEAN,
  verificationToken: DataTypes.STRING(512),
  status: DataTypes.STRING(512),
  created: DataTypes.DATE,
  lastUpdated: DataTypes.DATE,
  idKunde: DataTypes.INTEGER,
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  timestamps: false,
});
