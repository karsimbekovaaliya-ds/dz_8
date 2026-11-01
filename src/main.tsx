import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
