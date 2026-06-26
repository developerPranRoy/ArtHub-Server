import { ObjectId } from "mongodb";
import { Request } from "express";

export type Role = "user" | "artist" | "admin";
export type SubscriptionTier = "free" | "pro" | "premium";

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  subscriptionTier: SubscriptionTier;
  purchasesUsed: number;
  photo: string;
  createdAt: Date;
}

export interface ArtworkDoc {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  artistId: ObjectId;
  artistName: string;
  sold: boolean;
  createdAt: Date;
}

export interface CommentDoc {
  _id?: ObjectId;
  artworkId: ObjectId;
  userId: ObjectId;
  userName: string;
  comment: string;
  createdAt: Date;
}

export interface TransactionDoc {
  _id?: ObjectId;
  type: "purchase" | "subscription";
  userId: ObjectId;
  artworkId?: ObjectId;
  artistId?: ObjectId;
  artworkTitle?: string;
  tier?: string;
  amount: number;
  createdAt: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
