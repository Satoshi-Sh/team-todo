const { MongoClient } = require("mongodb");

async function connectToMongoDB() {
  await dropDatabase();
  try {
    const url = "mongodb://localhost:27017";
    const dbName = "mydb";
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDb");
    const db = client.db(dbName);
    client.close();
    console.log("Created mydb Disconnected from MongoDb");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

async function dropDatabase() {
  try {
    const url = "mongodb://localhost:27017/mydb";
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    await db.dropDatabase();
    console.log("Dropped the database");

    client.close();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error dropping the database", error);
  }
}

module.exports.connectToMongoDB = connectToMongoDB;
