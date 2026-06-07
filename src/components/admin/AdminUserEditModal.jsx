import { useEffect, useState } from "react";
import { icons } from "../../assets/icons";
import { CustomSelect } from "../ui/CustomSelect";

export function AdminUserEditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    nickname: "",
    description: "",
    role: "User",
    visibilityStatus: "Public",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      nickname: user.nickname || "",
      description: user.description || "",
      role: user.role || "User",
      visibilityStatus: user.visibilityStatus || "Public",
    });
  }, [user]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(user.userId, form);
  };

  if (!user) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-140 rounded-lg border border-[#30363D] bg-[#1C2128] p-7"
      >
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold">Редагування користувача</h2>
            <p className="mt-1 text-[14px] text-[#9CA3AF]">ID: {user.userId}</p>
          </div>

          <button type="button" onClick={onClose}>
            <img src={icons.x} alt="" className="h-5 w-5 icon-muted" />
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[14px] font-bold">Нікнейм</span>
            <input
              value={form.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
              className="w-full rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 text-[15px] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#4B5563] focus:border-[#B91C1C]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[14px] font-bold">Опис</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Опис профілю..."
              className="no-scrollbar min-h-28 w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 text-[15px] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#4B5563] focus:border-[#B91C1C]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Роль"
              value={form.role}
              onChange={(value) => updateField("role", value)}
              options={[
                { value: "User", label: "User" },
                { value: "Admin", label: "Admin" },
              ]}
            />

            <CustomSelect
              label="Видимість профілю"
              value={form.visibilityStatus}
              onChange={(value) => updateField("visibilityStatus", value)}
              options={[
                { value: "Public", label: "Public" },
                { value: "Hidden", label: "Hidden" },
              ]}
            />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-md border border-[#30363D] bg-[#161B22] text-[15px] font-bold transition hover:border-[#4B5563] hover:bg-[#232A34]"
          >
            Скасувати
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="h-12 rounded-md bg-[#B91C1C] text-[15px] font-bold transition hover:bg-[#9F1818]"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}