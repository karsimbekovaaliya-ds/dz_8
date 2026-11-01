import { useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { ApiError, type Json } from "../api";
import { LOGIN_FIELDS, REGISTER_FIELDS } from "../config";
import { navigate } from "../router";
import { Loader } from "../components/Loader";

type Props = { mode: "login" | "register"; needAuth?: boolean };

export function AuthForm({ mode, needAuth }: Props) {
  const { signIn, signUp } = useAuth();
  const isLogin = mode === "login";
  const fields = isLogin ? LOGIN_FIELDS : REGISTER_FIELDS;

  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) {
        await signIn(values as Json);
      } else {
        // для автоматического входа после регистрации берём поля логина
        const loginValues: Json = {};
        LOGIN_FIELDS.forEach((f) => (loginValues[f.name] = values[f.name]));
        await signUp(values as Json, loginValues);
      }
      navigate("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Что-то пошло не так");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      {busy && (
        <Loader text={isLogin ? "Входим в аккаунт…" : "Создаём аккаунт…"} />
      )}
      <h1>{isLogin ? "Вход" : "Регистрация"}</h1>
      {needAuth && <p className="hint">Чтобы открыть профиль, войдите в аккаунт.</p>}
      <form onSubmit={submit}>
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            <input
              type={f.type}
              required={f.required}
              value={values[f.name] ?? ""}
              autoComplete={f.type === "password" ? (isLogin ? "current-password" : "new-password") : f.type === "email" ? "email" : "off"}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
              }
            />
          </label>
        ))}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy}>
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <p className="alt">
        {isLogin ? (
          <>
            Нет аккаунта? <a href="#/register">Зарегистрироваться</a>
          </>
        ) : (
          <>
            Уже есть аккаунт? <a href="#/login">Войти</a>
          </>
        )}
      </p>
    </section>
  );
}
