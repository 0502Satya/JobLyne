"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/ui";
import {
  getWalletBalanceAction,
  topUpWalletAction,
  getCreditBalanceAction,
  getSubscriptionDetailsAction,
  purchaseSubscriptionAction,
  getCompanyProfileAction,
  getRecruiterProfileAction,
  logoutAction
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

interface BillingPageProps {
  role: "COMPANY" | "RECRUITER";
  theme: "company" | "recruiter";
}

export default function BillingPage({ role, theme }: BillingPageProps) {
  const router = useRouter();

  // State Management
  const [wallet, setWallet] = useState<{ balance: string; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<{ available_credits: number; credit_type_name: string } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<string>(role === "COMPANY" ? "100" : "50");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [submittingPurchaseId, setSubmittingPurchaseId] = useState<string | null>(null);

  // Load All Commerce Data
  const loadCommerceData = async () => {
    try {
      const [walletRes, creditsRes, subDetailsRes] = await Promise.all([
        getWalletBalanceAction(),
        getCreditBalanceAction(),
        getSubscriptionDetailsAction()
      ]);

      if (walletRes.error || creditsRes.error || subDetailsRes.error) {
        toast.error("Failed to fetch billing details. Please refresh the page.");
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

      // Fetch profile info for owner name
      if (role === "COMPANY") {
        const companyRes = await getCompanyProfileAction();
        if (companyRes && !companyRes.error) {
          setOwnerName(companyRes.company_name || "ACME GLOBAL INC");
        } else {
          setOwnerName("ACME GLOBAL INC");
        }
      } else {
        const recruiterRes = await getRecruiterProfileAction();
        if (recruiterRes && !recruiterRes.error) {
          setOwnerName(recruiterRes.full_name || "SURYA HEADHUNTER");
        } else {
          setOwnerName("SURYA HEADHUNTER");
        }
      }

    } catch (err) {
      toast.error("A connection error occurred while loading billing data.");
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
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid positive deposit amount.");
      return;
    }

    setSubmittingDeposit(true);
    try {
      const res = await topUpWalletAction(amt);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully deposited $${amt.toFixed(2)} to virtual wallet!`);
        setWallet({ balance: res.balance, currency: res.currency });
        setTransactions(res.recent_transactions || []);
        setDepositAmount(role === "COMPANY" ? "100" : "50");
      }
    } catch (err) {
      toast.error("Failed to complete deposit. Try again later.");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Handle Subscription Upgrades
  const handlePurchaseSubscription = async (planId: string, planName: string) => {
    setSubmittingPurchaseId(planId);

    try {
      const res = await purchaseSubscriptionAction(planId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Success! Profile upgraded to ${planName}.`);
        await loadCommerceData();
      }
    } catch (err) {
      toast.error("Failed to activate plan due to a connection error.");
    } finally {
      setSubmittingPurchaseId(null);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/auth/login");
  };

  // Theme Helpers
  const accentGradient = theme === "company" 
    ? "bg-gradient-company-card shadow-company-accent/10" 
    : "bg-gradient-recruiter-card shadow-recruiter-accent/10";
  
  const textGradient = theme === "company"
    ? "bg-gradient-company-text"
    : "bg-gradient-recruiter-text";

  const presetClass = (preset: string) => {
    const isSelected = depositAmount === preset;
    if (theme === "company") {
      return isSelected 
        ? "bg-company-accent/10 border-company-accent text-company-accent"
        : "bg-surface border-border text-muted hover:text-text";
    } else {
      return isSelected 
        ? "bg-recruiter-accent/10 border-recruiter-accent text-recruiter-accent"
        : "bg-surface border-border text-muted hover:text-text";
    }
  };

  const inputFocusClass = theme === "company" 
    ? "focus:border-company-accent" 
    : "focus:border-recruiter-accent";

  const buttonAccent = theme === "company" ? "company" : "recruiter";
  const badgeClass = theme === "company"
    ? "bg-company-accent/5 border-company-accent/10 text-company-accent"
    : "bg-recruiter-accent/5 border-recruiter-accent/10 text-recruiter-accent";

  const currentPlanButtonClass = theme === "company"
    ? "text-company-accent bg-company-accent/10 border-company-accent/20"
    : "text-recruiter-accent bg-recruiter-accent/10 border-recruiter-accent/20";

  const progressGradient = theme === "company"
    ? "from-company-accent to-company-gradient-end"
    : "from-recruiter-accent to-recruiter-gradient-end";

  const presets = role === "COMPANY" ? ["50", "100", "250", "500"] : ["25", "50", "100", "250"];

  return (
    <div className="max-w-full box-sizing-border-box overflow-hidden text-muted flex bg-surface min-h-screen flex-col">
      {/* Header bar */}
      <header className="border-b px-6 py-4 items-center backdrop-blur-md bg-card/60 sticky z-50 flex top-0 border-border justify-between">
        <div className="flex gap-3 items-center">
          <Link href={role === "COMPANY" ? "/company" : "/recruiter/dashboard"} className={`bg-gradient-to-r ${textGradient} type-h3 text-transparent bg-clip-text font-bold`}>
            JobLyne {role === "COMPANY" ? "Enterprise" : "Recruiter"}
          </Link>
          <span className={`px-2 border py-0.5 type-caption rounded-full ${badgeClass}`}>
            {role === "COMPANY" ? "Organization Billing" : "Billing & Wallet"}
          </span>
        </div>
        <div className="gap-4 flex items-center">
          <Link href={role === "COMPANY" ? "/company" : "/recruiter/dashboard"} className="min-h-[44px] px-3 items-center type-ui text-muted transition-colors flex py-2 hover:text-white">
            {role === "COMPANY" ? "Corporate Console" : "Sourcing Hub"}
          </Link>
          <button
            onClick={handleLogout}
            className="min-h-[44px] px-3 text-error/80 items-center type-ui transition-colors flex py-2 hover:text-error"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full mx-auto flex-1 gap-8 max-w-[1440px] py-8 flex px-4 flex-col sm:px-6">
        {loading ? (
          <div className="justify-center min-h-[400px] flex-1 items-center flex flex-col">
            <div className={`h-12 border-r-transparent border-2 w-12 mb-4 border-l-transparent rounded-full animate-spin ${
              theme === "company" ? "border-t-company-accent border-b-company-accent" : "border-t-recruiter-accent border-b-recruiter-accent"
            }`}></div>
            <p className="animate-pulse text-sm text-muted">Loading secure billing components...</p>
          </div>
        ) : (
          <>
            {/* Top Cards Section: Virtual Debit Card & Limits usage */}
            <div className="w-full grid grid-cols-1 gap-8 lg:grid-cols-12">

              {/* Debit Card Panel */}
              <div className="lg:col-span-7 rounded-3xl bg-card/40 relative overflow-hidden flex-col p-6 backdrop-blur-sm justify-between shadow-2xl flex gap-6 border-border border sm:p-8">
                <div className={`w-80 absolute blur-[100px] pointer-events-none rounded-full h-80 right-0 top-0 ${theme === "company" ? "bg-company-accent/5" : "bg-recruiter-accent/5"}`}></div>
                <div className="w-80 h-80 absolute blur-[100px] pointer-events-none left-0 rounded-full bg-primary/5 bottom-0"></div>

                <div className="flex gap-6 flex-col">
                  <h2 className="type-h3 items-center gap-2 text-muted flex font-semibold">
                    {role === "COMPANY" ? "Company Corporate Wallet" : "Billing & Virtual Wallet"}
                  </h2>
                  <p className="text-sm text-muted">
                    {role === "COMPANY" 
                      ? "Pre-funded organization credit wallet. Manage shared recruitment allocations, team subscription seats, and direct candidate sourcing unlocks."
                      : "Pre-funded virtual debit wallet for atomic subscription checkouts and real-time candidate unlock allocations."}
                  </p>

                  {/* Gorgeous virtual credit card */}
                  <div className={`w-full aspect-[1.586/1] border border-white/10 rounded-2xl relative overflow-hidden bg-gradient-to-br flex-col p-6 shadow-2xl flex justify-between max-w-[420px] ${accentGradient}`}>
                    <div className="h-full w-1/2 bg-white/5 translate-x-4 skew-x-[-20deg] absolute pointer-events-none origin-top transform right-0 top-0"></div>

                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className={`opacity-80 text-xs uppercase tracking-widest ${theme === "company" ? "text-white" : "text-on-warning"}`}>
                          {role === "COMPANY" ? "Organization Pool" : "Corporate Wallet"}
                        </span>
                        <span className="type-card-title text-white mt-1 font-bold">
                          JobLyne {role === "COMPANY" ? "Enterprise Card" : "Gold Card"}
                        </span>
                      </div>
                      <div className="bg-white/10 justify-center w-10 border-white/20 items-center backdrop-blur-md text-white h-8 flex rounded-md type-caption border font-semibold">
                        Visa
                      </div>
                    </div>

                    {/* Chip representation */}
                    <div className="bg-card-chip w-10 relative overflow-hidden border-black/10 h-8 rounded-md shadow-inner border">
                      <div className="bg-black/10 left-1/3 inset-y-0 absolute w-px"></div>
                      <div className="bg-black/10 right-1/3 inset-y-0 absolute w-px"></div>
                      <div className="bg-black/10 absolute inset-x-0 top-1/2 h-px"></div>
                    </div>

                    <div className="flex flex-col">
                      <span className={`opacity-80 text-xs uppercase tracking-widest ${theme === "company" ? "text-white" : "text-on-warning"}`}>
                        {role === "COMPANY" ? "Available Balance" : "Available Funds"}
                      </span>
                      <span className="tracking-tight weight-display leading-none text-white mt-1 text-2xl sm:text-3xl font-extrabold">
                        ${parseFloat(wallet?.balance || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className={`uppercase text-xs tracking-wider opacity-60 ${theme === "company" ? "text-white" : "text-on-warning"}`}>
                          Account Owner
                        </span>
                        <span className="text-white type-caption mt-0.5 font-medium">
                          {ownerName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`block uppercase text-xs tracking-wider opacity-60 ${theme === "company" ? "text-white" : "text-on-warning"}`}>
                          Card Status
                        </span>
                        <span className="px-2 border-white/10 text-xs uppercase bg-white/20 text-white py-0.5 tracking-wider rounded border font-semibold">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit inputs & controller */}
                <form onSubmit={handleDeposit} className="w-full border-t border-border/80 mt-2 gap-4 pt-6 flex flex-col">
                  <span className="type-caption text-muted font-medium">
                    {role === "COMPANY" ? "Pre-Fund Organizational Wallet" : "Quick Wallet Deposit Sim"}
                  </span>
                  <div className="flex gap-3 flex-wrap items-center">
                    <div className="min-w-[120px] relative flex-1">
                      <span className="left-3 text-muted absolute top-1/2 -translate-y-1/2">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className={`w-full pl-8 pr-3 min-h-[44px] type-ui py-2.5 text-muted transition-colors bg-surface border-border rounded-xl border focus:outline-none ${inputFocusClass}`}
                        placeholder="Amount"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingDeposit}
                      variant="secondary"
                      className="px-5 min-h-[44px]"
                    >
                      {submittingDeposit ? "Processing..." : "Deposit Funds"}
                    </Button>
                  </div>
                  <div className="gap-2 flex flex-wrap">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset)}
                        className={`min-h-[44px] px-3 rounded-lg py-1.5 transition-colors type-caption border font-medium ${presetClass(preset)}`}
                      >
                        +${preset}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Limits usage */}
              <div className="lg:col-span-5 rounded-3xl bg-card/40 flex-col p-6 backdrop-blur-sm shadow-2xl justify-between flex gap-6 border-border border sm:p-8">
                <div className="flex gap-5 flex-col">
                  <h2 className="type-h3 text-muted font-semibold">
                    {role === "COMPANY" ? "Corporate Limits & Seats" : "Plan Limits & Quotas"}
                  </h2>
                  <div className="gap-4 rounded-2xl flex-col bg-card/60 border-border/60 flex p-4 border sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">
                        {role === "COMPANY" ? "Corporate Plan:" : "Active Package:"}
                      </span>
                      <span className={`px-2 border type-badge py-0.5 rounded ${badgeClass}`}>
                        {activeSub ? activeSub.plan_details.name : "Free Basic Sourcing"}
                      </span>
                    </div>
                    {activeSub && (
                      <div className="border-t text-xs pt-3 flex text-muted border-border justify-between">
                        <span>Expires: {new Date(activeSub.end_date).toLocaleDateString()}</span>
                        <span>Auto-Renews: {activeSub.auto_renew ? "Yes" : "No"}</span>
                      </div>
                    )}
                  </div>

                  {/* Sourcing Credits Balance */}
                  <div className={`rounded-2xl relative overflow-hidden items-center flex justify-between p-5 border ${
                    theme === "company" ? "bg-company-accent/[0.02] border-company-accent/10" : "bg-recruiter-accent/[0.02] border-recruiter-accent/10"
                  }`}>
                    <div className={`h-16 translate-y-3 absolute pointer-events-none translate-x-3 rounded-full bottom-0 right-0 w-16 ${
                      theme === "company" ? "bg-company-accent/5" : "bg-recruiter-accent/5"
                    }`}></div>
                    <div className="gap-1 flex flex-col">
                      <span className={`uppercase tracking-widest type-caption font-bold ${
                        theme === "company" ? "text-company-accent" : "text-recruiter-accent"
                      }`}>
                        {role === "COMPANY" ? "Shared Company Pool" : "Sourcing Pool"}
                      </span>
                      <span className="type-ui text-muted">
                        {credits?.credit_type_name || "Talent Sourcing Credits"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl weight-display block leading-none font-bold ${
                        theme === "company" ? "text-company-accent" : "text-recruiter-accent"
                      }`}>
                        {credits?.available_credits ?? 0}
                      </span>
                      <span className="text-muted block text-xs uppercase tracking-wide mt-1">
                        Unlocks Left
                      </span>
                    </div>
                  </div>

                  {/* Feature Limits */}
                  <div className="gap-4 flex mt-1 flex-col">
                    <span className="text-muted uppercase tracking-wider type-caption font-semibold">
                      {role === "COMPANY" ? "Organizational Usage Details" : "Subscription Usage Details"}
                    </span>
                    {activeSub && activeSub.usage && activeSub.usage.length > 0 ? (
                      activeSub.usage.map((item) => {
                        const percent = item.limit_count > 0 ? Math.min(100, (item.used_count / item.limit_count) * 100) : 0;
                        const label = item.feature_key === "cv_unlocks" ? "CV Contact Unlocks Sourced" : "Featured Job Postings Loaded";
                        return (
                          <div key={item.feature_key} className="gap-2 flex flex-col">
                            <div className="items-end flex type-caption justify-between">
                              <span className="text-muted">{label}</span>
                              <span className="text-muted">
                                {item.used_count} / {item.limit_count}
                              </span>
                            </div>
                            <div className="w-full h-2 overflow-hidden rounded-full bg-surface border-border/40 border">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${progressGradient}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="italic text-muted text-xs">
                        {role === "COMPANY"
                          ? "No active corporate subscriptions. Purchase a plan below to activate company-wide credits."
                          : "No active subscription limits. Upgrade below to gain cv sourcing unlock credentials."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-xs border-t border-border/80 gap-2 flex text-muted pt-4">
                  <span className={theme === "company" ? "text-company-accent font-bold" : "text-recruiter-accent font-bold"}>💡 Tip:</span>
                  <span>
                    {role === "COMPANY"
                      ? "Corporate profiles share pre-funded balances and talent CV unlock credit limits dynamically across all connected team accounts."
                      : "Unlocking candidate coordinate details consumes 1 sourcing credit. Recruiter plans reload unlock limits automatically monthly."}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="w-full flex-col flex gap-6 pt-4">
              <div className="gap-1 text-center flex flex-col sm:text-left">
                <h2 className="type-h3 text-muted font-semibold">
                  {role === "COMPANY" ? "Upgrade Subscription & Corporate Pricing" : "Subscription Plans & Upgrade Matrix"}
                </h2>
                <p className="max-w-2xl text-sm text-muted">
                  {role === "COMPANY"
                    ? "Choose a subscription plan matching your company recruiting throughput. Instant deductions apply to your pre-funded corporate wallet."
                    : "Select a subscription plan that aligns with your staffing goals. Upgrades are deducted instantly from your corporate wallet balance."}
                </p>
              </div>

              {/* Plans Columns Grid */}
              <div className="w-full gap-6 grid grid-cols-1 md:grid-cols-3">
                {plans.map((p) => {
                  const isActive = activeSub && activeSub.plan_details.id === p.id;
                  const canPurchase = !isActive;
                  const isSufficient = wallet ? parseFloat(wallet.balance) >= parseFloat(p.price) : false;

                  return (
                    <div
                      key={p.id}
                      className={`border rounded-3xl relative transition-all p-6 backdrop-blur-sm flex justify-between flex-col ${isActive
                          ? `shadow-xl border-${theme === "company" ? "company-accent" : "recruiter-accent"} bg-${theme === "company" ? "company-accent" : "recruiter-accent"}/[0.03]`
                          : "bg-card/20 border-border hover:bg-card/30 hover:border-border"
                        }`}
                    >
                      {isActive && (
                        <span className={`py-1 -translate-x-1/2 text-text -top-3 type-badge absolute px-3 left-1/2 rounded-full shadow font-bold ${
                          theme === "company" ? "bg-company-accent" : "bg-recruiter-accent"
                        }`}>
                          Active Package
                        </span>
                      )}

                      <div className="flex gap-6 flex-col">
                        <div className="gap-1 flex pt-2 flex-col">
                          <span className="text-muted uppercase tracking-widest type-caption">
                            {role === "COMPANY" ? "Corporate Level" : "Recruiter Level"}
                          </span>
                          <h3 className="type-h3 text-muted font-bold">{p.name}</h3>
                        </div>

                        <div className="items-baseline flex gap-1">
                          <span className="weight-display text-white text-3xl font-extrabold">${parseFloat(p.price).toFixed(0)}</span>
                          <span className="type-caption text-muted">/month</span>
                        </div>

                        {/* Feature Checks */}
                        <ul className="border-t text-xs border-border/80 gap-3 pt-5 text-muted flex flex-col sm:text-sm">
                          <li className="gap-2 flex items-center">
                            <span className="text-success">✓</span>
                            <span>{p.features.cv_unlocks} {role === "COMPANY" ? "Recruiter CV Unlocks" : "Candidate Profile Unlocks"}</span>
                          </li>
                          <li className="gap-2 flex items-center">
                            <span className="text-success">✓</span>
                            <span>{p.features.job_postings} Premium Job Openings</span>
                          </li>
                          <li className="gap-2 flex items-center">
                            <span className="text-success">✓</span>
                            <span>{role === "COMPANY" ? "AI Candidate Rank & Sourcing Engine" : "Smart AI Talent Sourcing Sort"}</span>
                          </li>
                          <li className="gap-2 flex items-center">
                            <span className="text-success">✓</span>
                            <span>{role === "COMPANY" ? "Secure Team Chats & Inboxes" : "Direct Chat & Messaging Room"}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-8">
                        {isActive ? (
                          <button
                            disabled
                            className={`w-full border min-h-[44px] py-2.5 type-caption rounded-xl border-current font-bold ${currentPlanButtonClass}`}
                          >
                            Currently Active Plan
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchaseSubscription(p.id, p.name)}
                            disabled={submittingPurchaseId !== null || (!isSufficient && canPurchase)}
                            className={`w-full justify-center min-h-[44px] items-center transition-all py-2.5 flex type-caption rounded-xl font-bold ${isSufficient
                                ? "shadow text-text bg-bg hover:bg-border"
                                : "bg-card cursor-not-allowed text-muted border-border border"
                              }`}
                          >
                            {submittingPurchaseId === p.id ? (
                              <div className={`h-5 border-2 rounded-full animate-spin border-r-transparent border-l-transparent w-5 ${
                                theme === "company" ? "border-t-company-accent border-b-company-accent" : "border-t-recruiter-accent border-b-recruiter-accent"
                              }`}></div>
                            ) : isSufficient ? (
                              `Upgrade for $${parseFloat(p.price).toFixed(0)}`
                            ) : (
                              "Insufficient Funds"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tables Grid */}
            <div className="w-full gap-8 grid grid-cols-1 pt-4 lg:grid-cols-2">

              {/* Transactions Panel */}
              <div className="rounded-3xl bg-card/40 overflow-hidden flex-col p-6 backdrop-blur-sm shadow-2xl flex gap-5 border-border border sm:p-8">
                <h3 className="text-muted type-card-title font-semibold">
                  {role === "COMPANY" ? "Corporate Wallet Ledger" : "Recent Wallet Ledger"}
                </h3>
                <div className="w-full border-border/80 rounded-2xl overflow-x-auto bg-card/40 border">
                  <table className="w-full text-xs table-fixed text-left min-w-[420px] sm:text-sm">
                    <thead>
                      <tr className="border-b text-muted bg-card/40 border-border">
                        <th scope="col" className="p-3 w-1/3">Type</th>
                        <th scope="col" className="w-1/4 p-3">Amount</th>
                        <th scope="col" className="w-1/4 p-3">Status</th>
                        <th scope="col" className="w-1/4 p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/60 divide-y">
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-card/20 text-muted">
                            <td className="truncate capitalize p-3">{tx.reference_type}</td>
                            <td className="p-3">
                              <span className={tx.transaction_type === "deposit" ? "text-success" : "text-warning"}>
                                {tx.transaction_type === "deposit" ? "+" : "-"}${parseFloat(tx.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 text-xs text-success uppercase bg-success-bg py-0.5 border-success/20 tracking-wider rounded border font-semibold">
                                {tx.status}
                              </span>
                            </td>
                            <td className="text-muted p-3 text-xs">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-xs italic text-center text-muted p-4">
                            No ledger entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoices Panel */}
              <div className="rounded-3xl bg-card/40 overflow-hidden flex-col p-6 backdrop-blur-sm shadow-2xl flex gap-5 border-border border sm:p-8">
                <h3 className="text-muted type-card-title font-semibold">
                  {role === "COMPANY" ? "Corporate Invoices History" : "Payment Invoices History"}
                </h3>
                <div className="w-full border-border/80 rounded-2xl overflow-x-auto bg-card/40 border">
                  <table className="w-full text-xs table-fixed text-left min-w-[420px] sm:text-sm">
                    <thead>
                      <tr className="border-b text-muted bg-card/40 border-border">
                        <th scope="col" className="p-3 w-1/3">Invoice ID</th>
                        <th scope="col" className="w-1/4 p-3">Total Charged</th>
                        <th scope="col" className="w-1/4 p-3">Date</th>
                        <th scope="col" className="w-1/4 text-center p-3">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/60 divide-y">
                      {invoices.length > 0 ? (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-card/20 text-muted">
                            <td className="truncate font-mono p-3">{inv.invoice_number}</td>
                            <td className="p-3 text-muted">
                              ${parseFloat(inv.total_amount).toFixed(2)}
                            </td>
                            <td className="text-muted p-3 text-xs">
                              {new Date(inv.issued_at).toLocaleDateString()}
                            </td>
                            <td className="text-center p-3">
                              <a
                                href={inv.pdf_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`justify-center uppercase min-h-[44px] items-center tracking-wide flex cursor-pointer type-caption hover:underline ${
                                  theme === "company" ? "text-company-accent hover:text-company-accent/80" : "text-recruiter-accent hover:text-recruiter-accent/80"
                                }`}
                              >
                                PDF
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-xs italic text-center text-muted p-4">
                            No billing invoices found.
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
