'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Restaurant.belongsTo(models.Category, { foreignKey: 'categoryId' })
      Restaurant.hasMany(models.Comment, { foreignKey: 'restaurantId' })
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    openingHours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    view_counts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Restaurant',
    underscored: true
  })
  return Restaurant
}
