import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { ArtworkDoc, JwtPayload } from "../../types.js";

const ARTWORKS = "artworks";

interface ArtworkInput {
  title: string;
  description: string;
  price: number | string;
  category: string;
  image: string;
  artistName: string;
}

export async function createArtwork(artistId: string, data: ArtworkInput) {
  const db = getDB();
  const doc: ArtworkDoc = {
    title: data.title,
    description: data.description,
    price: Number(data.price),
    category: data.category,
    image: data.image,
    artistId: new ObjectId(artistId),
    artistName: data.artistName,
    sold: false,
    createdAt: new Date(),
  };
  const result = await db.collection<ArtworkDoc>(ARTWORKS).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function updateArtwork(id: string, artistId: string, data: Partial<ArtworkInput>) {
  const db = getDB();
  const artwork = await db.collection<ArtworkDoc>(ARTWORKS).findOne({ _id: new ObjectId(id) });
  if (!artwork) {
    const err: any = new Error("Artwork not found");
    err.status = 404;
    throw err;
  }
  if (artwork.artistId.toString() !== artistId) {
    const err: any = new Error("Not allowed to edit this artwork");
    err.status = 403;
    throw err;
  }
  const update = {
    title: data.title ?? artwork.title,
    description: data.description ?? artwork.description,
    price: Number(data.price ?? artwork.price),
    category: data.category ?? artwork.category,
    image: data.image || artwork.image,
  };
  await db.collection<ArtworkDoc>(ARTWORKS).updateOne({ _id: new ObjectId(id) }, { $set: update });
  return { ...artwork, ...update };
}

export async function deleteArtwork(id: string, requester: JwtPayload) {
  const db = getDB();
  const artwork = await db.collection<ArtworkDoc>(ARTWORKS).findOne({ _id: new ObjectId(id) });
  if (!artwork) {
    const err: any = new Error("Artwork not found");
    err.status = 404;
    throw err;
  }
  const isOwner = artwork.artistId.toString() === requester.id;
  const isAdmin = requester.role === "admin";
  if (!isOwner && !isAdmin) {
    const err: any = new Error("Not allowed to delete this artwork");
    err.status = 403;
    throw err;
  }
  await db.collection<ArtworkDoc>(ARTWORKS).deleteOne({ _id: new ObjectId(id) });
}

export async function getArtworkById(id: string) {
  const db = getDB();
  const artwork = await db.collection<ArtworkDoc>(ARTWORKS).findOne({ _id: new ObjectId(id) });
  if (!artwork) {
    const err: any = new Error("Artwork not found");
    err.status = 404;
    throw err;
  }
  return artwork;
}

export async function getArtworksByArtist(artistId: string) {
  const db = getDB();
  return db
    .collection<ArtworkDoc>(ARTWORKS)
    .find({ artistId: new ObjectId(artistId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getFeaturedArtworks(limit = 6) {
  const db = getDB();
  return db
    .collection<ArtworkDoc>(ARTWORKS)
    .aggregate([{ $match: { sold: false } }, { $sample: { size: limit } }])
    .toArray();
}

interface BrowseFilters {
  search?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sort?: string;
  page?: string | number;
  limit?: string | number;
}

export async function browseArtworks({
  search,
  category,
  minPrice,
  maxPrice,
  sort,
  page = 1,
  limit = 8,
}: BrowseFilters) {
  const db = getDB();
  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { artistName: { $regex: search, $options: "i" } },
    ];
  }
  if (category && category !== "all") {
    filter.category = category;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 }; // newest first by default
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    db
      .collection<ArtworkDoc>(ARTWORKS)
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .toArray(),
    db.collection<ArtworkDoc>(ARTWORKS).countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
}

export async function getAllArtworksAdmin() {
  const db = getDB();
  return db.collection<ArtworkDoc>(ARTWORKS).find({}).sort({ createdAt: -1 }).toArray();
}

export async function markAsSold(id: string) {
  const db = getDB();
  await db.collection<ArtworkDoc>(ARTWORKS).updateOne({ _id: new ObjectId(id) }, { $set: { sold: true } });
}

export async function getTopArtists(limit = 3) {
  const db = getDB();
  return db
    .collection<ArtworkDoc>(ARTWORKS)
    .aggregate([
      { $match: { sold: true } },
      { $group: { _id: "$artistId", artistName: { $first: "$artistName" }, sales: { $sum: 1 } } },
      { $sort: { sales: -1 } },
      { $limit: limit },
    ])
    .toArray();
}
