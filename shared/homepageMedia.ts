/**
 * The complete set of editable editorial image slots on the public home page.
 * Promotional cards are managed separately in /admin/promotions.
 * This catalog is shared by the server validator and the admin editor.
 */
export const HOMEPAGE_IMAGE_SLOTS = [
  { key: "siteLogo", title: "Логотип сайта", description: "Используется в шапке, мобильном меню, подвале и админ-панели. Загружайте фирменный знак с прозрачным фоном.", aspect: "square" },
  { key: "hero", title: "Главный экран", description: "Загружайте чистое фото БЕЗ надписей, логотипов и цветных панелей. Текст и кнопки выводятся отдельно в зелёной области. На мобильных стандартное фото отдельное; загруженное фото используется на всех экранах.", aspect: "wide" },
  { key: "storyHeritage", title: "Коллекция · Из формы", description: "Первая фотопанель коллекций на главной.", aspect: "landscape" },
  { key: "storyMakers", title: "Коллекция · Для дома", description: "Вторая фотопанель коллекций на главной.", aspect: "landscape" },
  { key: "storyLegacy", title: "История · Семья", description: "Третья карточка блока истории.", aspect: "landscape" },
  { key: "storyPhilosophy", title: "История · Философия", description: "Четвёртая карточка блока истории.", aspect: "landscape" },
  { key: "materials", title: "Материалы", description: "Горизонтальное фото процесса и материалов.", aspect: "landscape" },
  { key: "craftsmanship", title: "Мастерство", description: "Квадратное фото в тёмном разделе.", aspect: "square" },
  { key: "shopFeature", title: "Индивидуальный заказ", description: "Фото в блоке с переходом в конструктор на главной.", aspect: "landscape" },
  { key: "galleryFeature", title: "Галерея · анонс", description: "Фото ссылки на галерею на главной. Пока фото не загружено, выводится фирменная анимация.", aspect: "landscape" },
  { key: "journalFeature", title: "Журнал · анонс", description: "Фото ссылки на журнал на главной. Пока фото не загружено, выводится фирменная анимация.", aspect: "landscape" },
  { key: "familyFeature", title: "Семейная история", description: "Фото рядом с краткой историей семьи на главной.", aspect: "landscape" },
] as const;

export type HomepageImageSlot = (typeof HOMEPAGE_IMAGE_SLOTS)[number]["key"];
export type HomepageImages = Partial<Record<HomepageImageSlot, string | null>>;

/** Legacy keys remain valid for stored configurations; only current placements are edited/migrated. */
export const ACTIVE_HOMEPAGE_IMAGE_SLOTS = HOMEPAGE_IMAGE_SLOTS.filter(
  ({ key }) => !["storyLegacy", "storyPhilosophy", "materials", "craftsmanship"].includes(key)
);
