import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types.js";
import * as svc from "./artworks.service.js";

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body, artistName: req.body.artistName };
    const artwork = await svc.createArtwork(req.user!.id, data);
    res.status(201).json(artwork);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artwork = await svc.updateArtwork(req.params.id, req.user!.id, req.body);
    res.json(artwork);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteArtwork(req.params.id, req.user!);
    res.json({ message: "Artwork deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artwork = await svc.getArtworkById(req.params.id);
    res.json(artwork);
  } catch (err) {
    next(err);
  }
}

export async function browse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.browseArtworks(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function featured(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artworks = await svc.getFeaturedArtworks(6);
    res.json(artworks);
  } catch (err) {
    next(err);
  }
}

export async function topArtists(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artists = await svc.getTopArtists(3);
    res.json(artists);
  } catch (err) {
    next(err);
  }
}

export async function myArtworks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artworks = await svc.getArtworksByArtist(req.user!.id);
    res.json(artworks);
  } catch (err) {
    next(err);
  }
}

export async function allForAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const artworks = await svc.getAllArtworksAdmin();
    res.json(artworks);
  } catch (err) {
    next(err);
  }
}
