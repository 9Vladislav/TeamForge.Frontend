import { jwtDecode } from "jwt-decode";

export function saveJWT(token) {
  localStorage.setItem("jwt-token", token);
}

export function getJWT() {
  return localStorage.getItem("jwt-token");
}

export function removeJWT() {
  localStorage.removeItem("jwt-token");
}

export function getIdFromJWT() {
  const token = getJWT();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    return (
      decoded.sub ||
      decoded.nameid ||
      decoded.userId ||
      decoded.nameIdentifier ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      null
    );
  } catch {
    return null;
  }
}

export function getRoleFromJWT() {
  const token = getJWT();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    return (
      decoded.role ||
      decoded.roles ||
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"
      ] ||
      null
    );
  } catch {
    return null;
  }
}

export function getEmailFromJWT() {
  const token = getJWT();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    return (
      decoded.email ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      null
    );
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getRoleFromJWT() === "Admin";
}

export function isUser() {
  return getRoleFromJWT() === "User";
}

export function isAuthenticated() {
  return !!getJWT();
}