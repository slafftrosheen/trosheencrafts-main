/**
 * The complete set of editable editorial image slots on the public home page.
 * Promotional cards are managed separately in /admin/promotions.
 * This catalog is shared by the server validator and the admin editor.
 */
export const HOMEPAGE_IMAGE_SLOTS = [
  { key: "siteLogo", title: "Логотип сайта", description: "Используется в шапке, мобильном меню, подвале и админ-панели. Лучше квадратное фото с прозрачным фоном.", aspect: "square" },
  { key: "hero", title: "Главный экран", description: "Большой фон первого экрана. Главный объект лучше размещать справа, текст — слева.", aspect: "wide" },
  { key: "storyHeritage", title: "История · Наследие", description: "Первая карточка блока истории.", aspect: "landscape" },
  { key: "storyMakers", title: "История · Мастера", description: "Вторая карточка блока истории.", aspect: "landscape" },
  { key: "storyLegacy", title: "История · Семья", description: "Третья карточка блока истории.", aspect: "landscape" },
  { key: "storyPhilosophy", title: "История · Философия", description: "Четвёртая карточка блока истории.", aspect: "landscape" },
  { key: "materials", title: "Материалы", description: "Горизонтальное фото процесса и материалов.", aspect: "landscape" },
  { key: "craftsmanship", title: "Мастерство", description: "Квадратное фото в тёмном разделе.", aspect: "square" },
  { key: "shopFeature", title: "Переход в магазин", description: "Фото над ссылкой на коллекцию.", aspect: "landscape" },
  { key: "familyFeature", title: "Семья / Журнал", description: "Фото над ссылкой на журнал.", aspect: "landscape" },
] as const;

export type HomepageImageSlot = (typeof HOMEPAGE_IMAGE_SLOTS)[number]["key"];
export type HomepageImages = Partial<Record<HomepageImageSlot, string | null>>;
