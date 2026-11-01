// ВСЁ, что зависит от бэкенда, лежит здесь.
// Если в Swagger пути или поля называются иначе — поменяйте только этот файл.

export const API_BASE = "https://inai-col2.fishrungames.com";

export const ENDPOINTS = {
  register: "/api/register/", // POST
  login: "/api/login/", // POST
  logout: "/api/logout/", // POST
  profile: "/api/profile/", // GET — свой профиль
  updateProfile: "/api/profile/", // PATCH — редактирование
};

export const UPDATE_PROFILE_METHOD: "PUT" | "PATCH" = "PATCH";

// true — если логин в Swagger принимает form-data (OAuth2: username + password)
export const LOGIN_AS_FORM = false;

export type FieldDef = {
  name: string; // ключ в JSON
  label: string;
  type: "text" | "email" | "password";
  required?: boolean;
};

// Поля формы регистрации (имена — как в Swagger)
export const REGISTER_FIELDS: FieldDef[] = [
  { name: "username", label: "Логин", type: "text", required: true },
  { name: "password", label: "Пароль", type: "password", required: true },
];

// Поля формы входа
export const LOGIN_FIELDS: FieldDef[] = [
  { name: "username", label: "Логин", type: "text", required: true },
  { name: "password", label: "Пароль", type: "password", required: true },
];

// Варианты поля «specialization» (value — как в Swagger, label — для показа).
// Проверьте по Schema у PATCH /api/profile/ и поправьте при необходимости.
export const SPECIALIZATIONS: { value: string; label: string }[] = [
  { value: "vocals", label: "Вокал" },
  { value: "guitar", label: "Гитара" },
  { value: "bass", label: "Бас-гитара" },
  { value: "drums", label: "Ударные" },
  { value: "keys", label: "Клавишные" },
];
