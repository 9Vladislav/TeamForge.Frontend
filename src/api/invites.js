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
    return data.message || data.error || data.title || "Помилка інвайтів";
  } catch {
    return "Помилка інвайтів";
  }
}

export const invites = {
  create: async (inviteData) => {
    const response = await fetch(`${API_URL}/api/Invites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(inviteData),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

  getIncoming: async () => {
    const response = await fetch(`${API_URL}/api/Invites/incoming`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

  getOutgoing: async () => {
    const response = await fetch(`${API_URL}/api/Invites/outgoing`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

  getAccepted: async () => {
    const response = await fetch(`${API_URL}/api/Invites/accepted`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

    getHistory: async () => {
    const response = await fetch(`${API_URL}/api/Invites/history`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json();
  },

  updateStatus: async (inviteId, status) => {
    const response = await fetch(`${API_URL}/api/Invites/${inviteId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    return await response.json().catch(() => null);
  },
};