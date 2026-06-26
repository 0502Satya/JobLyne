import SearchJobPage from "./JobsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Jobs | JobLyne",
  description: "Find your next role on JobLyne. Match your skills with open positions at top companies.",
};

export default function Page() {
  return <SearchJobPage />;
}
