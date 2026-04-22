import { fetchAllCourseSwaps } from "@/lib/service";
import SwapUI from "./SwapUI";

export const metadata = {
  title: "Course Swap | CRAB University",
  description: "Trade course sections with other students.",
};

export default async function CourseSwapPage() {
  // Fetch directly from the DB on the server before the page even loads!
  // ZERO API routes required.
  const initialSwaps = await fetchAllCourseSwaps();

  return <SwapUI initialSwaps={initialSwaps} />;
}