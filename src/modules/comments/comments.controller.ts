import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types.js";
import * as svc from "./comments.service.js";

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id: artworkId } = req.params;
    const hasPurchased = await svc.userHasPurchased(req.user!.id, artworkId);
    if (!hasPurchased) {
      return res.status(403).json({ message: "Only buyers of this artwork can comment" });
    }
    const comment = await svc.addComment(artworkId, req.user!.id, req.user!.email, req.body.comment);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comments = await svc.getCommentsForArtwork(req.params.id);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comment = await svc.updateComment(req.params.commentId, req.user!.id, req.body.comment);
    res.json(comment);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteComment(req.params.commentId, req.user!.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}
