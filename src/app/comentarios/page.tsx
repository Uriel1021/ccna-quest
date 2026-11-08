import { Suspense } from "react";
import { FeedbackPage } from "@/components/feedback/FeedbackPage";
export const metadata = { title: "Comentarios" };
export default function Page() {
  return <Suspense><FeedbackPage /></Suspense>;
}
