import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

function getAuthHeaders() {
  const token = getJWT();
  if (!token) throw new Error("Токен не знайдено");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка рейтингу";
  } catch {
    return "Помилка рейтингу";
  }
}

export const ratings = {
  getByUserId: async (userId) => {
    const response = await fetch(`${API_URL}/api/Ratings/user/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

  create: async (ratingData) => {
    const response = await fetch(`${API_URL}/api/Ratings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(ratingData),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },
};