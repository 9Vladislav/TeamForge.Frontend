import { useEffect, useState } from "react";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { Loader } from "../components/ui/Loader";
import { admin } from "../api/admin";
import { icons } from "../assets/icons";
import { AdminUserEditModal } from "../components/admin/AdminUserEditModal";

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await admin.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("Не вдалося завантажити користувачів");
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userId, form) => {
    try {
      await admin.updateUser(userId, form);
      setSelectedUser(null);
      await loadUsers();
    } catch {
      setError("Не вдалося оновити користувача");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="mb-2 text-[28px] font-bold">Користувачі</h1>
        <p className="mb-8 text-[15px] text-[#9CA3AF]">
          Управління користувачами платформи TeamForge
        </p>

        {isLoading ? (
          <Loader text="Завантаження користувачів..." />
        ) : error ? (
          <p className="text-[#B91C1C]">{error}</p>
        ) : (
          <section className="rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
            <h2 className="mb-5 text-[18px] font-bold">
              Управління користувачами
            </h2>

            <div className="overflow-hidden rounded-md border border-[#30363D] bg-[#161B22]">
              <div className="grid grid-cols-[340px_1fr_120px_150px_56px] gap-5 border-b border-[#30363D] px-5 py-3 text-[13px] font-bold text-[#9CA3AF]">
                <p>Користувач</p>
                <p>Опис</p>
                <p>Роль</p>
                <p>Профіль</p>
                <p></p>
              </div>

              {users.map((user) => (
                <UserRow
                  key={user.userId}
                  user={user}
                  onEdit={() => setSelectedUser(user)}
                />
              ))}

              {users.length === 0 && (
                <p className="px-5 py-4 text-[15px] text-[#9CA3AF]">
                  Користувачів поки немає
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {selectedUser && (
        <AdminUserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={saveUser}
        />
      )}
    </div>
  );
}

function UserRow({ user, onEdit }) {
  const visibilityText =
    user.visibilityStatus === "Public" ? "Публічний" : "Прихований";

  const visibilityClass =
    user.visibilityStatus === "Public"
      ? "bg-[#059669] text-[#F3F4F6]"
      : "bg-[#4B5563] text-[#F3F4F6]";

  return (
    <div className="grid grid-cols-[340px_1fr_120px_150px_56px] items-center gap-5 border-b border-[#30363D] px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B91C1C] text-[16px] font-bold">
          {user.nickname?.[0]?.toUpperCase() || "U"}
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
            <p className="truncate text-[15px] font-bold">{user.nickname}</p>

            <span className="shrink-0 rounded-md border border-[#30363D] px-2 py-1 text-[12px] text-[#9CA3AF]">
              ID: {user.userId}
            </span>
          </div>

          <p className="truncate text-[13px] text-[#9CA3AF]">{user.email}</p>
        </div>
      </div>

      <p className="min-w-0 truncate text-[14px] text-[#D1D5DB]">
        {user.description?.trim() || "—"}
      </p>

      <p className="text-[14px] font-bold">{user.role}</p>

      <span
        className={`inline-flex w-fit rounded-md px-3 py-1 text-[13px] font-bold ${visibilityClass}`}
      >
        {visibilityText}
      </span>

      <button
        type="button"
        onClick={onEdit}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-[#30363D] transition hover:bg-[#4B5563]"
      >
        <img src={icons.edit} alt="" className="h-5 w-5 icon-muted" />
      </button>
    </div>
  );
}