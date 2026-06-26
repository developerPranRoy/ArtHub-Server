import { MongoClient, Db } from "mongodb";

let db: Db | undefined;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Check that server/.env exists (not .env.txt) and contains MONGODB_URI=..."
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();


  db = client.db(process.env.MONGODB_DB_NAME || "arthub");
  console.log("MongoDB connected");
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("DB not connected yet. Call connectDB() first.");
  return db;
}
