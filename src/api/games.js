import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка отримання ігор";
  } catch {
    return "Помилка отримання ігор";
  }
}

export const games = {
  getAll: async () => {
    const token = getJWT();

    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/Games`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },
};