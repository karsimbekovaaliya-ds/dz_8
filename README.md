# Ночные Электрички — сайт группы (ДЗ8)

React + TypeScript + Vite (без Babel). Регистрация, вход, выход, профиль и его редактирование.

## Запуск
```
npm install
npm run dev
```

## Настройка под бэкенд
Все пути и поля — в `src/config.ts`. Сверьте со Swagger: https://inai-col2.fishrungames.com/api/docs/

## Деплой
1. Залить в репозиторий на GitHub (ветка `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. После пуша workflow `.github/workflows/deploy.yml` соберёт и выкатит сайт.
