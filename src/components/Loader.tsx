// Плашка загрузки: показывается поверх страницы, пока идёт запрос
export function Loader({ text }: { text: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-box">
        <span className="spinner" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
}
