import { prisma, isDbAvailable } from '../db/client.js';
import { memoryUsers, InMemoryUser } from './auth.service.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export interface WalletTransactionItem {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amountInPaise: number;
  amount: number;
  balanceAfterInPaise: number;
  balanceAfter: number;
  source: string;
  referenceId?: string;
  description: string;
  createdAt: string;
  date: string;
}

export interface LoyaltyTransactionItem {
  id: string;
  userId: string;
  points: number;
  balanceAfterPoints: number;
  source: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface GiftCardItem {
  id: string;
  code: string;
  pin: string;
  initialInPaise: number;
  balanceInPaise: number;
  isRedeemed: boolean;
  redeemedByUserId?: string;
  redeemedAt?: string;
  expiresAt: string;
}

// In-Memory fallback stores
const memoryWalletLedger: WalletTransactionItem[] = [];
const memoryLoyaltyLedger: LoyaltyTransactionItem[] = [];
const memoryGiftCards: GiftCardItem[] = [
  {
    id: 'gc-1',
    code: 'SBGIFT500',
    pin: '1234',
    initialInPaise: 50000,
    balanceInPaise: 50000,
    isRedeemed: false,
    expiresAt: '2027-12-31T23:59:59Z',
  },
  {
    id: 'gc-2',
    code: 'SBGIFT1000',
    pin: '5678',
    initialInPaise: 100000,
    balanceInPaise: 100000,
    isRedeemed: false,
    expiresAt: '2027-12-31T23:59:59Z',
  },
  {
    id: 'gc-3',
    code: 'FASHION2026',
    pin: '9999',
    initialInPaise: 250000,
    balanceInPaise: 250000,
    isRedeemed: false,
    expiresAt: '2027-12-31T23:59:59Z',
  },
];

// Helper to calculate tier
export function calculateTier(points: number): {
  tier: 'Silver' | 'Gold' | 'Platinum';
  nextTier: string;
  progressPercent: number;
} {
  if (points >= 5000) {
    return { tier: 'Platinum', nextTier: 'VIP Elite', progressPercent: 100 };
  }
  if (points >= 1000) {
    const progress = Math.min(100, Math.round(((points - 1000) / 4000) * 100));
    return { tier: 'Gold', nextTier: 'Platinum', progressPercent: progress };
  }
  const progress = Math.min(100, Math.round((points / 1000) * 100));
  return { tier: 'Silver', nextTier: 'Gold', progressPercent: progress };
}

export class LedgerService {
  /* ============================================================
   * 1. WALLET LEDGER
   * ============================================================ */

