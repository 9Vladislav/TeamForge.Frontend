import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { icons } from "../assets/icons";
import { SettingsBlock } from "../components/profile/SettingsBlock";
import { ProfileGamesForm } from "../components/profile/ProfileGamesForm";
import { ActivityPeriodsForm } from "../components/profile/ActivityPeriodsForm";
import { Loader } from "../components/ui/Loader";
import { profiles } from "../api/profiles";
import { games as gamesApi } from "../api/games";
import { ToastMessage } from "../components/ui/ToastMessage";
import { ProfileMyReviewsSection } from "../components/profile/ProfileMyReviewsSection";

export function ProfileSettingsPage() {
  const [profileData, setProfileData] = useState({
    email: "",
    nickname: "",
    description: "",
    visibilityStatus: "Public",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileGames, setProfileGames] = useState([]);
  const [activityPeriods, setActivityPeriods] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [profileRatings, setProfileRatings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [deletedGameIds, setDeletedGameIds] = useState([]);
  const [deletedPeriodIds, setDeletedPeriodIds] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const showMessage = (type, text) => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profile, gamesData] = await Promise.all([
        profiles.getMe(),
        gamesApi.getAll(),
      ]);

      setProfileData({
        email: profile.email || "",
        nickname: profile.nickname || "",
        description: profile.description || "",
        visibilityStatus: profile.visibilityStatus || "Public",
      });

      setProfileGames(Array.isArray(profile.games) ? profile.games : []);
      setActivityPeriods(
        Array.isArray(profile.activityPeriods) ? profile.activityPeriods : [],
      );
      setProfileRatings(Array.isArray(profile.ratings) ? profile.ratings : []);
      setGameOptions(Array.isArray(gamesData) ? gamesData : []);
      setDeletedGameIds([]);
      setDeletedPeriodIds([]);
    } catch (error) {
      setError(error.message || "Не вдалося завантажити налаштування");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileField = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfileData = async () => {
    try {
      await profiles.updateMe({
        email: profileData.email.trim(),
        nickname: profileData.nickname.trim(),
        description: profileData.description.trim(),
        visibilityStatus: profileData.visibilityStatus,
      });

      window.dispatchEvent(
        new CustomEvent("sidebar-user-updated", {
          detail: {
            nickname: profileData.nickname.trim(),
          },
        }),
      );

      showMessage("success", "Дані профілю збережено");
      await loadSettings();
    } catch (error) {
      showMessage("error", error.message || "Не вдалося зберегти дані профілю");
    }
  };

  const savePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showMessage("error", "Заповніть поточний та новий пароль");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Новий пароль і підтвердження не збігаються");
      return;
    }

    try {
      await profiles.updateMe({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showMessage("success", "Пароль змінено");
    } catch (error) {
      showMessage("error", error.message || "Не вдалося змінити пароль");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
        <Sidebar />

        <section className="flex-1 px-8 py-8">
          <Loader />
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <Sidebar />

      <section className="flex-1 px-8 py-8">
        <h1 className="mb-2 text-[32px] font-bold">Налаштування профілю</h1>
        <p className="mb-8 text-[16px] text-[#9CA3AF]">
          Редагуйте свою інформацію та налаштування
        </p>

        {error && (
          <div className="mb-6 inline-flex rounded-lg border border-[#B91C1C] bg-[#1C2128] px-5 py-4 text-[14px] text-[#B91C1C]">
            {error}
          </div>
        )}

        <SettingsBlock title="Основна інформація">
          <div className="grid grid-cols-2 gap-5">
            <FormInput
              label="Email"
              value={profileData.email}
              onChange={(value) => updateProfileField("email", value)}
            />

            <FormInput
              label="Нікнейм"
              value={profileData.nickname}
              onChange={(value) => updateProfileField("nickname", value)}
            />
          </div>

          <label className="mt-5 block">
            <FieldTitle text="Опис" />

            <textarea
              value={profileData.description}
              onChange={(event) =>
                updateProfileField("description", event.target.value)
              }
              className="no-scrollbar mt-2 min-h-28 w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-4 py-3 text-[15px] text-[#F3F4F6] outline-none transition hover:border-[#4B5563] focus:border-[#B91C1C]"
            />
          </label>

          <div className="mt-6">
            <FieldTitle text="Видимість профілю" />

            <div className="mt-2 grid grid-cols-2 gap-4">
              <VisibilityButton
                icon={icons.eye}
                text="Публічний"
                active={profileData.visibilityStatus === "Public"}
                onClick={() => updateProfileField("visibilityStatus", "Public")}
              />

              <VisibilityButton
                icon={icons.eyeOff}
                text="Прихований"
                active={profileData.visibilityStatus === "Hidden"}
                onClick={() => updateProfileField("visibilityStatus", "Hidden")}
              />
            </div>
          </div>

          <SaveButton text="Зберегти дані профілю" onClick={saveProfileData} />
        </SettingsBlock>

        <SettingsBlock title="Зміна паролю">
          <div className="grid grid-cols-3 gap-5">
            <PasswordInput
              label="Поточний пароль"
              value={passwordData.currentPassword}
              onChange={(value) =>
                updatePasswordField("currentPassword", value)
              }
            />

            <PasswordInput
              label="Новий пароль"
              value={passwordData.newPassword}
              onChange={(value) => updatePasswordField("newPassword", value)}
            />

            <PasswordInput
              label="Підтвердіть пароль"
              value={passwordData.confirmPassword}
              onChange={(value) =>
                updatePasswordField("confirmPassword", value)
              }
            />
          </div>

          <SaveButton text="Зберегти пароль" onClick={savePassword} />
        </SettingsBlock>

        <SettingsBlock>
          <ProfileGamesForm
            games={profileGames}
            setGames={setProfileGames}
            deletedGameIds={deletedGameIds}
            setDeletedGameIds={setDeletedGameIds}
            gameOptions={gameOptions}
            onReload={loadSettings}
            onMessage={showMessage}
          />
        </SettingsBlock>

        <SettingsBlock>
          <ActivityPeriodsForm
            periods={activityPeriods}
            setPeriods={setActivityPeriods}
            deletedPeriodIds={deletedPeriodIds}
            setDeletedPeriodIds={setDeletedPeriodIds}
            onReload={loadSettings}
            onMessage={showMessage}
          />
        </SettingsBlock>
        <ProfileMyReviewsSection reviews={profileRatings} />
      </section>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} type={toast.type} text={toast.text} />
        ))}
      </div>
    </main>
  );
}

