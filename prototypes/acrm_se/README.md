# aCRM — Аналитический фронт Группы Московская Биржа

Кликабельный прототип аналитического CRM для Группы Московская Биржа.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # продакшн-билд
```

## Стек
- React 19 + TypeScript · Vite · Tailwind CSS v3
- React Router v7 · Recharts · Lucide React · Mock data (без backend)

## Архитектура

```
src/
├── types/       TypeScript типы (Holding, Company, Person, Alert...)
├── data/        Mock данные + утилиты форматирования
├── services/    Сервисный слой — заменить на реальные API
├── context/     AppContext — роль пользователя, поиск
├── components/  layout/ + common/ (KPICard, ScoreBadge, AI...)
└── pages/       Все страницы
```

## Роли и маршруты

| Роль | Путь |
|------|------|
| CEO / Правление | `/ceo` |
| Руководитель блока | `/block-head` |
| Рынки / PM / CX | `/market-lead` |
| Клиентский менеджер | `/manager` |
| Операционный контур | `/operations` |

Начало: `/role-select`

## Ключевые страницы

`/holdings` · `/holdings/:id` · `/companies/:id` · `/persons/:id`
`/alerts` · `/tasks` · `/strategy` · `/cohorts` · `/events` · `/news`

## Аналитика брокера

- CRM-вкладка рейтинга Альфа-Банка: `/companies/c4?tab=ranking`
- CRM-вкладка аналитики портфеля: `/companies/c4?tab=portfolio_analytics`
- Самостоятельный кабинет брокера: `/broker/c4`

CRM и кабинет брокера используют общие аналитические компоненты. В CRM доступны
сравнительные показатели участников, а во внешнем кабинете конкуренты обезличены.

## Замена mock data на реальные API

Все сервисы изолированы в `src/services/index.ts`.
Каждый сервис содержит комментарий `// TODO: connect to ЕХД / CRM / ...`

Источники: ЕХД · CRM · oCRM · BPMSoft · Service Desk · Биллинг
Торговая система · СПАРК/Интерфакс · AI/LLM-сервис

## Концепция

```
aCRM = аналитический контур (уровни 3–6)
oCRM = операционный контур (уровни 0–2)
ЕХД  = единое хранилище данных
От аналитики — к действию.
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
