/**
 * Named editorial image slots used by the current public Home and About pages.
 * Promotional cards are managed separately in /admin/promotions.
 * This catalog is shared by the server validator and the admin editor.
 */
export const HOMEPAGE_IMAGE_SLOTS = [
  { key: "siteLogo", title: "Логотип сайта", description: "Используется в шапке, мобильном меню, подвале и админ-панели. Загружайте фирменный знак с прозрачным фоном.", aspect: "square" },
  { key: "hero", title: "Главный экран", description: "Загружайте чистое фото БЕЗ надписей, логотипов и цветных панелей. Текст и кнопки выводятся отдельно в зелёной области. На мобильных стандартное фото отдельное; загруженное фото используется на всех экранах.", aspect: "wide" },
  { key: "storyHeritage", title: "Главная · фото мастерской", description: "Первая фотография в приветственном блоке главной.", aspect: "landscape" },
  { key: "storyMakers", title: "Главная · фото двора", description: "Вторая фотография в приветственном блоке главной.", aspect: "landscape" },
  { key: "storyLegacy", title: "О нас · двор", description: "Первая иллюстрация истории мастерской.", aspect: "landscape" },
  { key: "storyPhilosophy", title: "О нас · ремесло", description: "Фото в разделе о ручной работе.", aspect: "landscape" },
  { key: "materials", title: "О нас · семья 1", description: "Первое семейное фото в истории.", aspect: "landscape" },
  { key: "craftsmanship", title: "О нас · семья 2", description: "Второе семейное фото в истории.", aspect: "square" },
  { key: "shopFeature", title: "Индивидуальный заказ", description: "Фото в блоке с переходом в конструктор на главной.", aspect: "landscape" },
  { key: "galleryFeature", title: "Галерея · анонс", description: "Фото ссылки на галерею на главной. Пока фото не загружено, выводится фирменная анимация.", aspect: "landscape" },
  { key: "journalFeature", title: "Журнал · анонс", description: "Фото ссылки на журнал на главной. Пока фото не загружено, выводится фирменная анимация.", aspect: "landscape" },
  { key: "familyFeature", title: "О нас · главный экран", description: "Главная иллюстрация страницы «Наша история».", aspect: "landscape" },
] as const;

export type HomepageImageSlot = (typeof HOMEPAGE_IMAGE_SLOTS)[number]["key"];
export type HomepageImages = Partial<Record<HomepageImageSlot, string | null>>;

/** Every slot is now connected to a visible public placement. */
export const ACTIVE_HOMEPAGE_IMAGE_SLOTS = HOMEPAGE_IMAGE_SLOTS;
