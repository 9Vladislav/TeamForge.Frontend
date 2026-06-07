import { useEffect, useState } from "react";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { Loader } from "../components/ui/Loader";
import { admin } from "../api/admin";
import { icons } from "../assets/icons";
import { DeleteCommentConfirmModal } from "../components/admin/DeleteCommentConfirmModal";

export function AdminModerationPage() {
  const [comments, setComments] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await admin.getComments();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setError("Не вдалося завантажити коментарі");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteComment = async () => {
    try {
      await admin.deleteComment(selectedCommentId);

      setComments((prev) =>
        prev.filter((comment) => comment.commentId !== selectedCommentId),
      );

      setSelectedCommentId(null);
    } catch {
      setError("Не вдалося видалити коментар");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="mb-2 text-[28px] font-bold">Модерація</h1>
        <p className="mb-8 text-[15px] text-[#9CA3AF]">
          Модерація коментарів у відгуках користувачів
        </p>

        {isLoading ? (
          <Loader text="Завантаження коментарів..." />
        ) : error ? (
          <p className="text-[#B91C1C]">{error}</p>
        ) : (
          <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
            <h2 className="mb-5 text-[18px] font-bold">Модерація коментарів</h2>

            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.commentId}
                  comment={comment}
                  onDelete={() => setSelectedCommentId(comment.commentId)}
                />
              ))}

              {comments.length === 0 && (
                <p className="text-[15px] text-[#9CA3AF]">
                  Коментарів для модерації немає
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {selectedCommentId && (
        <DeleteCommentConfirmModal
          onClose={() => setSelectedCommentId(null)}
          onConfirm={confirmDeleteComment}
        />
      )}
    </div>
  );
}

function CommentCard({ comment, onDelete }) {
  return (
    <article className="flex items-center gap-5 rounded-md border border-[#30363D] bg-[#161B22] px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[#9CA3AF]">
          <span>Від:</span>
          <span className="font-bold text-[#F3F4F6]">
            {comment.authorNickname}
          </span>
          <span>→ До:</span>
          <span className="font-bold text-[#F3F4F6]">
            {comment.receiverNickname}
          </span>
        </div>

        <p className="mb-2 text-[15px] leading-normal text-[#D1D5DB]">
          {comment.text}
        </p>

        <p className="text-[13px] text-[#9CA3AF]">
          {new Date(comment.createdAt).toLocaleString("uk-UA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#B91C1C] px-4 text-[14px] font-bold transition hover:bg-[#9F1818]"
      >
        <img src={icons.trash} alt="" className="h-4 w-4 icon-white" />
        Видалити
      </button>
    </article>
  );
}
