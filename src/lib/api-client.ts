import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

const API_BASE_URL =
  typeof window !== "undefined" &&
  (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "172.20.10.9" ||
    window.location.hostname === "192.168.10.174"
  )
    ? ""
    : process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://halmaheramotowash.vercel.app";

const MOBILE_SESSION_KEY = "halmahera_motowash_session";

type ApiRequestOptions = RequestInit & {
  json?: unknown;
};

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

async function getMobileSessionToken(): Promise<string | null> {
  /*
   * Secure Storage hanya digunakan ketika aplikasi
   * benar-benar berjalan sebagai aplikasi native Capacitor.
   *
   * Browser/web tetap menggunakan mekanisme cookie.
   */
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const storedValue = await SecureStorage.get(
      MOBILE_SESSION_KEY,
      false
    );

    if (typeof storedValue === "string" && storedValue.trim()) {
      return storedValue;
    }

    return null;
  } catch (error) {
    console.error(
      "Gagal membaca session mobile dari secure storage:",
      error
    );

    return null;
  }
}

export async function apiFetch(
  path: string,
  options: ApiRequestOptions = {}
) {
  const { json, headers, ...fetchOptions } = options;

  const finalHeaders = new Headers(headers);

  let body = fetchOptions.body;

  if (json !== undefined) {
    if (json instanceof FormData) {
      body = json;
    } else {
      finalHeaders.set("Content-Type", "application/json");
      body = JSON.stringify(json);
    }
  }

  /*
   * APK:
   * Ambil JWT dari Android Secure Storage lalu kirim
   * sebagai Authorization Bearer.
   *
   * Browser:
   * Tidak melakukan ini sehingga login web tetap
   * menggunakan session cookie.
   */
  const mobileSessionToken = await getMobileSessionToken();

  if (mobileSessionToken) {
    finalHeaders.set(
      "Authorization",
      `Bearer ${mobileSessionToken}`
    );
  }

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    body,
    headers: finalHeaders,
  });

  return response;
}

export async function apiGet(
  path: string,
  options: RequestInit = {}
) {
  return apiFetch(path, {
    ...options,
    method: "GET",
  });
}

export async function apiPost(
  path: string,
  json?: unknown,
  options: RequestInit = {}
) {
  return apiFetch(path, {
    ...options,
    method: "POST",
    json,
  });
}

export async function apiPatch(
  path: string,
  json?: unknown,
  options: RequestInit = {}
) {
  return apiFetch(path, {
    ...options,
    method: "PATCH",
    json,
  });
}

export async function apiDelete(
  path: string,
  json?: unknown,
  options: RequestInit = {}
) {
  return apiFetch(path, {
    ...options,
    method: "DELETE",
    json,
  });
}