import { useAuth } from "../auth";

const SHOWS = [
  { date: "14 ноября", place: "Бишкек, клуб «Депо»", note: "Презентация альбома" },
  { date: "28 ноября", place: "Алматы, Hall 22", note: "Начало в 20:00" },
  { date: "12 декабря", place: "Каракол, «Снежный бар»", note: "Акустический сет" },
  { date: "31 декабря", place: "Бишкек, площадь Ала-Тоо", note: "Новогодний концерт" },
];

const ALBUMS = [
  { year: 2026, title: "Последний вагон", tracks: 11 },
  { year: 2024, title: "Станция Тишина", tracks: 9 },
  { year: 2022, title: "Расписание", tracks: 8 },
];

export function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <h1>
          Ночные
          <br />
          Электрички
        </h1>
        <p>
          Инди-рок из Бишкека. Гитары, синтезаторы и тексты о том, как ехать
          домой последним поездом.
        </p>
        {user ? (
          <a className="btn" href="#/profile">
            Мой профиль
          </a>
        ) : (
          <a className="btn" href="#/register">
            Присоединиться к фанатам
          </a>
        )}
      </section>

      <section className="block">
        <h2>Ближайшие концерты</h2>
        <ul className="shows">
          {SHOWS.map((s) => (
            <li key={s.date}>
              <strong>{s.date}</strong>
              <span>{s.place}</span>
              <em>{s.note}</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2>Альбомы</h2>
        <div className="albums">
          {ALBUMS.map((a) => (
            <article key={a.title}>
              <span className="year">{a.year}</span>
              <h3>{a.title}</h3>
              <p>{a.tracks} треков</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
