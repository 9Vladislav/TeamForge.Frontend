import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function request(url, options = {}) {
  const token = getJWT();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error("Помилка запиту до сервера");
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const admin = {
  getUsers: () => request("/api/Admin/users"),

  updateUser: (userId, data) =>
    request(`/api/Admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getStats: () => request("/api/Admin/stats"),

  getComments: () => request("/api/Admin/comments"),

  deleteComment: (commentId) =>
    request(`/api/Admin/comments/${commentId}`, {
      method: "DELETE",
    }),
};