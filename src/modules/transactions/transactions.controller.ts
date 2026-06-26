import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types.js";
import * as svc from "./transactions.service.js";

export async function purchase(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { artworkId } = req.body;
    const txn = await svc.recordPurchase(req.user!.id, artworkId);
    res.status(201).json(txn);
  } catch (err) {
    next(err);
  }
}

export async function subscribe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { tier, amount } = req.body;
    const txn = await svc.recordSubscriptionPayment(req.user!.id, tier, amount);
    res.status(201).json(txn);
  } catch (err) {
    next(err);
  }
}

export async function myPurchases(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const purchases = await svc.getUserPurchases(req.user!.id);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
}

export async function mySales(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sales = await svc.getArtistSales(req.user!.id);
    res.json(sales);
  } catch (err) {
    next(err);
  }
}

export async function allTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const txns = await svc.getAllTransactions();
    res.json(txns);
  } catch (err) {
    next(err);
  }
}

export async function analytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.getAdminAnalytics();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
