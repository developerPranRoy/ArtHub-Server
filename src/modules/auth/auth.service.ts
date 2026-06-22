import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../../config/db.js";
import { UserDoc, Role } from "../../types.js";

const USERS = "users";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function signToken(user: UserDoc) {
  return jwt.sign(
    { id: user._id!.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );
}

export async function registerUser({ name, email, password, role }: RegisterInput) {
  const db = getDB();
  const existing = await db.collection<UserDoc>(USERS).findOne({ email });
  if (existing) {
    const err: any = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const allowedRoles: Role[] = ["user", "artist"];
  const finalRole: Role = allowedRoles.includes(role as Role) ? (role as Role) : "user";

  const hashed = await bcrypt.hash(password, 10);
  const doc: UserDoc = {
    name,
    email,
    password: hashed,
    role: finalRole,
    subscriptionTier: "free",
    purchasesUsed: 0,
    photo: "",
    createdAt: new Date(),
  };

  const result = await db.collection<UserDoc>(USERS).insertOne(doc);
  const user: UserDoc = { ...doc, _id: result.insertedId };
  const token = signToken(user);
  return { token, user: sanitize(user) };
}

export async function loginUser({ email, password }: LoginInput) {
  const db = getDB();
  const user = await db.collection<UserDoc>(USERS).findOne({ email });
  if (!user) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  const token = signToken(user);
  return { token, user: sanitize(user) };
}

function sanitize(user: UserDoc) {
  const { password, ...rest } = user;
  return rest;
}
