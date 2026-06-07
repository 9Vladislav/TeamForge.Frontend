import { useLocation, useNavigate } from "react-router-dom";
import { icons } from "../../assets/icons";
import { removeJWT } from "../../utils/jwt";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    removeJWT();
    navigate("/auth");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-[#30363D] bg-[#161B22] p-4">
      <div className="mb-8 px-3">
        <h2 className="text-[22px] font-bold text-[#DC2626]">TeamForge</h2>
        <p className="text-[13px] text-[#9CA3AF]">Панель адміністратора</p>
      </div>

      <nav className="space-y-2">
        <MenuItem
          icon={icons.trophy}
          text="Статистика"
          active={location.pathname === "/admin/statistics"}
          onClick={() => navigate("/admin/statistics")}
        />

        <MenuItem
          icon={icons.users}
          text="Користувачі"
          active={location.pathname === "/admin/users"}
          onClick={() => navigate("/admin/users")}
        />

        <MenuItem
          icon={icons.messageSquare}
          text="Модерація"
          active={location.pathname === "/admin/moderation"}
          onClick={() => navigate("/admin/moderation")}
        />
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-[#30363D] bg-[#1C2128] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B91C1C] text-[14px] font-medium">
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold">Адміністратор</p>
            <p className="text-[12px] text-[#9CA3AF]">Панель керування</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md border border-[#30363D] bg-[#161B22] py-3 text-[14px] font-bold text-[#D1D5DB] transition hover:border-[#4B5563] hover:bg-[#232A34] hover:text-[#F3F4F6]"
        >
          Вийти з акаунта
        </button>
      </div>
    </aside>
  );
}

function MenuItem({ icon, text, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-[15px] font-medium transition ${
        active
          ? "bg-[#B91C1C] text-[#F3F4F6] hover:bg-[#9F1818]"
          : "text-[#D1D5DB] hover:bg-[#232A34] hover:text-[#F3F4F6]"
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`h-5 w-5 ${active ? "icon-white" : "icon-muted"}`}
      />

      <span className="min-w-0 flex-1 truncate">{text}</span>
    </button>
  );
}