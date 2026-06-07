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
    return data.message || data.error || data.title || "Помилка друзів";
  } catch {
    return "Помилка друзів";
  }
}

export const friends = {
  sendRequest: async (receiverId) => {
    const response = await fetch(`${API_URL}/api/Friends/requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },

  getIncomingRequests: async () => {
    const response = await fetch(`${API_URL}/api/Friends/requests/incoming`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },

  getOutgoingRequests: async () => {
    const response = await fetch(`${API_URL}/api/Friends/requests/outgoing`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },

  respondRequest: async (requestId, status) => {
    const response = await fetch(`${API_URL}/api/Friends/requests/${requestId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json().catch(() => null);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/api/Friends`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  },

  deleteFriend: async (friendId) => {
    const response = await fetch(`${API_URL}/api/Friends/${friendId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },
};