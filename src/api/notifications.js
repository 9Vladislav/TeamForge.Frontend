import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

function getAuthHeaders() {
  const token = getJWT();

  if (!token) {
    throw new Error("Токен не знайдено");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка сповіщень";
  } catch {
    return "Помилка сповіщень";
  }
}

export const notifications = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/Notifications`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(
      `${API_URL}/api/Notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json().catch(() => null);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_URL}/api/Notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json().catch(() => null);
  },
};