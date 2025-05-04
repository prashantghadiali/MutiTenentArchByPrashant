const mysql = require("mysql2/promise");
const { DB } = require("./constants");

// MySQL connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your actual MySQL password
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool for main database connection
const mainPool = mysql.createPool({
  ...dbConfig,
  database: DB.MAIN_DB,
});

// Function to create a connection pool for a specific tenant database
const createTenantConnectionPool = async (databaseName) => {
  try {
    return mysql.createPool({
      ...dbConfig,
      database: databaseName,
    });
  } catch (error) {
    console.error(
      `Error creating connection pool for database ${databaseName}:`,
      error
    );
    throw error;
  }
};

// Function to initialize the main database if it doesn't exist
const initializeMainDatabase = async () => {
  try {
    // Create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Create main database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB.MAIN_DB}`);
    console.log(`Main database ${DB.MAIN_DB} initialized`);

    // Create Super Admin table
    await connection.query(`USE ${DB.MAIN_DB}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS super_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        database_name VARCHAR(255) NOT NULL UNIQUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (created_by) REFERENCES super_admin(id)
      )
    `);

    await connection.end();
  } catch (error) {
    console.error("Error initializing main database:", error);
    throw error;
  }
};

// Function to create a new tenant database
const createTenantDatabase = async (databaseName) => {
  try {
    const connection = await mainPool.getConnection();

    // Create tenant database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);

    // Use the new database
    await connection.query(`USE ${databaseName}`);

    // Create users table in tenant database
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active'
      )
    `);

    connection.release();
    console.log(`Tenant database ${databaseName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating tenant database ${databaseName}:`, error);
    throw error;
  }
};

module.exports = {
  mainPool,
  createTenantConnectionPool,
  initializeMainDatabase,
  createTenantDatabase,
};
