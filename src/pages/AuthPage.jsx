import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons } from "../assets/icons";
import { authAPI } from "../api/authAPI";
import { getRoleFromJWT, saveJWT } from "../utils/jwt";

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isRegister && !form.nickname.trim()) {
      newErrors.nickname = "Введіть нікнейм";
    }

    if (!form.email.trim()) {
      newErrors.email = "Введіть email";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Введіть коректний email";
    }

    if (!form.password.trim()) {
      newErrors.password = "Введіть пароль";
    } else if (form.password.length < 6) {
      newErrors.password = "Пароль має містити мінімум 6 символів";
    }

    if (isRegister && !form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Підтвердіть пароль";
    } else if (isRegister && form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Паролі не співпадають";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const userData = isRegister
        ? {
            email: form.email.trim(),
            password: form.password,
            nickname: form.nickname.trim(),
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const data = isRegister
        ? await authAPI.register(userData)
        : await authAPI.login(userData);

      const token = data?.token || data?.accessToken || data?.jwt;

      if (!token) {
        setServerError("Сервер не повернув токен авторизації");
        return;
      }

      saveJWT(token);

      const role = getRoleFromJWT();

      if (role === "Admin") {
        navigate("/admin/statistics");
      } else {
        navigate("/search");
      }
    } catch (error) {
      setServerError(error.message || "Сталася помилка. Спробуйте ще раз");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#0D1117] text-[#F3F4F6]">
      <section className="flex w-[72%] justify-center bg-[#0D1117] py-22.5">
        <div className="w-160">
          <h1 className="mb-4 text-[48px] font-bold text-[#B91C1C]">
            TeamForge
          </h1>

          <h2 className="mb-7 text-[24px] font-medium">
            Пошук тіммейтів для спільної гри
          </h2>

          <p className="mb-9 w-full text-[16px] leading-[1.6] text-[#D1D5DB]">
            Знайди ідеальних партнерів для своїх улюблених ігор. Створюй
            команди, спілкуйся та досягай перемог разом.
          </p>

          <div className="mb-8 grid w-full grid-cols-2 gap-5">
            <InfoCard
              icon={icons.users}
              title="Знайди команду"
              text="Фільтруй гравців за скілом та часом гри"
            />
            <InfoCard
              icon={icons.messageSquare}
              title="Спілкування"
              text="Вбудований чат для координації"
            />
            <InfoCard
              icon={icons.trophy}
              title="Рейтинг"
              text="Система оцінок та відгуків"
            />
            <InfoCard
              icon={icons.gamepad}
              title="Всі популярні ігри"
              text="CS2, Dota 2, Valorant та інші"
            />
          </div>

          <div className="mb-6 flex w-full items-center gap-5 rounded-lg border border-[#30363D] bg-[#1C2128] px-6 py-5">
            <img src={icons.earth} alt="" className="h-9 w-9 icon-red" />
            <div>
              <p className="text-[15px] font-bold">5,000+ активних гравців</p>
              <p className="text-[14px] text-[#9CA3AF]">Онлайн прямо зараз</p>
            </div>
          </div>

          <div className="w-full rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
            <div className="mb-4 flex items-center gap-5">
              <img src={icons.smartphone} alt="" className="h-8 w-8 icon-red" />
              <h3 className="text-[22px] font-bold">Мобільна версія</h3>
            </div>

            <p className="text-[14px] leading-[1.6] text-[#D1D5DB]">
              TeamForge також доступний у мобільному застосунку для вашого
              Android. Завантажуйте застосунок, знаходьте тіммейтів і
              спілкуйтесь з командою будь-де.
            </p>
          </div>
        </div>
      </section>

      <section className="flex w-[28%] items-center justify-center bg-[#161B22] px-12">
        <div className="w-full max-w-107.5">
          <h2 className="mb-2 text-center text-[28px] font-bold">
            {isRegister ? "Реєстрація" : "Вхід"}
          </h2>

          <p className="mb-10 text-center text-[15px] text-[#9CA3AF]">
            {isRegister ? "Створіть новий акаунт" : "Увійдіть до свого акаунту"}
          </p>

          <form className="space-y-5">
            {isRegister && (
              <FormInput
                label="Нікнейм"
                type="text"
                placeholder="Введіть нікнейм"
                value={form.nickname}
                error={errors.nickname}
                onChange={(value) => updateField("nickname", value)}
              />
            )}

            <FormInput
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              error={errors.email}
              onChange={(value) => updateField("email", value)}
            />

            <PasswordInput
              label="Пароль"
              value={form.password}
              error={errors.password}
              onChange={(value) => updateField("password", value)}
            />

            {isRegister && (
              <PasswordInput
                label="Підтвердіть пароль"
                value={form.confirmPassword}
                error={errors.confirmPassword}
                onChange={(value) => updateField("confirmPassword", value)}
              />
            )}

            {serverError && (
              <p className="text-[13px] text-[#B91C1C]">{serverError}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-md bg-[#B91C1C] py-3 text-[15px] font-bold text-[#F3F4F6] transition hover:bg-[#9F1818] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRegister ? "Зареєструватися" : "Увійти"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrors({});
              setServerError("");
            }}
            className="mt-7 w-full text-[14px] font-medium text-[#9CA3AF] transition hover:text-[#F3F4F6]"
          >
            {isRegister
              ? "Вже є акаунт? Увійти"
              : "Немає акаунту? Зареєструватись"}
          </button>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="min-h-37.5 rounded-lg border border-[#30363D] bg-[#1C2128] p-6">
      <img src={icon} alt="" className="mb-5 h-8 w-8 icon-red" />
      <h3 className="mb-3 text-[16px] font-bold">{title}</h3>
      <p className="text-[14px] leading-[1.4] text-[#9CA3AF]">{text}</p>
    </div>
  );
}

function FormInput({ label, type, placeholder, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-[#1C2128] px-4 py-3 text-[15px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF] ${
          error ? "border-[#B91C1C]" : "border-[#30363D] focus:border-[#B91C1C]"
        }`}
      />
      {error && <p className="mt-2 text-[13px] text-[#B91C1C]">{error}</p>}
    </label>
  );
}

function PasswordInput({ label, value, onChange, error }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-bold">{label}</span>

      <div
        className={`flex items-center rounded-md border bg-[#1C2128] px-4 ${
          error
            ? "border-[#B91C1C]"
            : "border-[#30363D] focus-within:border-[#B91C1C]"
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          style={{
            WebkitTextSecurity: isVisible ? "none" : "disc",
          }}
          className="w-full bg-transparent py-3 text-[15px] text-[#F3F4F6] outline-none placeholder:text-[#9CA3AF]"
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

      {error && <p className="mt-2 text-[13px] text-[#B91C1C]">{error}</p>}
    </label>
  );
}
