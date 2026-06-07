import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка чату";
  } catch {
    return "Помилка чату";
  }
}

async function request(url, options = {}) {
  const token = getJWT();

  if (!token) {
    throw new Error("Токен не знайдено");
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const chats = {
  getAll: () => request("/api/Chats"),

  getMessages: (chatId) => request(`/api/Chats/${chatId}/messages`),

  sendMessage: (receiverId, text) =>
    request("/api/Chats/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, text }),
    }),

  markAsRead: (chatId) =>
    request(`/api/Chats/${chatId}/read`, {
      method: "PUT",
    }),
};