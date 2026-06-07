import { API_URL } from "./init";

async function getErrorMessage(response) {
  try {
    const errorData = await response.json();

    return (
      errorData.message ||
      errorData.error ||
      errorData.title ||
      "Сталася помилка. Спробуйте ще раз"
    );
  } catch {
    return "Сталася помилка. Спробуйте ще раз";
  }
}

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }

    return await response.json();
  },

  login: async (userData) => {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }

    return await response.json();
  },
};