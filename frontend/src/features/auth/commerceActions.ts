"use server";

import { authenticatedFetch } from "./apiClient";
import { API_BASE_URL } from "./config";

/**
 * Fetch recruiter/company wallet balance and transaction histories
 */
export async function getWalletBalanceAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/commerce/wallet/`);
    if (!res.ok) return { error: "Failed to fetch wallet balance" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Top up/deposit funds into the virtual wallet
 */
export async function topUpWalletAction(amount: number) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/commerce/wallet/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });
    const responseData = await res.json();
    if (!res.ok) return { error: responseData.error || "Failed to deposit funds" };
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Fetch available recruiter CV unlock sourcing credits
 */
export async function getCreditBalanceAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/commerce/credits/`);
    if (!res.ok) return { error: "Failed to fetch credit balance" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Fetch active subscriptions, standard billing plans, and past invoices
 */
export async function getSubscriptionDetailsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/commerce/subscriptions/`);
    if (!res.ok) return { error: "Failed to fetch subscription details" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Purchase or upgrade a subscription tier
 */
export async function purchaseSubscriptionAction(planId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/commerce/subscriptions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: planId }),
    });
    const responseData = await res.json();
    if (!res.ok) return { error: responseData.error || "Failed to purchase subscription" };
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}
