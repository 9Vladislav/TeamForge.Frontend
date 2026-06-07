import { ReviewCard } from "../profileView/ProfileRows";

export function ProfileMyReviewsSection({ reviews = [] }) {
  const reviewsWithComments = reviews
    .filter((review) => getReviewText(review).trim().length > 0)
    .sort((a, b) => {
      const dateA = new Date(getReviewDate(a) || 0);
      const dateB = new Date(getReviewDate(b) || 0);

      return dateB - dateA;
    });

  return (
    <section className="mb-6 rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">
          Мої коментарі ({reviewsWithComments.length})
        </h2>
      </div>

      <div className="custom-scroll max-h-96 space-y-4">
        {reviewsWithComments.length > 0 ? (
          reviewsWithComments.map((review) => (
            <ReviewCard
              key={review.ratingId || review.id}
              author={
                review.authorNickname ||
                review.senderNickname ||
                "Користувач"
              }
              date={getReviewDate(review)}
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

function getReviewText(review) {
  const value = review?.commentText ?? review?.comment ?? "";

  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return String(
    value.commentText ||
      value.text ||
      value.value ||
      value.content ||
      value.message ||
      "",
  );
}

function getReviewDate(review) {
  return review?.comment?.createdAt || review?.createdAt || review?.date || "";
}