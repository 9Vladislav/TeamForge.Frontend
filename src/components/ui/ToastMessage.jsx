export function ToastMessage({ type = "success", text }) {
  if (!text) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`min-w-90 max-w-120 rounded-xl border bg-[#1C2128] px-6 py-5 shadow-2xl ${
        isSuccess ? "border-[#16A34A]" : "border-[#B91C1C]"
      }`}
    >
      <div
        className={`mb-2 text-[17px] font-bold ${
          isSuccess ? "text-[#16A34A]" : "text-[#B91C1C]"
        }`}
      >
        {isSuccess ? "Успіх" : "Помилка"}
      </div>

      <div className="text-[16px] leading-6 text-[#F3F4F6]">{text}</div>
    </div>
  );
}
