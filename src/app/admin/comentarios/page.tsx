import { FeedbackInbox } from "@/components/feedback/FeedbackInbox";
export const metadata = { title: "Bandeja de comentarios", robots: { index: false } };
export default function Page() {
  return <FeedbackInbox />;
}
