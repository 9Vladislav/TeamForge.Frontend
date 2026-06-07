import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка пошуку";
  } catch {
    return "Помилка пошуку";
  }
}

export const search = {
  users: async (filters) => {
    const token = getJWT();

    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/Search/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },
};