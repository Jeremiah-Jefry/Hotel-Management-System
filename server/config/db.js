const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

// Use SQLite for development (no MySQL installation needed)
// Switch to MySQL for production by setting DB_DIALECT=mysql in .env
const dialect = process.env.DB_DIALECT || 'sqlite';

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hotelease_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? false : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );
} else {
  // SQLite for easy development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connected (${dialect})`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
