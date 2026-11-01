import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "./api";
import type { Json } from "./api";

type AuthState = {
  user: Json | null;
  ready: boolean;
  signIn: (values: Json) => Promise<void>;
  signUp: (values: Json, loginValues: Json) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (u: Json) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Json | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!api.getToken() && !api.isCookieMode()) {
      setReady(true);
      return;
    }
    api
      .getProfile()
      .then(setUser)
      .catch(() => {
        api.setToken(null);
        api.setCookieMode(false);
      })
      .finally(() => setReady(true));
  }, []);

  const loadProfileAfterLogin = async () => {
    try {
      setUser(await api.getProfile());
    } catch (err) {
      if (api.isCookieMode()) {
        api.setCookieMode(false);
        throw new api.ApiError(
          0,
          "Сервер принял логин, но не вернул токен, а cookie-сессия не сохранилась. Бэкенду нужно разрешить CORS с credentials для адреса этого сайта.",
        );
      }
      throw err;
    }
  };

  const signIn = useCallback(async (values: Json) => {
    await api.login(values);
    await loadProfileAfterLogin();
  }, []);

  const signUp = useCallback(async (values: Json, loginValues: Json) => {
    const token = await api.register(values);
    if (token) api.setToken(token);
    else await api.login(loginValues);
    await loadProfileAfterLogin();
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, ready, signIn, signUp, signOut, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}