  async getWalletBalanceAndHistory(userId: string) {
    const dbUp = await isDbAvailable();
    let balanceInPaise = 0;
    let transactions: WalletTransactionItem[] = [];

    if (dbUp) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            walletLedger: { orderBy: { createdAt: 'desc' }, take: 50 },
          },
        });

        if (user) {
          balanceInPaise = user.walletBalanceInPaise;
          transactions = user.walletLedger.map((w) => ({
            id: w.id,
            userId: w.userId,
            type: w.type === 'CREDIT' ? 'credit' : 'debit',
            amountInPaise: w.amountInPaise,
            amount: Math.round(w.amountInPaise / 100),
            balanceAfterInPaise: w.balanceAfterInPaise,
            balanceAfter: Math.round(w.balanceAfterInPaise / 100),
            source: w.source,
            referenceId: w.referenceId || undefined,
            description: w.description,
            createdAt: w.createdAt.toISOString(),
            date: w.createdAt.toISOString(),
          }));
          return {
            balanceInPaise,
            balance: Math.round(balanceInPaise / 100),
            transactions,
          };
        }
      } catch {
        // Fallback to memory
      }
    }

    // In-memory fallback
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        balanceInPaise = u.walletBalanceInPaise;
        break;
      }
    }

    const userTransactions = memoryWalletLedger
      .filter((tx) => tx.userId === userId)
      .slice(0, 50);

    return {
      balanceInPaise,
      balance: Math.round(balanceInPaise / 100),
      transactions: userTransactions,
    };
  }

  async creditWallet(
    userId: string,
    amountInPaise: number,
    source: string,
    description: string,
    referenceId?: string
  ) {
    if (amountInPaise <= 0) {
      throw new BadRequestError('Credit amount must be greater than zero.');
    }

    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        return await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) throw new NotFoundError('User not found');

          const newBalance = user.walletBalanceInPaise + amountInPaise;

          await tx.user.update({
            where: { id: userId },
            data: { walletBalanceInPaise: newBalance },
          });

          const entry = await tx.walletLedgerEntry.create({
            data: {
              userId,
              type: 'CREDIT',
              amountInPaise,
              balanceAfterInPaise: newBalance,
              source,
              referenceId,
              description,
            },
          });

          return {
            balanceInPaise: newBalance,
            balance: Math.round(newBalance / 100),
            entry,
          };
        });
      } catch {
        // Fallback to memory
      }
    }

    // In-memory update
    let user: InMemoryUser | undefined;
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        user = u;
        break;
      }
    }

    const currentBalance = user?.walletBalanceInPaise || 0;
    const newBalance = currentBalance + amountInPaise;
    if (user) {
      user.walletBalanceInPaise = newBalance;
    }

    const now = new Date().toISOString();
    const transactionItem: WalletTransactionItem = {
      id: `wtx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: 'credit',
      amountInPaise,
      amount: Math.round(amountInPaise / 100),
      balanceAfterInPaise: newBalance,
      balanceAfter: Math.round(newBalance / 100),
      source,
      referenceId,
      description,
      createdAt: now,
      date: now,
    };

    memoryWalletLedger.unshift(transactionItem);

    return {
      balanceInPaise: newBalance,
      balance: Math.round(newBalance / 100),
      entry: transactionItem,
    };
  }

  async debitWallet(
    userId: string,
    amountInPaise: number,
    source: string,
    description: string,
    referenceId?: string
  ) {
    if (amountInPaise <= 0) {
      throw new BadRequestError('Debit amount must be greater than zero.');
    }

    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        return await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) throw new NotFoundError('User not found');

          if (user.walletBalanceInPaise < amountInPaise) {
            throw new BadRequestError(
              `Insufficient wallet balance. Available: ₹${Math.round(
                user.walletBalanceInPaise / 100
              )}, Required: ₹${Math.round(amountInPaise / 100)}`
            );
          }

          const newBalance = user.walletBalanceInPaise - amountInPaise;

          await tx.user.update({
            where: { id: userId },
            data: { walletBalanceInPaise: newBalance },
          });

          const entry = await tx.walletLedgerEntry.create({
            data: {
              userId,
              type: 'DEBIT',
              amountInPaise,
              balanceAfterInPaise: newBalance,
              source,
              referenceId,
              description,
            },
          });

          return {
            balanceInPaise: newBalance,
            balance: Math.round(newBalance / 100),
            entry,
          };
        });
      } catch (err: any) {
        if (err instanceof BadRequestError) throw err;
      }
    }

    // In-memory update
    let user: InMemoryUser | undefined;
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        user = u;
        break;
      }
    }

    const currentBalance = user?.walletBalanceInPaise || 0;
    if (currentBalance < amountInPaise) {
      throw new BadRequestError(
        `Insufficient wallet balance. Available: ₹${Math.round(
          currentBalance / 100
        )}, Required: ₹${Math.round(amountInPaise / 100)}`
      );
    }

    const newBalance = currentBalance - amountInPaise;
    if (user) {
      user.walletBalanceInPaise = newBalance;
    }

    const now = new Date().toISOString();
    const transactionItem: WalletTransactionItem = {
      id: `wtx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: 'debit',
      amountInPaise,
      amount: Math.round(amountInPaise / 100),
      balanceAfterInPaise: newBalance,
      balanceAfter: Math.round(newBalance / 100),
      source,
      referenceId,
      description,
      createdAt: now,
      date: now,
    };

    memoryWalletLedger.unshift(transactionItem);

    return {
      balanceInPaise: newBalance,
      balance: Math.round(newBalance / 100),
      entry: transactionItem,
    };
  }

  /* ============================================================
   * 2. LOYALTY LEDGER & TIER ENGINE
   * ============================================================ */

  async getLoyaltyBalanceAndHistory(userId: string) {
    const dbUp = await isDbAvailable();
    let points = 0;
    let transactions: LoyaltyTransactionItem[] = [];

    if (dbUp) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            loyaltyLedger: { orderBy: { createdAt: 'desc' }, take: 50 },
          },
        });

        if (user) {
          points = user.loyaltyPoints;
          transactions = user.loyaltyLedger.map((l) => ({
            id: l.id,
            userId: l.userId,
            points: l.points,
            balanceAfterPoints: l.balanceAfterPoints,
            source: l.source,
            referenceId: l.referenceId || undefined,
            description: l.points > 0 ? `Earned ${l.points} points` : `Redeemed ${Math.abs(l.points)} points`,
            createdAt: l.createdAt.toISOString(),
          }));
        }
      } catch {
        // Fallback to memory
      }
    }

    if (points === 0) {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          points = u.loyaltyPoints;
          break;
        }
      }
    }

    const tierInfo = calculateTier(points);

    return {
      points,
      tier: tierInfo.tier,
      nextTier: tierInfo.nextTier,
      progressPercent: tierInfo.progressPercent,
      worthInRupees: Math.floor(points / 10),
      transactions:
        transactions.length > 0
          ? transactions
          : memoryLoyaltyLedger.filter((l) => l.userId === userId).slice(0, 50),
    };
  }

  async addLoyaltyPoints(
    userId: string,
    points: number,
    source: string,
    referenceId?: string
  ) {
    if (points <= 0) return;

    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        return await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) throw new NotFoundError('User not found');

          const newPoints = user.loyaltyPoints + points;
          const { tier } = calculateTier(newPoints);

          await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: newPoints, loyaltyTier: tier },
          });

          await tx.loyaltyLedgerEntry.create({
            data: {
              userId,
              points,
              balanceAfterPoints: newPoints,
              source,
              referenceId,
            },
          });
        });
      } catch {
        // Fallback to memory
      }
    }

    // In-memory
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        const newPoints = u.loyaltyPoints + points;
        u.loyaltyPoints = newPoints;
        u.loyaltyTier = calculateTier(newPoints).tier;

        memoryLoyaltyLedger.unshift({
          id: `ltx-${Date.now()}`,
          userId,
          points,
          balanceAfterPoints: newPoints,
          source,
          referenceId,
          description: `Earned ${points} Insider Points (${source})`,
          createdAt: new Date().toISOString(),
        });
        break;
      }
    }
  }

  async deductLoyaltyPoints(
    userId: string,
    points: number,
    source: string,
    referenceId?: string
  ) {
    if (points <= 0) return;

    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        return await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) throw new NotFoundError('User not found');

          if (user.loyaltyPoints < points) {
            throw new BadRequestError('Insufficient loyalty points');
          }

          const newPoints = user.loyaltyPoints - points;
          const { tier } = calculateTier(newPoints);

          await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: newPoints, loyaltyTier: tier },
          });

          await tx.loyaltyLedgerEntry.create({
            data: {
              userId,
              points: -points,
              balanceAfterPoints: newPoints,
              source,
              referenceId,
            },
          });
        });
      } catch {
        // Fallback to memory
      }
    }

    // In-memory
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        const newPoints = Math.max(0, u.loyaltyPoints - points);
        u.loyaltyPoints = newPoints;
        u.loyaltyTier = calculateTier(newPoints).tier;

        memoryLoyaltyLedger.unshift({
          id: `ltx-${Date.now()}`,
          userId,
          points: -points,
          balanceAfterPoints: newPoints,
          source,
          referenceId,
          description: `Redeemed ${points} Insider Points (${source})`,
          createdAt: new Date().toISOString(),
        });
        break;
      }
    }
  }

  /* ============================================================
   * 3. GIFT CARD REDEMPTION
   * ============================================================ */

  async redeemGiftCard(userId: string, code: string, pin: string) {
    const cleanCode = code.trim().toUpperCase();
    const cleanPin = pin.trim();

    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        // Check Prisma gift card
      } catch {
        // Fallback to memory
      }
    }

    const card = memoryGiftCards.find(
      (c) => c.code.toUpperCase() === cleanCode
    );

    if (!card) {
      throw new BadRequestError(`Gift card code '${code}' is invalid.`);
    }

    if (card.pin !== cleanPin) {
      throw new BadRequestError('Invalid Gift Card PIN. Please check and try again.');
    }

    if (card.isRedeemed) {
      throw new BadRequestError('This gift card has already been redeemed.');
    }

    if (new Date(card.expiresAt) < new Date()) {
      throw new BadRequestError('This gift card has expired.');
    }

    // Mark as redeemed
    card.isRedeemed = true;
    card.redeemedByUserId = userId;
    card.redeemedAt = new Date().toISOString();

    // Credit to user's wallet via append-only ledger
    const creditResult = await this.creditWallet(
      userId,
      card.balanceInPaise,
      'GIFT_CARD',
      `Redeemed Gift Card (${card.code})`,
      card.id
    );

    return {
      success: true,
      redeemedAmountInPaise: card.balanceInPaise,
      redeemedAmount: Math.round(card.balanceInPaise / 100),
      newWalletBalanceInPaise: creditResult.balanceInPaise,
      newWalletBalance: creditResult.balance,
      message: `Gift Card successfully redeemed! ₹${Math.round(
        card.balanceInPaise / 100
      ).toLocaleString('en-IN')} added to your StyleBazaar Wallet.`,
    };
  }
}

export const ledgerService = new LedgerService();
