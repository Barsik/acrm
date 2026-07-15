// Сопоставление холдингов/компаний из mockData с клиентами из mockDatabase.
// Любой переход в карточку холдинга или компании открывает стандартную
// карточку клиента (/clients/:id) — ту же, что из раздела «Клиенты».
export const entityToClientId: Record<string, number> = {
  h1: 3,  // Группа Сбербанк → ПАО «Сбербанк»
  h2: 10, // ВТБ Группа → Банк ВТБ (ПАО)
  h3: 1,  // Газпром Финанс → ПАО «Газпром»
  h4: 20, // Альфа-Банк Группа → АО «Альфа-Банк»
  h5: 21, // Россельхозбанк → АО «Россельхозбанк»
  h6: 22, // Финам Группа → АО «ФИНАМ»
  c1: 3,  // ПАО Сбербанк → ПАО «Сбербанк»
  c2: 3,  // Сбер Инвестиции → ПАО «Сбербанк»
  c3: 10, // ВТБ Капитал → Банк ВТБ (ПАО)
  c4: 20, // Альфа-Банк → АО «Альфа-Банк»
};

export const clientIdForEntity = (entityId: string): number | undefined =>
  entityToClientId[entityId];

// Сопоставление по названию — для списков, где есть только имя компании/холдинга
const nameToClientId: Record<string, number> = {
  'Группа Сбербанк': 3,
  'ПАО Сбербанк': 3,
  'Сбер Инвестиции': 3,
  'ВТБ Группа': 10,
  'ВТБ Капитал': 10,
  'Газпром Финанс': 1,
  'Альфа-Банк Группа': 20,
  'Альфа-Банк': 20,
  'Россельхозбанк': 21,
  'Финам Группа': 22,
  'Финам': 22,
};

export const clientIdForName = (name: string): number | undefined =>
  nameToClientId[name];

/** Путь к стандартной карточке клиента по id сущности или названию; null, если сопоставления нет. */
export const clientPathFor = (entityId?: string, name?: string): string | null => {
  const mapped = entityId ? clientIdForEntity(entityId) : undefined;
  // Числовой entityId — это уже id клиента из mockDatabase (задачи, созданные через форму)
  const direct = entityId && /^\d+$/.test(entityId) ? Number(entityId) : undefined;
  const byName = name ? clientIdForName(name) : undefined;
  const id = mapped ?? direct ?? byName;
  return id ? `/clients/${id}` : null;
};
