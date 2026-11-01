import { useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { ApiError, getProfile, updateProfile, type Json } from "../api";
import { SPECIALIZATIONS } from "../config";
import { Loader } from "../components/Loader";

const text = (v: unknown): string =>
  v === null || v === undefined || v === "" ? "—" : String(v);

export function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ first_name: "", specialization: "", bio: "", fee: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  // профиль лежит в user.profile (если сервер вернул плоский объект — берём его целиком)
  const p: Json =
    user.profile && typeof user.profile === "object" ? (user.profile as Json) : user;

  const specLabel =
    (p.specialization_display as string | undefined) ||
    SPECIALIZATIONS.find((s) => s.value === p.specialization)?.label ||
    text(p.specialization);

  const startEdit = () => {
    setDraft({
      first_name: p.first_name ? String(p.first_name) : "",
      specialization: p.specialization ? String(p.specialization) : SPECIALIZATIONS[0].value,
      bio: p.bio ? String(p.bio) : "",
      fee: p.fee !== null && p.fee !== undefined ? String(p.fee) : "",
    });
    setError("");
    setSaved(false);
    setEditing(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body: Json = { ...draft };
      if (draft.fee === "") delete body.fee;
      await updateProfile(body);
      setUser(await getProfile()); // перечитываем профиль с сервера
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  };

  const title = String(p.first_name || user.username || "Профиль");

  return (
    <section className="card wide">
      {busy && <Loader text="Сохраняем…" />}
      <h1>{title}</h1>
      {saved && <p className="ok">Изменения сохранены</p>}

      {!editing ? (
        <>
          <dl className="profile">
            <div><dt>Логин</dt><dd>{text(user.username)}</dd></div>
            <div><dt>Имя</dt><dd>{text(p.first_name)}</dd></div>
            <div><dt>Специализация</dt><dd>{specLabel}</dd></div>
            <div><dt>О себе</dt><dd>{text(p.bio)}</dd></div>
            <div><dt>Гонорар</dt><dd>{text(p.fee)}</dd></div>
          </dl>
          <button className="btn" onClick={startEdit}>
            Редактировать
          </button>
        </>
      ) : (
        <form onSubmit={save}>
          <label>
            Имя
            <input
              value={draft.first_name}
              onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
            />
          </label>
          <label>
            Специализация
            <select
              value={draft.specialization}
              onChange={(e) => setDraft((d) => ({ ...d, specialization: e.target.value }))}
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            О себе
            <textarea
              rows={4}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            />
          </label>
          <label>
            Гонорар
            <input
              inputMode="decimal"
              value={draft.fee}
              onChange={(e) => setDraft((d) => ({ ...d, fee: e.target.value }))}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="row">
            <button className="btn" type="submit" disabled={busy}>
              Сохранить
            </button>
            <button className="btn ghost" type="button" onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