function FieldTitle({ text }) {
  return (
    <p className="mb-2 block text-[14px] font-bold text-[#F3F4F6]">{text}</p>
  );
}

function FormInput({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <FieldTitle text={label} />

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-[#30363D] bg-[#161B22] px-4 text-[15px] text-[#F3F4F6] outline-none transition hover:border-[#4B5563] focus:border-[#B91C1C]"
      />
    </label>
  );
}

function PasswordInput({ label, value, onChange }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <FieldTitle text={label} />

      <div className="flex h-12 items-center rounded-md border border-[#30363D] bg-[#161B22] px-4 transition hover:border-[#4B5563] focus-within:border-[#B91C1C]">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          style={{
            WebkitTextSecurity: isVisible ? "none" : "disc",
          }}
          className="w-full bg-transparent text-[15px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF]"
        />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="ml-3 flex h-6 w-6 items-center justify-center"
        >
          <img
            src={isVisible ? icons.eyeOff : icons.eye}
            alt=""
            className="h-5 w-5 icon-muted"
          />
        </button>
      </div>
    </label>
  );
}

function VisibilityButton({ icon, text, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md border py-3 text-[15px] font-bold transition ${
        active
          ? "border-[#B91C1C] bg-[#B91C1C] text-[#F3F4F6] hover:bg-[#9F1818]"
          : "border-[#30363D] bg-[#161B22] text-[#D1D5DB] hover:border-[#4B5563] hover:bg-[#232A34]"
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`h-5 w-5 ${active ? "icon-white" : "icon-muted"}`}
      />
      {text}
    </button>
  );
}

function SaveButton({ text, onClick }) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="rounded-md bg-[#B91C1C] px-6 py-3 text-[15px] font-bold transition hover:bg-[#9F1818]"
      >
        {text}
      </button>
    </div>
  );
}
