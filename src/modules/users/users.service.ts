import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { getDB } from "../../config/db.js";
import { UserDoc, Role, SubscriptionTier } from "../../types.js";

const USERS = "users";

export async function getAllUsers() {
  const db = getDB();
  return db
    .collection<UserDoc>(USERS)
    .find({}, { projection: { password: 0 } })
    .toArray();
}

export async function getUserById(id: string) {
  const db = getDB();
  return db
    .collection<UserDoc>(USERS)
    .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
}

export async function updateProfile(id: string, { name, photo }: { name: string; photo: string }) {
  const db = getDB();
  await db.collection<UserDoc>(USERS).updateOne({ _id: new ObjectId(id) }, { $set: { name, photo } });
  return getUserById(id);
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  const db = getDB();
  const user = await db.collection<UserDoc>(USERS).findOne({ _id: new ObjectId(id) });
  if (!user) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err: any = new Error("Current password is incorrect");
    err.status = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.collection<UserDoc>(USERS).updateOne({ _id: new ObjectId(id) }, { $set: { password: hashed } });
}

export async function updateUserRole(id: string, role: string) {
  const db = getDB();
  const allowed: Role[] = ["user", "artist", "admin"];
  if (!allowed.includes(role as Role)) {
    const err: any = new Error("Invalid role");
    err.status = 400;
    throw err;
  }
  await db.collection<UserDoc>(USERS).updateOne({ _id: new ObjectId(id) }, { $set: { role: role as Role } });
  return getUserById(id);
}

export async function updateSubscription(id: string, tier: SubscriptionTier) {
  const db = getDB();
  await db.collection<UserDoc>(USERS).updateOne({ _id: new ObjectId(id) }, { $set: { subscriptionTier: tier } });
  return getUserById(id);
}
