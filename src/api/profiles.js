import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || data.error || data.title || "Помилка профілю";
  } catch {
    return "Помилка профілю";
  }
}

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

async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json().catch(() => null);
}

export const profiles = {
  getMe: () => request("/api/Profiles/me"),

  getById: (userId) => request(`/api/Profiles/${userId}`),

  updateMe: (data) =>
    request("/api/Profiles/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  addGame: (data) =>
    request("/api/Profiles/games", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateGame: (userGameId, data) =>
    request(`/api/Profiles/games/${userGameId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteGame: (userGameId) =>
    request(`/api/Profiles/games/${userGameId}`, {
      method: "DELETE",
    }),

  addActivityPeriod: (data) =>
    request("/api/Profiles/activity-periods", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateActivityPeriod: (activityPeriodId, data) =>
    request(`/api/Profiles/activity-periods/${activityPeriodId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteActivityPeriod: (activityPeriodId) =>
    request(`/api/Profiles/activity-periods/${activityPeriodId}`, {
      method: "DELETE",
    }),
};