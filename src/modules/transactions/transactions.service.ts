import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { getArtworkById, markAsSold } from "../artworks/artworks.service.js";
import { TransactionDoc, UserDoc, SubscriptionTier } from "../../types.js";

const TRANSACTIONS = "transactions";
const USERS = "users";

const TIER_LIMITS: Record<SubscriptionTier, number> = { free: 3, pro: 9, premium: Infinity };

export async function canUserPurchase(user: UserDoc) {
  const tier = user.subscriptionTier || "free";
  const limit = TIER_LIMITS[tier] ?? 3;
  return (user.purchasesUsed || 0) < limit;
}

export async function recordPurchase(userId: string, artworkId: string) {
  const db = getDB();
  const user = await db.collection<UserDoc>(USERS).findOne({ _id: new ObjectId(userId) });
  const artwork = await getArtworkById(artworkId);

  if (!user) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }
  if (artwork.artistId.toString() === userId) {
    const err: any = new Error("You cannot buy your own artwork");
    err.status = 400;
    throw err;
  }
  if (artwork.sold) {
    const err: any = new Error("This artwork is already sold");
    err.status = 400;
    throw err;
  }
  const allowed = await canUserPurchase(user);
  if (!allowed) {
    const err: any = new Error("Purchase limit reached for your subscription tier. Please upgrade.");
    err.status = 403;
    throw err;
  }

  const txn: TransactionDoc = {
    type: "purchase",
    userId: new ObjectId(userId),
    artworkId: new ObjectId(artworkId),
    artistId: artwork.artistId,
    artworkTitle: artwork.title,
    amount: artwork.price,
    createdAt: new Date(),
  };
  await db.collection<TransactionDoc>(TRANSACTIONS).insertOne(txn);
  await markAsSold(artworkId);
  await db.collection<UserDoc>(USERS).updateOne({ _id: new ObjectId(userId) }, { $inc: { purchasesUsed: 1 } });

  // Simulated email notification
  console.log(`[email] Purchase confirmation sent to user ${userId} for "${artwork.title}"`);

  return txn;
}

export async function recordSubscriptionPayment(userId: string, tier: string, amount: number) {
  const db = getDB();
  const txn: TransactionDoc = {
    type: "subscription",
    userId: new ObjectId(userId),
    tier,
    amount,
    createdAt: new Date(),
  };
  await db.collection<TransactionDoc>(TRANSACTIONS).insertOne(txn);
  console.log(`[email] Subscription confirmation sent to user ${userId} (${tier})`);
  return txn;
}

export async function getUserPurchases(userId: string) {
  const db = getDB();
  return db
    .collection<TransactionDoc>(TRANSACTIONS)
    .find({ userId: new ObjectId(userId), type: "purchase" })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getArtistSales(artistId: string) {
  const db = getDB();
  return db
    .collection<TransactionDoc>(TRANSACTIONS)
    .find({ artistId: new ObjectId(artistId), type: "purchase" })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAllTransactions() {
  const db = getDB();
  return db.collection<TransactionDoc>(TRANSACTIONS).find({}).sort({ createdAt: -1 }).toArray();
}

export async function getAdminAnalytics() {
  const db = getDB();
  const [totalUsers, totalArtists, totalSold, revenueAgg, categoryAgg] = await Promise.all([
    db.collection(USERS).countDocuments({ role: "user" }),
    db.collection(USERS).countDocuments({ role: "artist" }),
    db.collection(TRANSACTIONS).countDocuments({ type: "purchase" }),
    db
      .collection(TRANSACTIONS)
      .aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
      .toArray(),
    db
      .collection("artworks")
      .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
      .toArray(),
  ]);

  return {
    totalUsers,
    totalArtists,
    totalArtworksSold: totalSold,
    totalRevenue: revenueAgg[0]?.total || 0,
    categoryBreakdown: categoryAgg,
  };
}
