import {
  API_BASE,
  ENDPOINTS,
  LOGIN_AS_FORM,
  UPDATE_PROFILE_METHOD,
} from "./config";

export type Json = Record<string, unknown>;

const TOKEN_KEY = "band_token";

const COOKIE_KEY = "band_cookie_mode";

// Режим cookie-сессии: сервер не вернул токен, вход держится на cookie
export const isCookieMode = (): boolean => {
  try {
    return localStorage.getItem(COOKIE_KEY) === "1";
  } catch {
    return false;
  }
};

export const setCookieMode = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(COOKIE_KEY, "1");
    else localStorage.removeItem(COOKIE_KEY);
  } catch {
    /* ignore */
  }
};

const SCHEME_KEY = "band_scheme";

export const getScheme = (): string => {
  try {
    return localStorage.getItem(SCHEME_KEY) || "Bearer";
  } catch {
    return "Bearer";
  }
};

export const setScheme = (scheme: string): void => {
  try {
    localStorage.setItem(SCHEME_KEY, scheme);
  } catch {
    /* ignore */
  }
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage недоступен */
  }
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function flatten(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(flatten);
  if (v && typeof v === "object") {
    return Object.entries(v as Json).flatMap(([k, val]) =>
      flatten(val).map((m) => (k === "detail" || k === "non_field_errors" ? m : `${k}: ${m}`)),
    );
  }
  return [];
}

function errorText(data: unknown, fallback: string): string {
  const parts = flatten(data);
  return parts.length ? parts.join("; ") : fallback;
}

async function request(
  path: string,
  method: string,
  body?: Json,
  asForm = false,
  scheme?: string,
): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `${scheme ?? getScheme()} ${token}`;

  let payload: BodyInit | undefined;
  if (body) {
    if (asForm) {
      const form = new URLSearchParams();
      Object.entries(body).forEach(([k, v]) => form.append(k, String(v ?? "")));
      payload = form;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      payload = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }
  }

  let res: Response;
  try {
    try {
      // include — чтобы cookie-сессия сохранялась и отправлялась
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: payload,
        credentials: "include",
      });
    } catch {
      // сервер не разрешает credentials в CORS — пробуем без cookie
      res = await fetch(API_BASE + path, { method, headers, body: payload });
    }
  } catch {
    throw new ApiError(0, "Нет соединения с сервером. Проверьте интернет.");
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  // Токен не подошёл — пробуем другую схему заголовка (Token / Bearer)
  if (res.status === 401 && token && !scheme) {
    const other = getScheme() === "Token" ? "Bearer" : "Token";
    try {
      const retried = await request(path, method, body, asForm, other);
      setScheme(other);
      return retried;
    } catch {
      /* падаем с исходной ошибкой ниже */
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      errorText(data, `Ошибка сервера (${res.status})`),
    );
  }
  return data;
}

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Json;
  // key / token — обычно DRF TokenAuth («Token ...»); access — JWT («Bearer ...»)
  for (const key of ["key", "token", "auth_token", "access", "access_token", "accessToken", "jwt"]) {
    if (typeof obj[key] === "string") {
      setScheme(key === "key" || key === "token" ? "Token" : "Bearer");
      return obj[key] as string;
    }
  }
  return null;
}

export async function register(values: Json): Promise<string | null> {
  const data = await request(ENDPOINTS.register, "POST", values);
  return extractToken(data);
}

export async function login(values: Json): Promise<void> {
  const data = await request(ENDPOINTS.login, "POST", values, LOGIN_AS_FORM);
  const token = extractToken(data);
  if (token) {
    setToken(token);
    setCookieMode(false);
  } else {
    // токена нет — значит, вход держится на cookie-сессии
    setToken(null);
    setCookieMode(true);
  }
}

export async function logout(): Promise<void> {
  try {
    await request(ENDPOINTS.logout, "POST");
  } catch {
    /* выходим локально в любом случае */
  }
  setToken(null);
  setCookieMode(false);
}

export async function getProfile(): Promise<Json> {
  const data = await request(ENDPOINTS.profile, "GET");
  return (data ?? {}) as Json;
}

export async function updateProfile(values: Json): Promise<Json> {
  const data = await request(
    ENDPOINTS.updateProfile,
    UPDATE_PROFILE_METHOD,
    values,
  );
  return data && typeof data === "object" ? (data as Json) : values;
}
