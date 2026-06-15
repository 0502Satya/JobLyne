"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import {
  getWalletBalanceAction,
  topUpWalletAction,
  getCreditBalanceAction,
  getSubscriptionDetailsAction,
  purchaseSubscriptionAction
} from "@/features/auth/actions";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: string;
  reference_type: string;
  reference_id: string;
  status: string;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  features: {
    cv_unlocks?: number;
    job_postings?: number;
  };
  billing_cycle: string;
  currency: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: string;
  tax_amount: string;
  pdf_url: string;
  issued_at: string;
}

interface ActiveSub {
  id: string;
  plan_details: Plan;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: string;
  usage?: {
    feature_key: string;
    used_count: number;
    limit_count: number;
  }[];
}


export default function CompanyBillingPage() {
  const router = useRouter();

  // State Management
  const [wallet, setWallet] = useState<{ balance: string; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<{ available_credits: number; credit_type_name: string } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [submittingPurchaseId, setSubmittingPurchaseId] = useState<string | null>(null);

  // Load All Commerce Data
  const loadCommerceData = async () => {
    try {
      const walletRes = await getWalletBalanceAction();
      const creditsRes = await getCreditBalanceAction();
      const subDetailsRes = await getSubscriptionDetailsAction();

      if (walletRes.error || creditsRes.error || subDetailsRes.error) {
        setActionError("Failed to fetch organizational billing details. Please reload the page.");
      } else {
        setWallet({
          balance: walletRes.balance,
          currency: walletRes.currency
        });
        setTransactions(walletRes.recent_transactions || []);
        setCredits({
          available_credits: creditsRes.available_credits,
          credit_type_name: creditsRes.credit_type_name
        });
        setPlans(subDetailsRes.plans || []);
        setActiveSub(subDetailsRes.active_subscription);
        setInvoices(subDetailsRes.invoices || []);
      }
    } catch (err) {
      setActionError("A connection error occurred while fetching organizational billing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommerceData();
  }, []);

  // Handle Wallet Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError("Please enter a valid positive deposit amount.");
      return;
    }

    setSubmittingDeposit(true);
    try {
      const res = await topUpWalletAction(amt);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(`Successfully deposited $${amt.toFixed(2)} to corporate wallet!`);
        setWallet({ balance: res.balance, currency: res.currency });
        setTransactions(res.recent_transactions || []);
        setDepositAmount("100");
      }
    } catch (err) {
      setActionError("Failed to complete deposit. Try again later.");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Handle Subscription Upgrades
  const handlePurchaseSubscription = async (planId: string, planName: string) => {
    setActionError(null);
    setActionSuccess(null);
    setSubmittingPurchaseId(planId);

    try {
      const res = await purchaseSubscriptionAction(planId);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(`Success! Corporate profile upgraded to ${planName}.`);
        await loadCommerceData();
      }
    } catch (err) {
      setActionError("Failed to activate plan due to a connection error.");
    } finally {
      setSubmittingPurchaseId(null);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col box-sizing-border-box overflow-hidden max-w-full">
      {/* Header bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/company" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
            JobLyne Enterprise
          </Link>
          <span className="bg-teal-500/10 text-teal-400 text-xs px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
            Organization Billing
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/company" className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 px-3 min-h-[44px] flex items-center">
            Corporate Console
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors py-2 px-3 min-h-[44px] flex items-center"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        
        {/* Status Toast Panel */}
        {(actionError || actionSuccess) && (
          <div className="w-full max-w-full">
            {actionError && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-sm sm:text-base">
                <span className="font-bold">Error:</span> {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-sm sm:text-base">
                <span className="font-bold">Success:</span> {actionSuccess}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 rounded-full border-2 border-t-teal-400 border-r-transparent border-b-teal-400 border-l-transparent animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse text-sm">Loading corporate commerce gates...</p>
          </div>
        ) : (
          <>
            {/* Top Cards Section: Corporate Wallet & Limits usage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
              
              {/* Corporate Navy-Blue/Teal Debit Card Panel */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-sm justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Company Corporate Wallet
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Pre-funded organization credit wallet. Manage shared recruitment allocations, team subscription seats, and direct candidate sourcing unlocks.
                  </p>

                  {/* Gorgeous teal-gradient virtual credit card */}
                  <div className="w-full max-w-[420px] aspect-[1.586/1] bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 rounded-2xl p-6 shadow-2xl shadow-teal-500/10 flex flex-col justify-between relative overflow-hidden border border-teal-300/30">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] origin-top transform translate-x-4 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs font-semibold text-teal-950 uppercase tracking-widest opacity-80">
                          Organization Pool
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1">
                          JobLyne Enterprise Card
                        </span>
                      </div>
                      <div className="w-10 h-8 bg-white/10 backdrop-blur-md rounded-md flex items-center justify-center text-xs font-bold text-white border border-white/20">
                        VISA
                      </div>
                    </div>

                    {/* Chip representation */}
                    <div className="w-10 h-8 bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 rounded-md border border-teal-600/30 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-y-0 left-1/3 w-px bg-teal-800/20"></div>
                      <div className="absolute inset-y-0 right-1/3 w-px bg-teal-800/20"></div>
                      <div className="absolute inset-x-0 top-1/2 h-px bg-teal-800/20"></div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-teal-950 opacity-80">
                        Available Balance
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
                        ${parseFloat(wallet?.balance || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider text-teal-950 opacity-60">
                          Account Owner
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                          {companyNameMock(wallet?.balance)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-teal-950 opacity-60 block">
                          Card Status
                        </span>
                        <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit inputs & controller */}
                <form onSubmit={handleDeposit} className="w-full flex flex-col gap-4 border-t border-slate-800/80 pt-6 mt-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-300">
                    Pre-Fund Organizational Wallet
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[120px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-sm text-slate-100 font-semibold focus:outline-none focus:border-teal-400 transition-colors min-h-[44px]"
                        placeholder="Amount"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingDeposit}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 text-sm tracking-wide min-h-[44px] shadow-lg shadow-white/5 active:scale-95"
                    >
                      {submittingDeposit ? "Processing..." : "Deposit Funds"}
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["50", "100", "250", "500"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold min-h-[44px] transition-colors ${
                          depositAmount === preset
                            ? "bg-teal-400/10 border-teal-400 text-teal-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        +${preset}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Subscription Usage & Circular limit bars */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-sm shadow-2xl justify-between">
                <div className="flex flex-col gap-5">
                  <h2 className="text-xl font-bold text-slate-100">
                    Corporate Limits & Seats
                  </h2>
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Corporate Plan:</span>
                      <span className="text-sm font-extrabold text-teal-400 uppercase tracking-wider bg-teal-400/5 px-2 py-0.5 rounded border border-teal-400/10">
                        {activeSub ? activeSub.plan_details.name : "Free Basic Sourcing"}
                      </span>
                    </div>
                    {activeSub && (
                      <div className="text-xs text-slate-500 border-t border-slate-800 pt-3 flex justify-between">
                        <span>Expires: {new Date(activeSub.end_date).toLocaleDateString()}</span>
                        <span>Auto-Renews: {activeSub.auto_renew ? "Yes" : "No"}</span>
                      </div>
                    )}
                  </div>

                  {/* Sourcing Credits Balance */}
                  <div className="bg-teal-400/[0.02] border border-teal-400/10 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-16 h-16 bg-teal-400/5 rounded-full pointer-events-none"></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-teal-400 uppercase tracking-widest font-semibold">
                        Shared Company Pool
                      </span>
                      <span className="text-sm text-slate-300 font-medium">
                        {credits?.credit_type_name || "Talent Sourcing Credits"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-teal-400 block leading-none">
                        {credits?.available_credits ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wide block mt-1 uppercase">
                        Unlocks Left
                      </span>
                    </div>
                  </div>

                  {/* Subscription feature limits */}
                  <div className="flex flex-col gap-4 mt-1">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Organizational Usage Details
                    </span>
                    {activeSub && activeSub.usage && activeSub.usage.length > 0 ? (
                      activeSub.usage.map((item) => {
                        const percent = item.limit_count > 0 ? Math.min(100, (item.used_count / item.limit_count) * 100) : 0;
                        const label = item.feature_key === "cv_unlocks" ? "CV Contact Unlocks Sourced" : "Featured Job Postings Loaded";
                        return (
                          <div key={item.feature_key} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end text-xs font-semibold">
                              <span className="text-slate-300">{label}</span>
                              <span className="text-slate-400">
                                {item.used_count} / {item.limit_count}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                              <div
                                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-xs italic">
                        No active corporate subscriptions. Purchase a plan below to activate company-wide credits.
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-4 flex gap-2">
                  <span className="text-teal-500 font-bold">💡 Tip:</span>
                  <span>Corporate profiles share pre-funded balances and talent CV unlock credit limits dynamically across all connected team accounts.</span>
                </div>
              </div>
            </div>

            {/* Subscription Packages Upgrades Matrix */}
            <div className="flex flex-col gap-6 w-full pt-4">
              <div className="text-center sm:text-left flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-100">
                  Upgrade Subscription & Corporate Pricing
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Choose a subscription plan matching your company recruiting throughput. Instant deductions apply to your pre-funded corporate wallet.
                </p>
              </div>

              {/* Plans Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {plans.map((p) => {
                  const isActive = activeSub && activeSub.plan_details.id === p.id;
                  const canPurchase = !isActive;
                  const isSufficient = wallet ? parseFloat(wallet.balance) >= parseFloat(p.price) : false;

                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm transition-all border ${
                        isActive
                          ? "bg-teal-400/[0.03] border-teal-400 shadow-xl shadow-teal-400/5 ring-1 ring-teal-400"
                          : "bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/30"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                          Active Package
                        </span>
                      )}

                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1 pt-2">
                          <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                            Corporate Level
                          </span>
                          <h3 className="text-xl font-bold text-slate-100">{p.name}</h3>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-white">${parseFloat(p.price).toFixed(0)}</span>
                          <span className="text-slate-400 text-xs font-semibold">/month</span>
                        </div>

                        {/* Feature Checks */}
                        <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 pt-5">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{p.features.cv_unlocks} Recruiter CV Unlocks</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{p.features.job_postings} Premium Job Openings</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>AI Candidate Rank & Sourcing Engine</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Secure Team Chats & Inboxes</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-8">
                        {isActive ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-teal-400/10 text-teal-400 font-bold rounded-xl border border-teal-400/20 text-xs sm:text-sm tracking-wide min-h-[44px]"
                          >
                            Currently Active Plan
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchaseSubscription(p.id, p.name)}
                            disabled={submittingPurchaseId !== null || (!isSufficient && canPurchase)}
                            className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all min-h-[44px] flex items-center justify-center ${
                              isSufficient
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-950 shadow"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                            }`}
                          >
                            {submittingPurchaseId === p.id ? (
                              <div className="w-5 h-5 rounded-full border-2 border-t-teal-400 border-r-transparent border-b-teal-400 border-l-transparent animate-spin"></div>
                            ) : isSufficient ? (
                              `Upgrade for $${parseFloat(p.price).toFixed(0)}`
                            ) : (
                              "Insufficient Corporate Funds"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoices & Wallet Transactions Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full pt-4">
              
              {/* Transactions Panel */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl flex flex-col gap-5 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-100">
                  Corporate Wallet Ledger
                </h3>
                <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[420px] table-fixed">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/40">
                        <th className="p-3 w-1/3">Type</th>
                        <th className="p-3 w-1/4">Amount</th>
                        <th className="p-3 w-1/4">Status</th>
                        <th className="p-3 w-1/4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-3 font-semibold capitalize truncate">{tx.reference_type}</td>
                            <td className="p-3 font-medium">
                              <span className={tx.transaction_type === "deposit" ? "text-emerald-400" : "text-amber-500"}>
                                {tx.transaction_type === "deposit" ? "+" : "-"}${parseFloat(tx.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 text-xs">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 italic text-xs">
                            No corporate ledger entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoices Panel */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl flex flex-col gap-5 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-100">
                  Corporate Invoices History
                </h3>
                <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[420px] table-fixed">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/40">
                        <th className="p-3 w-1/3">Invoice ID</th>
                        <th className="p-3 w-1/4">Total Charged</th>
                        <th className="p-3 w-1/4">Date</th>
                        <th className="p-3 w-1/4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invoices.length > 0 ? (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-3 font-semibold font-mono truncate">{inv.invoice_number}</td>
                            <td className="p-3 font-bold text-slate-200">
                              ${parseFloat(inv.total_amount).toFixed(2)}
                            </td>
                            <td className="p-3 text-slate-500 text-xs">
                              {new Date(inv.issued_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-center">
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(`Downloading corporate invoice receipt: ${inv.invoice_number}`);
                                }}
                                className="text-teal-400 hover:text-teal-300 font-bold text-xs uppercase tracking-wide hover:underline cursor-pointer min-h-[44px] flex items-center justify-center"
                              >
                                PDF
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 italic text-xs">
                            No corporate billing invoices found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Utility to mock corporate account name
function companyNameMock(balance: string | undefined): string {
  if (!balance) return "CORPORATE ACCT";
  return "ACME GLOBAL INC";
}
