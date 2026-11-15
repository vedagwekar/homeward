import type { VideoReview } from "@/lib/store";

const codeLabels = { visible: "Code visible", not_visible: "Code not visible", uncertain: "Code unclear" };
const workLabels = { matches: "Work appears relevant", unclear: "Work unclear", unrelated: "Work appears unrelated" };

export default function VideoReviewPanel({ review }: { review: VideoReview }) {
  return (
    <section className="group pad spaced">
      <strong>AI video review</strong>
      {review.status === "reviewed" && (
        <ul>
          <li>{review.clarity === "clear" ? "Footage clear" : "Footage unclear"}</li>
          <li>{codeLabels[review.stageCode]}</li>
          <li>{workLabels[review.stageWork]}</li>
        </ul>
      )}
      <p>{review.summary}</p>
    </section>
  );
}
