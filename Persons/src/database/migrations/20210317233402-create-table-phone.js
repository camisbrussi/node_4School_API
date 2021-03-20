'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('phone', {

      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey:true,
      },
      person_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:  {
          model: 'person',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      },
      number:{
        type: Sequelize.STRING(11),
        allowNull: false
      },
      is_whatsapp:{
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('phone');
  }
};
