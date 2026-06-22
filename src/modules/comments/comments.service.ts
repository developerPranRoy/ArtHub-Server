import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { CommentDoc, TransactionDoc } from "../../types.js";

const COMMENTS = "comments";
const TRANSACTIONS = "transactions";

export async function userHasPurchased(userId: string, artworkId: string) {
  const db = getDB();
  const purchase = await db.collection<TransactionDoc>(TRANSACTIONS).findOne({
    userId: new ObjectId(userId),
    artworkId: new ObjectId(artworkId),
    type: "purchase",
  });
  return Boolean(purchase);
}

export async function addComment(artworkId: string, userId: string, userName: string, text: string) {
  const db = getDB();
  const doc: CommentDoc = {
    artworkId: new ObjectId(artworkId),
    userId: new ObjectId(userId),
    userName,
    comment: text,
    createdAt: new Date(),
  };
  const result = await db.collection<CommentDoc>(COMMENTS).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getCommentsForArtwork(artworkId: string) {
  const db = getDB();
  return db
    .collection<CommentDoc>(COMMENTS)
    .find({ artworkId: new ObjectId(artworkId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateComment(id: string, userId: string, text: string) {
  const db = getDB();
  const comment = await db.collection<CommentDoc>(COMMENTS).findOne({ _id: new ObjectId(id) });
  if (!comment) {
    const err: any = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  if (comment.userId.toString() !== userId) {
    const err: any = new Error("Not allowed to edit this comment");
    err.status = 403;
    throw err;
  }
  await db.collection<CommentDoc>(COMMENTS).updateOne({ _id: new ObjectId(id) }, { $set: { comment: text } });
  return { ...comment, comment: text };
}

export async function deleteComment(id: string, userId: string) {
  const db = getDB();
  const comment = await db.collection<CommentDoc>(COMMENTS).findOne({ _id: new ObjectId(id) });
  if (!comment) {
    const err: any = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  if (comment.userId.toString() !== userId) {
    const err: any = new Error("Not allowed to delete this comment");
    err.status = 403;
    throw err;
  }
  await db.collection<CommentDoc>(COMMENTS).deleteOne({ _id: new ObjectId(id) });
}
