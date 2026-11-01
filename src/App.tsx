import { useAuth } from "./auth";
import { navigate, useRoute } from "./router";
import { Home } from "./pages/Home";
import { AuthForm } from "./pages/AuthForm";
import { Profile } from "./pages/Profile";
import { Loader } from "./components/Loader";

export function App() {
  const route = useRoute();
  const { user, ready, signOut } = useAuth();

  if (!ready) return <Loader text="Загружаем…" />;

  let page;
  if (route === "/login") page = <AuthForm mode="login" />;
  else if (route === "/register") page = <AuthForm mode="register" />;
  else if (route === "/profile")
    page = user ? <Profile /> : <AuthForm mode="login" needAuth />;
  else page = <Home />;

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="top">
        <a className="logo" href="#/">
          Ночные Электрички
        </a>
        <nav>
          <a href="#/">Главная</a>
          {user ? (
            <>
              <a href="#/profile">Профиль</a>
              <button className="link" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <a href="#/login">Войти</a>
              <a className="pill" href="#/register">
                Регистрация
              </a>
            </>
          )}
        </nav>
      </header>
      <main>{page}</main>
      <footer className="foot">© 2026 Ночные Электрички · Бишкек</footer>
    </>
  );
}
