export function ProfileAction({ icon, text, red, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 items-center gap-2 rounded-md px-5 text-[14px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        red
          ? "bg-[#B91C1C] hover:bg-[#9F1818]"
          : "border border-[#30363D] bg-[#161B22] hover:border-[#4B5563] hover:bg-[#232A34]"
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`h-4 w-4 ${red ? "icon-white" : "icon-muted"}`}
      />
      {text}
    </button>
  );
}