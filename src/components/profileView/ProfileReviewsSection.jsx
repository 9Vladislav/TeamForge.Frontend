import { ReviewCard } from "./ProfileRows";

export function ProfileReviewsSection({
  reviews = [],
  canLeaveReview,
  onOpenReviewModal,
  getReviewText,
}) {
  return (
    <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">
          Коментарі ({reviews.length})
        </h2>

        {canLeaveReview && (
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="rounded-md bg-[#B91C1C] px-5 py-3 text-[14px] font-bold transition hover:bg-[#9F1818]"
          >
            Залишити відгук
          </button>
        )}
      </div>

      <div className="custom-scroll max-h-96 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.ratingId || review.id}
              author={
                review.authorNickname ||
                review.senderNickname ||
                "Користувач"
              }
              date={review.createdAt || review.date || ""}
              text={getReviewText(review)}
              rating={`${review.score || review.rating}/10`}
            />
          ))
        ) : (
          <p className="text-[14px] text-[#9CA3AF]">
            Коментарів поки немає
          </p>
        )}
      </div>
    </section>
  );
}