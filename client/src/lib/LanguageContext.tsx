import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "lv" | "ru" | "pl" | "uk";

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  // Navigation
  nav_story: { en: "Our Story", lv: "Mūsu stāsts", ru: "Наша история", pl: "Nasza historia", uk: "Наша історія" },
  nav_shop: { en: "Shop", lv: "Veikals", ru: "Магазин", pl: "Sklep", uk: "Магазин" },
  nav_blog: { en: "Workshop Notes", lv: "Darbnīcas piezīmes", ru: "Заметки мастерской", pl: "Notatki z warsztatu", uk: "Нотатки майстерні" },
  nav_contact: { en: "Contact", lv: "Kontakti", ru: "Контакты", pl: "Kontakt", uk: "Контакти" },
  nav_gallery: { en: "Gallery", lv: "Galerija", ru: "Галерея", pl: "Galeria", uk: "Галерея" },
  nav_cta: { en: "Visit the Workshop", lv: "Apmeklēt darbnīcu", ru: "Посетить мастерскую", pl: "Odwiedź warsztat", uk: "Відвідати майстерню" },

  // New Navigation
  "nav.home": { en: "Home", lv: "Sākums", ru: "Главная", pl: "Strona główna", uk: "Головна" },
  "nav.shop": { en: "Shop", lv: "Veikals", ru: "Магазин", pl: "Sklep", uk: "Магазин" },
  "nav.blog": { en: "Workshop Notes", lv: "Darbnīcas piezīmes", ru: "Заметки", pl: "Notatki", uk: "Нотатки" },
  "nav.inspiration": { en: "Inspiration", lv: "Iedvesma", ru: "Вдохновение", pl: "Inspiracje", uk: "Натхнення" },
  "nav.settings": { en: "Settings", lv: "Iestatījumi", ru: "Настройки", pl: "Ustawienia", uk: "Налаштування" },
  "nav.featured": { en: "Featured", lv: "Izcelts", ru: "Популярное", pl: "Polecane", uk: "Популярне" },
  "nav.explore": { en: "Explore", lv: "Izpētīt", ru: "Исследовать", pl: "Odkrywaj", uk: "Дослідити" },

  // Hero
  hero_location: { en: "Family Workshop - Daugavpils, Latvia", lv: "Gimenes darbnīca - Daugavpils, Latvija", ru: "Семейная мастерская - Даугавпилс, Латвия", pl: "Rodzinny Warsztat - Daugavpils, Łotwa", uk: "Сімейна Майстерня - Даугавпілс, Латвія" },
  hero_title_1: { en: "Crafted by", lv: "Veidots ar", ru: "Создано", pl: "Stworzone przez", uk: "Створено" },
  hero_title_2: { en: "Family Hands", lv: "Ģimenes Rokām", ru: "Семейными Руками", pl: "Rodzinne Ręce", uk: "Сімейними Руками" },
  hero_subtitle: {
    en: "Three generations in a Daugavpils backyard transform concrete, gypsum, and natural minerals into heirlooms. Each piece carries the warmth of hands that learned from grandparents—and now teach the little ones.",
    lv: "Trīs paaudzes Daugavpils pagalmā pārveido betonu, ģipsi un dabīgos minerālus mantojumā. Katrs darbs nes to roku siltumu, kas mācījās no vecvecākiem—un tagad māca mazos.",
    ru: "Три поколения на заднем дворе в Даугавпилсе превращают бетон, гипс и натуральные минералы в семейные реликвии. Каждое изделие несет тепло рук, которые учились у бабушек и дедушек—и теперь учат малышей.",
    pl: "Trzy pokolenia na podwórku w Daugavpils przekształcają beton, gips i naturalne minerały w rodzinne pamiątki. Każdy przedmiot niesie ciepło rąk, które uczyły się od dziadków—a teraz uczą najmłodszych.",
    uk: "Три покоління на задньому дворі в Даугавпілсі перетворюють бетон, гіпс і натуральні мінерали на сімейні реліквії. Кожен виріб несе тепло рук, які вчилися у бабусь і дідусів—і тепер вчать малечу."
  },
  hero_cta_primary: { en: "Meet Our Family", lv: "Iepazīstiet mūs", ru: "Познакомиться с нами", pl: "Poznaj naszą rodzinę", uk: "Познайомтеся з нами" },
  hero_cta_secondary: { en: "Shop Handmade", lv: "Pirkt roku darbus", ru: "Купить ручные работы", pl: "Kup rękodzieło", uk: "Купити ручні роботи" },
  hero_motto: {
    en: "Made with love. Built to last lifetimes.",
    lv: "Veidots ar mīlestību. Radīts mūžībai.",
    ru: "Сделано с любовью. Создано на века.",
    pl: "Zrobione z miłością. Stworzone na wieki.",
    uk: "Зроблено з любов'ю. Створено на віки."
  },

  // New Hero Keys
  "hero.handcrafted": { en: "Family-Made in Latvia", lv: "Ģimenes roku darbs Latvijā", ru: "Семейная работа из Латвии", pl: "Rodzinna robota z Łotwy", uk: "Сімейна робота з Латвії" },
  "hero.title.line1": { en: "Where Family", lv: "Kur ģimene", ru: "Где семья", pl: "Gdzie rodzina", uk: "Де сім'я" },
  "hero.title.line2": { en: "Shapes Home", lv: "Veido Mājas", ru: "Создаёт Дом", pl: "Tworzy Dom", uk: "Створює Дім" },
  "hero.title.line3": { en: "Into Art", lv: "Mākslā", ru: "В Искусство", pl: "W Sztukę", uk: "У Мистецтво" },
  "hero.subtitle": { en: "Three generations craft concrete, gypsum, and mineral acrylics into pieces that feel like home—each one handmade in our Daugavpils workshop, destined to become part of your family story.", lv: "Trīs paaudzes veido betonu, ģipsi un minerālās akrila krāsas darbos, kas jūtas kā mājas—katrs roku darbs no mūsu Daugavpils darbnīcas, kam lemts kļūt par daļu no jūsu ģimenes stāsta.", ru: "Три поколения превращают бетон, гипс и минеральный акрил в изделия, которые ощущаются как дом—каждое ручной работы из нашей даугавпилсской мастерской, которому суждено стать частью вашей семейной истории.", pl: "Trzy pokolenia tworzą z betonu, gipsu i mineralnych akryli przedmioty, które dają poczucie domu—każdy ręcznie wykonany w naszym warsztacie w Daugavpils, by stać się częścią historii Twojej rodziny.", uk: "Три покоління перетворюють бетон, гіпс і мінеральний акрил на вироби, які відчуваються як дім—кожен ручної роботи з нашої даугавпілської майстерні, якому судилося стати частиною вашої сімейної історії." },
  "hero.cta.shop": { en: "Explore Collection", lv: "Apskatīt Kolekciju", ru: "Смотреть Коллекцию", pl: "Zobacz Kolekcję", uk: "Дивитися Колекцію" },
  "hero.cta.watch": { en: "See How We make", lv: "Skatīt kā taisam", ru: "Смотреть процесс", pl: "Zobacz jak tworzymy", uk: "Дивитися процес" },
  "hero.stats.years": { en: "Years Together", lv: "Kopā gadi", ru: "Лет вместе", pl: "Lat razem", uk: "Років разом" },
  "hero.stats.generations": { en: "Generations", lv: "Paaudzes", ru: "Поколения", pl: "Pokolenia", uk: "Покоління" },
  "hero.stats.pieces": { en: "Happy Homes", lv: "Laimīgas mājas", ru: "Счастливых домов", pl: "Szczęśliwe domy", uk: "Щасливих домівок" },
  "hero.family_badge": { en: "Alisija & Nikolass Approved", lv: "Alisija un Nikolass atzīti", ru: "Одобрено Алисией и Николасом", pl: "Zatwierdzone przez Alisiję i Nikolassa", uk: "Схвалено Алісією та Ніколасом" },

  // Timeline Events
  "timeline.1995.title": { en: "Oleg's First Workshop", lv: "Oļega Pirmā Darbnīca", ru: "Первая Мастерская Олега", pl: "Pierwszy Warsztat Olega", uk: "Перша Майстерня Олега" },
  "timeline.1995.desc": { en: "Started with wire sculptures and small concrete planters in a makeshift backyard shed.", lv: "Sāka ar stiepļu skulptūrām un maziem betona podiem paštaisītā šķūnī.", ru: "Начал с проволочных скульптур и небольших бетонных кашпо в самодельном сарае.", pl: "Zaczął od rzeźb z drutu i małych betonowych doniczek w prowizorycznej szopie.", uk: "Почав з дротяних скульптур і невеликих бетонних кашпо в саморобному сараї." },

  "timeline.2005.title": { en: "Mixed Media Experiments", lv: "Jaukto Mediju Eksperimenti", ru: "Эксперименты со Смешанной Техникой", pl: "Eksperymenty z Techniką Mieszaną", uk: "Експерименти зі Змішаною Технікою" },
  "timeline.2005.desc": { en: "Discovered the beauty of embedding botanicals and minerals into concrete. The signature style begins.", lv: "Atklāja botānisko un minerālu ieslēgumu skaistumu betonā. Sākas paraksta stils.", ru: "Открыл красоту внедрения растений и минералов в бетон. Начало фирменного стиля.", pl: "Odkrył piękno zatapiania roślin i minerałów w betonie. Początek charakterystycznego stylu.", uk: "Відкрив красу вкраплення рослин і мінералів у бетон. Початок фірмового стилю." },

  "timeline.2018.title": { en: "Alisija is Born", lv: "Piedzimst Alisija", ru: "Рождение Алисии", pl: "Narodziny Alisiji", uk: "Народження Алісії" },
  "timeline.2018.desc": { en: "The workshop becomes a family space. Tiny hands start learning about textures and colors.", lv: "Darbnīca kļūst par ģimenes telpu. Mazas rokas sāk mācīties par tekstūrām un krāsām.", ru: "Мастерская становится семейным пространством. Маленькие ручки начинают изучать текстуры и цвета.", pl: "Warsztat staje się przestrzenią rodzinną. Małe rączki zaczynają poznawać tekstury i kolory.", uk: "Майстерня стає сімейним простором. Маленькі ручки починають вивчати текстури і кольори." },

  "timeline.2019_nikola.title": { en: "Nikolass Joins", lv: "Pievienojas Nikolass", ru: "Присоединяется Николас", pl: "Dołącza Nikolass", uk: "Приєднується Ніколас" },
  "timeline.2019_nikola.desc": { en: "Two children, two sets of curious hands. The next generation of makers begins their journey.", lv: "Divi bērni, divi ziņkārīgu roku pāri. Nākamā meistaru paaudze sāk savu ceļojumu.", ru: "Двое детей, две пары любопытных рук. Следующее поколение мастеров начинает свой путь.", pl: "Dwoje dzieci, dwie pary ciekawskich rąk. Następne pokolenie twórców rozpoczyna swoją podróż.", uk: "Двоє дітей, дві пари допитливих рук. Наступне покоління майстрів починає свій шлях." },

  "timeline.2019.title": { en: "First Market Success", lv: "Pirmie Panākumi Tirgū", ru: "Первый Успех на Рынке", pl: "Pierwszy Sukces Rynkowy", uk: "Перший Успіх на Ринку" },
  "timeline.2019.desc": { en: "Heart vessel candles sell out at Riga Christmas Market. People love the \"second life\" philosophy.", lv: "Sirds formas sveces tiek izpārdotas Rīgas Ziemassvētku tirdziņā. Cilvēki mīl \"otrās dzīves\" filozofiju.", ru: "Свечи в форме сердца раскупаются на Рижской рождественской ярмарке. Людям нравится философия \"второй жизни\".", pl: "Świece w kształcie serca wyprzedają się na Ryskim Jarmarku. Ludzie kochają filozofię \"drugiego życia\".", uk: "Свічки у формі серця розкуповуються на Ризькому різдвяному ярмарку. Людям подобається філософія \"другого життя\"." },

  "timeline.2023.title": { en: "Workshop Expansion", lv: "Darbnīcas Paplašināšana", ru: "Расширение Мастерской", pl: "Rozbudowa Warsztatu", uk: "Розширення Майстерні" },
  "timeline.2023.desc": { en: "Built a dedicated painting station and curing room. Production doubles while keeping quality.", lv: "Izbūvēta atsevišķa krāsošanas stacija un žāvēšanas telpa. Ražošana dubultojas, saglabājot kvalitāti.", ru: "Построена отдельная покрасочная станция и комната для сушки. Производство удваивается при сохранении качества.", pl: "Zbudowano dedykowaną stację malarską i suszarnię. Produkcja podwaja się przy zachowaniu jakości.", uk: "Побудована окрема фарбувальна станція і кімната для сушіння. Виробництво подвоюється при збереженні якості." },

  "timeline.2026.title": { en: "Trosheen.Crafts Online", lv: "Trosheen.Crafts Tiešsaistē", ru: "Trosheen.Crafts Онлайн", pl: "Trosheen.Crafts Online", uk: "Trosheen.Crafts Онлайн" },
  "timeline.2026.desc": { en: "Bringing Daugavpils workshop stories to the world. Three generations, one craft, infinite pieces.", lv: "Nesot Daugavpils darbnīcas stāstus pasaulei. Trīs paaudzes, viens amats, bezgalīgi darbi.", ru: "Несем истории даугавпилсской мастерской миру. Три поколения, одно ремесло, бесконечные произведения.", pl: "Przenosimy historie warsztatu z Daugavpils w świat. Trzy pokolenia, jedno rzemiosło, nieskończone dzieła.", uk: "Несемо історії даугавпілської майстерні світу. Три покоління, одне ремесло, нескінченні вироби." },

  // Timeline
  "timeline.title": { en: "Our Craft Journey", lv: "Mūsu Amatu Ceļojums", ru: "Наш Ремесленный Путь", pl: "Nasza Rzemieślnicza Podróż", uk: "Наш Ремісничий Шлях" },
  "timeline.tag": { en: "Three Generations", lv: "Trīs Paaudzes", ru: "Три Поколения", pl: "Trzy Pokolenia", uk: "Три Покоління" },
  "timeline.description": {
    en: "From a backyard shed to a family workshop where children learn what grandparents taught—the art of making things that last.",
    lv: "No šķūņa pagalmā līdz ģimenes darbnīcai, kur bērni mācās to, ko mācīja vecvecāki—mākslu radīt lietas, kas kalpo ilgi.",
    ru: "От сарая на заднем дворе до семейной мастерской, где дети учатся тому, чему учили бабушки и дедушки—искусству создавать вещи на века.",
    pl: "Od szopy na podwórku do rodzinnego warsztatu, gdzie dzieci uczą się tego, czego uczyli dziadkowie—sztuki tworzenia rzeczy trwałych.",
    uk: "Від сараю на задньому дворі до сімейної майстерні, де діти вчаться тому, чому вчили бабусі й дідусі—мистецтву створювати речі на віки."
  },

  // Quotes
  "quote.oleg": {
    en: "\"Every piece we make carries 30 years of learning, and will live 30 more in your home.\"",
    lv: "\"Katrs mūsu radītais darbs nes 30 gadu pieredzi un dzīvos vēl 30 gadus jūsu mājās.\"",
    ru: "\"В каждом нашем изделии 30 лет опыта, и оно проживет в вашем доме еще 30 лет.\"",
    pl: "\"Każdy nasz wyrób niesie 30 lat nauki i przetrwa kolejne 30 lat w Twoim domu.\"",
    uk: "\"У кожному нашому виробі 30 років досвіду, і він проживе у вашому домі ще 30 років.\""
  },
  "quote.author": { en: "— Oleg", lv: "— Oļegs", ru: "— Олег", pl: "— Oleg", uk: "— Олег" },

  // General CTA
  "cta.visit_studio": { en: "Visit Studio", lv: "Apmeklēt Studiju", ru: "Посетить Студию", pl: "Odwiedź Studio", uk: "Відвідати Студію" },
  
  // Story Section
  story_eyebrow: { en: "Our Family Story", lv: "Mūsu ģimenes stāsts", ru: "Наша семейная история", pl: "Nasza Rodzinna Historia", uk: "Наша Сімейна Історія" },
  story_headline_1: { en: "Where craft", lv: "Kur amats", ru: "Где ремесло", pl: "Gdzie rzemiosło", uk: "Де ремесло" },
  story_headline_2: { en: "meets home", lv: "satiek mājas", ru: "встречает дом", pl: "spotyka dom", uk: "зустрічає дім" },
  story_headline_3: { en: "and heart.", lv: "un sirdi.", ru: "и сердце.", pl: "i serce.", uk: "і серце." },
  story_intro: {
    en: "In our workshop, seasons mark time better than any calendar. When winter frost coats the windows, we pour warm gypsum into molds. When spring lilacs bloom, we press their petals into still-soft concrete. This is how three generations create—together, by feel, with love.",
    lv: "Oļegs neseko receptēm. Viņš strādā pēc pieskāriena, intuīcijas un gadalaiku ritma—slāņojot pigmentus kā nogulumu, iespiežot botāniskos elementus, kamēr betons vēl mīksts, pulējot malas, līdz tās uztver gaismu.",
    ru: "Олег не следует рецептам. Он работает на ощупь, интуиции и ритме сезонов—наслаивая пигменты как осадок, впечатывая растения, пока бетон еще мягкий, полируя края, пока они не ловят свет.",
    pl: "W naszym warsztacie pory roku wyznaczają czas lepiej niż jakikolwiek kalendarz. Gdy mróz pokrywa okna, wlewamy ciepły gips do form. Gdy kwitną bzy, wciskamy ich płatki w wciąż miękki beton. Tak tworzą trzy pokolenia—razem, na wyczucie, z miłością.",
    uk: "У нашій майстерні пори року відраховують час краще за будь-який календар. Коли мороз вкриває вікна, ми заливаємо теплий гіпс у форми. Коли цвіте бузок, ми втискаємо його пелюстки у ще м'який бетон. Так творять три покоління—разом, на відчуття, з любов'ю."
  },

  // Story Chapters
  chapter_heritage_eyebrow: { en: "Where We Come From", lv: "Mūsu saknes", ru: "Откуда мы", pl: "Skąd pochodzimy", uk: "Звідки ми" },
  chapter_heritage_title: { en: "A Family Workshop", lv: "Ģimenes darbnīca", ru: "Семейная мастерская", pl: "Rodzinny Warsztat", uk: "Сімейна Майстерня" },
  chapter_heritage_body_1: {
    en: "In Daugavpils, there's a backyard where seasons mark time better than any calendar. Snow drifts against the fence in winter, lilacs bloom by the shed door in spring. In the middle of it all stands our workshop—bags of gypsum next to jars of pigments, mineral acrylics beside concrete molds, and always the smell of natural wax warming nearby. This is home.\n\nOur story was never about starting a business. It was about hands that cannot sit still when there are materials waiting to be shaped—concrete to be cast, gypsum to be painted, resins to be swirled with colors. Three languages mix at our dinner table (Latvian, Russian, Polish), and three generations mix in our workshop. Grandparents taught us to bend wire and mix colors. Now we teach the little ones.",
    lv: "Daugavpilī ir pagalms, kur gadalaiki skaita laiku labāk par jebkuru kalendāru. Ziemā sniegs krājas pie sētas, pavasarī ceriņi zied pie šķūņa durvīm. Visa vidū stāv mūsu darbnīca—ģipša maisi blakus pigmentu burciņām, minerālās akrila krāsas blakus betona veidnēm, un vienmēr dabīgā vaska smarža, kas sasilst tuvumā. Tās ir mājas.\n\nMūsu stāsts nekad nebija par biznesa uzsākšanu. Tas bija par rokām, kas nevar nosēdēt mierīgi, kad ir materiāli, kas gaida formu—betons jālej, ģipsis jākrāso, sveķi jājauc ar krāsām. Pie mūsu pusdienu galda saplūst trīs valodas (latviešu, krievu, poļu), un mūsu darbnīcā saplūst trīs paaudzes. Vecvecāki mums mācīja locīt stieples un jauca krāsas. Tagad mēs mācām mazos.",
    ru: "В Даугавпилсе есть задний двор, где времена года отсчитывают время лучше любого календаря. Зимой снег наметает у забора, весной сирень цветет у двери сарая. Посреди всего этого стоит наша мастерская—мешки с гипсом рядом с банками пигментов, минеральный акрил рядом с бетонными формами, и всегда запах натурального воска, тающего неподалеку. Это дом.\n\nНаша история никогда не была о создании бизнеса. Это о руках, которые не могут сидеть сложа, когда есть материалы, ждущие формы—бетон для отливки, гипс для росписи, смолы для смешивания с красками. За нашим обеденным столом смешиваются три языка (латышский, русский, польский), а в мастерской—три поколения. Бабушки и дедушки учили нас гнуть проволоку и смешивать краски. Теперь мы учим малышей.",
    pl: "W Daugavpils jest podwórko, gdzie pory roku odmierzają czas lepiej niż kalendarz. Zimą śnieg zasypuje płot, wiosną bzy kwitną przy drzwiach szopy. Pośrodku tego wszystkiego stoi nasz warsztat—worki gipsu obok słoików z pigmentami, mineralne akryle obok form betonowych i zawsze zapach naturalnego wosku w pobliżu. To jest dom.\n\nNasza historia nigdy nie dotyczyła zakładania firmy. Chodziło o ręce, które nie mogą usiedzieć w miejscu, gdy materiały czekają na ukształtowanie. Przy naszym stole mieszają się trzy języki (łotewski, rosyjski, polski), a w warsztacie trzy pokolenia. Dziadkowie uczyli nas giąć drut i mieszać kolory. Teraz my uczymy najmłodszych.",
    uk: "У Даугавпілсі є задній двір, де пори року відраховують час краще за будь-який календар. Взимку сніг намітає біля паркану, навесні бузок цвіте біля дверей сараю. Посеред усього цього стоїть наша майстерня—мішки з гіпсом поруч з банками пігментів, мінеральний акрил поруч з бетонними формами, і завжди запах натурального воску неподалік. Це дім.\n\nНаша історія ніколи не була про створення бізнесу. Це про руки, які не можуть сидіти склавши руки, коли матеріали чекають на форму. За нашим обіднім столом змішуються три мови (латиська, російська, польська), а в майстерні—три покоління. Бабусі й дідусі вчили нас гнути дріт і змішувати фарби. Тепер ми вчимо малечу."
  },

  chapter_makers_eyebrow: { en: "The Heart & Soul", lv: "Sirds un dvēsele", ru: "Сердце и душа", pl: "Serce i Dusza", uk: "Серце і Душа" },
  chapter_makers_title: { en: "Oleg's Creative Universe", lv: "Oļega radošā pasaule", ru: "Творческая вселенная Олега", pl: "Twórczy Świat Olega", uk: "Творчий Всесвіт Олега" },
  chapter_makers_body_1: {
    en: "Oleg's hands speak a language older than words. Whether he's pouring architectural concrete, sculpting with quick-setting gypsum, or painting with mineral acrylics, he works by feeling alone. His workshop is a symphony of textures—smooth concrete surfaces, chalk-white gypsum forms, the glossy depth of colored resins.\n\nWhen he creates the cupped hands holding a heart, he doesn't just pour and walk away. He presses his own fingerprints into the wet material. He brushes earth pigments into every crease. He burnishes edges until they catch Baltic light just right. This is craft that cannot be rushed—it moves at the pace of family, of seasons, of love.",
    lv: "Oļega rokas runā valodu, kas vecāka par vārdiem. Vai viņš lej arhitektūras betonu, veido ar ātri sacietējošu ģipsi, vai krāso ar minerālajām akrila krāsām, viņš strādā tikai pēc sajūtām. Viņa darbnīca ir tekstūru simfonija—gludas betona virsmas, krītbaltas ģipša formas, krāsainu sveķu dziļais mirdzums.\n\nKad viņš veido plaukstas, kas tur sirdi, viņš ne tikai ielej un aiziet. Viņš iespiež savus pirkstu nospiedumus mitrā materiālā. Viņš ieklāj zemes pigmentus katrā rievā. Viņš pulē malas, līdz tās pareizi uztver Baltijas gaismu. Šis ir amats, ko nevar steigt—tas virzās ģimenes, gadalaiku un mīlestības tempā.",
    ru: "Руки Олега говорят на языке древнее слов. Заливает ли он архитектурный бетон, лепит из быстросхватывающегося гипса или расписывает минеральным акрилом—он работает только по ощущениям. Его мастерская—симфония фактур: гладкие бетонные поверхности, меловой белизны гипсовые формы, глубокий блеск цветных смол.\n\nКогда он создает сложенные ладони, держащие сердце, он не просто заливает и уходит. Он впечатывает свои отпечатки пальцев во влажный материал. Он втирает земляные пигменты в каждую складку. Он полирует края, пока они не поймают балтийский свет как надо. Это ремесло, которое нельзя торопить—оно движется в ритме семьи, времен года и любви.",
    pl: "Ręce Olega mówią językiem starszym niż słowa. Czy wylewa beton architektoniczny, rzeźbi w szybkowiążącym gipsie, czy maluje mineralnymi akrylami, pracuje wyłącznie na wyczucie. Jego warsztat to symfonia faktur—gładkie powierzchnie betonu, kredowobiałe formy gipsowe, głębia kolorowych żywic.\n\nKiedy tworzy dłonie trzymające serce, nie tylko wylewa i odchodzi. Wciska własne odciski palców w mokry materiał. Wciera pigmenty ziemi w każde zagłębienie. Poleruje krawędzie, aż odpowiednio złapią bałtyckie światło. Tego rzemiosła nie można pospieszać—porusza się w rytmie rodziny, pór roku i miłości.",
    uk: "Руки Олега говорять мовою, давнішою за слова. Чи заливає він архітектурний бетон, ліпить зі швидкотужавіючого гіпсу, чи розписує мінеральним акрилом—він працює лише на відчуття. Його майстерня—це симфонія фактур: гладкі бетонні поверхні, крейдяно-білі гіпсові форми, глибокий блиск кольорових смол.\n\nКоли він створює складені долоні, що тримають серце, він не просто заливає і йде. Він втискає власні відбитки пальців у вологий матеріал. Він втирає земляні пігменти в кожну складку. Він полірує краї, поки вони не спіймають балтійське світло як треба. Це ремесло, яке не можна квапити—воно рухається в ритмі сім'ї, пір року і любові."
  },

  chapter_legacy_eyebrow: { en: "Little Helpers", lv: "Mazie palīgi", ru: "Маленькие помощники", pl: "Mali Pomocnicy", uk: "Маленькі Помічники" },
  chapter_legacy_title: { en: "Alisija & Nikolass", lv: "Alisija un Nikolass", ru: "Алисия и Николас", pl: "Alisija i Nikolass", uk: "Алісія та Ніколас" },
  chapter_legacy_body_1: {
    en: "Our workshop doesn't run on factory schedules—it runs on family time. Sometimes it's quiet at dawn with just Oleg mixing a new batch of gypsum. By afternoon, little footsteps echo through, and curious voices ask: \"Why does this candle have gold flakes?\" \"Can I paint the next one?\"\n\nAlisija has her favorite colors (always the sparkly ones). Nikolass tests for durability (\"Is this one strong enough for my dinosaurs?\" ). They know the workshop not as a workplace, but as a wonderland of textures, colors, and the magic of watching materials transform. When we pack for markets, it's the whole family—boxes assembled, logo stickers placed with care, and always a few pieces inspected by our smallest quality controllers.",
    lv: "Mūsu darbnīca nestrādā pēc rūpnīcas grafikiem—tā darbojas pēc ģimenes laika. Dažreiz rītausmā ir kluss, tikai Oļegs jauc jaunu ģipša partiju. Pēcpusdienā atskan mazi soļi, un ziņkārīgas balsis jautā: \"Kāpēc šai svecei ir zelta pārslas?\" \"Vai es varu nokrāsot nākamo?\"\n\nAlisijai ir savas mīļākās krāsas (vienmēr mirdzošās). Nikolass pārbauda izturību (\"Vai šī ir pietiekami stipra maniem dinozauriem?\" ). Viņi pazīst darbnīcu nevis kā darba vietu, bet kā brīnumzemi ar tekstūrām, krāsām un burvību vērot, kā materiāli pārvēršas. Kad pakojam tirdziņiem, tā ir visa ģimene—kastes saliktas, logo uzlīmes uzliktas ar rūpību, un vienmēr daži darbi pārbaudīti mūsu mazākajiem kvalitātes kontrolieriem.",
    ru: "Наша мастерская работает не по заводскому расписанию—она работает по семейному времени. Иногда на рассвете тихо, только Олег замешивает новую партию гипса. К полудню раздаются маленькие шаги и любопытные голоса спрашивают: \"Почему в этой свече золотые хлопья?\" \"Можно я раскрашу следующую?\"\n\nУ Алисии свои любимые цвета (всегда блестящие). Николас проверяет прочность (\"Достаточно ли она крепкая для моих динозавров?\" ). Они знают мастерскую не как место работы, а как страну чудес с текстурами, цветами и волшебством превращения материалов. Когда мы собираемся на ярмарку—вся семья: коробки собраны, наклейки с логотипом наклеены с заботой, и несколько изделий обязательно проверены нашими самыми маленькими контролерами качества.",
    pl: "Nasz warsztat nie działa według fabrycznych harmonogramów—działa w czasie rodzinnym. Czasem o świcie jest cicho, tylko Oleg miesza nową partię gipsu. Po południu rozlegają się małe kroki i pytania: \"Dlaczego ta świeca ma złote płatki?\" \"Mogę pomalować następną?\"\n\nAlisija ma swoje ulubione kolory (zawsze te błyszczące). Nikolass testuje wytrzymałość (\"Czy to wytrzyma moje dinozaury?\" ). Znają warsztat nie jako miejsce pracy, ale jako krainę czarów. Kiedy pakujemy się na targi, robi to cała rodzina—pudełka złożone, naklejki przyklejone starannie, a kilka sztuk zawsze sprawdzonych przez naszych najmniejszych kontrolerów jakości.",
    uk: "Наша майстерня працює не за заводським розкладом—вона працює за сімейним часом. Іноді на світанку тихо, тільки Олег замішує нову партію гіпсу. До обіду лунають маленькі кроки і цікаві голоси запитують: \"Чому в цій свічці золоті пластівці?\" \"Можна я розфарбую наступну?\"\n\nУ Алісії свої улюблені кольори (завжди блискучі). Ніколас перевіряє міцність (\"Чи витримає це моїх динозаврів?\" ). Вони знають майстерню не як місце роботи, а як країну чудес. Коли ми збираємося на ярмарок—вся сім'я: коробки зібрані, наклейки наклеєні з турботою, і кілька виробів обов'язково перевірені нашими найменшими контролерами якості."
  },

  chapter_philosophy_eyebrow: { en: "Built to Last", lv: "Radīts ilgam", ru: "Создано надолго", pl: "Stworzone by Trwać", uk: "Створено Надовго" },
  chapter_philosophy_title: { en: "Heirlooms, Not Products", lv: "Mantojumi, ne produkti", ru: "Реликвии, не товары", pl: "Pamiątki, Nie Produkty", uk: "Реліквії, Не Товари" },
  chapter_philosophy_body_1: {
    en: "We believe the most eco-friendly thing you can own is something you'll never throw away. Our pieces aren't decorations—they're companions for decades. The same Baltic winter that cracks cheap plastic simply adds character to our concrete and gypsum.\n\nOur candles tell this philosophy best. The vessel—whether cast in concrete, molded in gypsum, or detailed with mineral acrylics—is sculpted as art first. The wax is just its first life. When the candle is finished, the vessel remains—becoming a home for succulents, a keeper of rings, a holder of memories. We don't make containers. We make family treasures that happen to start their journey as candles.",
    lv: "Mēs ticam, ka videi draudzīgākā lieta, kas jums var piederēt, ir tā, ko nekad neizmetīsit. Mūsu darbi nav dekorācijas—tie ir biedri gadu desmitiem. Tā pati Baltijas ziema, kas saplaisā lētu plastmasu, vienkārši piešķir raksturu mūsu betonam un ģipsim.\n\nMūsu sveces vislabāk stāsta šo filozofiju. Trauks—vai tas būtu liets betonā, veidots ģipsī vai detalizēts ar minerālajām akrila krāsām—ir veidots kā māksla vispirms. Vasks ir tikai tā pirmā dzīve. Kad svece ir beigusies, trauks paliek—kļūstot par mājvietu sukulentiem, gredzenu glabātāju, atmiņu turētāju. Mēs netaisām traukus. Mēs taisām ģimenes dārgumus, kam gadās sākt savu ceļojumu kā svecēm.",
    ru: "Мы верим, что самая экологичная вещь, которой вы можете владеть—это то, что вы никогда не выбросите. Наши изделия—не украшения, а спутники на десятилетия. Та же балтийская зима, что трескает дешевый пластик, просто добавляет характер нашему бетону и гипсу.\n\nНаши свечи лучше всего рассказывают эту философию. Сосуд—будь то отлитый из бетона, сформованный из гипса или детализированный минеральным акрилом—создается прежде всего как искусство. Воск—лишь его первая жизнь. Когда свеча догорает, сосуд остается—становясь домом для суккулентов, хранителем колец, держателем воспоминаний. Мы не делаем контейнеры. Мы делаем семейные сокровища, которым случается начать свой путь как свечи.",
    pl: "Wierzymy, że najbardziej ekologiczną rzeczą, jaką możesz posiadać, jest ta, której nigdy nie wyrzucisz. Nasze prace to nie dekoracje—to towarzysze na dekady. Ta sama bałtycka zima, która niszczy tani plastik, po prostu dodaje charakteru naszemu betonowi i gipsowi.\n\nNasze świece najlepiej opowiadają tę filozofię. Naczynie—czy to odlane z betonu, uformowane z gipsu, czy ozdobione mineralnymi akrylami—jest najpierw rzeźbą. Wosk to tylko jego pierwsze życie. Gdy świeca się wypali, naczynie pozostaje—stając się domem dla sukulentów, schowkiem na pierścionki, strażnikiem wspomnień.",
    uk: "Ми віримо, що найбільш екологічна річ, якою ви можете володіти—це та, яку ви ніколи не викинете. Наші вироби—не прикраси, а супутники на десятиліття. Та ж балтійська зима, що руйнує дешевий пластик, просто додає характеру нашому бетону та гіпсу.\n\nНаші свічки найкраще розповідають цю філософію. Судина—чи то відлита з бетону, сформована з гіпсу, чи деталізована мінеральним акрилом—створюється насамперед як мистецтво. Віск—лише її перше життя. Коли свічка догорає, судина залишається—стаючи домом для сукулентів, зберігачем каблучок, тримачем спогадів."
  },

  // Image Quotes
  quote_makers: {
    en: "Oleg doesn't just cast—he sculpts, paints, and breathes life into material.",
    lv: "Oļegs ne tikai lej—viņš veido, krāso un ieelpo dzīvību materiālā.",
    ru: "Олег не просто отливает—он лепит, красит и вдыхает жизнь в материал.",
    pl: "Oleg nie tylko odlewa—on rzeźbi, maluje i tchnie życie w materiał.",
    uk: "Олег не просто відливає—він ліпить, фарбує і вдихає життя в матеріал."
  },
  quote_default: {
    en: "Made with many materials, meant to live in your home for generations.",
    lv: "Veidots ar daudziem materiāliem, paredzēts dzīvot jūsu mājās paaudzēm.",
    ru: "Сделано из многих материалов, предназначено жить в вашем доме поколениями.",
    pl: "Wykonane z wielu materiałów, by żyć w Twoim domu przez pokolenia.",
    uk: "Зроблено з багатьох матеріалів, щоб жити у вашому домі поколіннями."
  },

  // Philosophy Section
  phil_title: { en: "Art that feels like home.", lv: "Māksla, kas jūtas kā mājas.", ru: "Искусство, которое ощущается как дом.", pl: "Sztuka, która czuje się jak dom.", uk: "Мистецтво, яке відчувається як дім." },
  phil_desc: {
    en: "We believe in objects that improve with age. Moss settles into textures, patina deepens on bronze finishes, edges weather gracefully. Made from concrete, gypsum, mineral acrylics, and natural resins—built for decades, not seasons. Because the most sustainable thing you can own is something you'll never want to throw away.",
    lv: "Mēs ticam objektiem, kas uzlabojas ar laiku. Sūnas ieviešas tekstūrās, patīna padziļinās uz bronzas apdarēm, malas noveco gracioziun. Veidots no betona, ģipša, minerālajām akrila krāsām un dabīgiem sveķiem—radīts gadu desmitiem, nevis sezonām. Jo ilgtspējīgākā lieta, ko varat piederēt, ir kaut kas, ko nekad negribēsit izmest.",
    ru: "Мы верим в предметы, которые улучшаются с возрастом. Мох оседает в текстурах, патина углубляется на бронзовой отделке, края стареют красиво. Сделано из бетона, гипса, минерального акрила и натуральных смол—созданы на десятилетия, а не на сезоны. Потому что самая экологичная вещь, которой вы можете владеть—это то, что вы никогда не захотите выбросить.",
    pl: "Wierzymy w przedmioty, które zyskują z wiekiem. Mech osiada w teksturach, patyna pogłębia się na wykończeniach z brązu. Wykonane z betonu, gipsu, mineralnych akryli i naturalnych żywic—stworzone na dekady, nie sezony. Bo najbardziej zrównoważoną rzeczą jest ta, której nigdy nie będziesz chciał wyrzucić.",
    uk: "Ми віримо в предмети, які стають кращими з віком. Мох осідає в текстурах, патина поглиблюється на бронзовій обробці. Зроблено з бетону, гіпсу, мінерального акрилу та натуральних смол—створено на десятиліття, а не на сезони. Тому що найбільш екологічна річ—це та, яку ви ніколи не захочете викинути."
  },
  phil_durability: { en: "Built for Decades", lv: "Veidots gadu desmitiem", ru: "Создано на десятилетия", pl: "Stworzone na Dekady", uk: "Створено на Десятиліття" },
  phil_waste: { en: "Zero Waste Design", lv: "Bez atkritumiem", ru: "Ноль отходов", pl: "Zero Waste", uk: "Нуль Відходів" },
  phil_decades: { en: "30+ Years", lv: "30+ gadi", ru: "30+ лет", pl: "30+ Lat", uk: "30+ Років" },
  phil_zero: { en: "Zero", lv: "Nulle", ru: "Ноль", pl: "Zero", uk: "Нуль" },

  // Shop Preview
  shop_teaser_title: { en: "From Our Family to Yours.", lv: "No mūsu ģimenes jūsējai.", ru: "От нашей семьи — вашей.", pl: "Od Naszej Rodziny dla Waszej.", uk: "Від Нашої Сім'ї — Вашій." },
  shop_teaser_desc: {
    en: "Every piece tells a story—from candles that become vessels to stepping stones cast from Baltic leaves, from hand-painted gypsum figurines to sculptural fountains that age like ancient stone. Each crafted with concrete, gypsum, mineral acrylics, or natural resins.",
    lv: "Katrs darbs stāsta stāstu—no svecēm, kas kļūst par traukiem, līdz solīšanas akmeņiem, kas lieti no Baltijas lapām, no ar rokām krāsotām ģipša figūriņām līdz skulpturālām strūklakām, kas noveco kā senais akmens. Katrs veidots ar betonu, ģipsi, minerālajām akrila krāsām vai dabīgiem sveķiem.",
    ru: "Каждое изделие рассказывает историю—от свечей, которые становятся сосудами, до садовой плитки, отлитой с балтийских листьев, от расписанных вручную гипсовых фигурок до скульптурных фонтанов, которые стареют как древний камень. Каждое создано из бетона, гипса, минерального акрила или натуральных смол.",
    pl: "Każdy przedmiot opowiada historię—od świec, które stają się naczyniami, po kamienie ogrodowe odlane z bałtyckich liści. Każdy wykonany z betonu, gipsu, mineralnych akryli lub naturalnych żywic.",
    uk: "Кожен виріб розповідає історію—від свічок, що стають посудинами, до садової плитки, відлитої з балтійського листя. Кожен створений з бетону, гіпсу, мінерального акрилу або натуральних смол."
  },
  shop_view_all: { en: "See All Pieces", lv: "Redzēt visus darbus", ru: "Смотреть все работы", pl: "Zobacz Wszystkie Prace", uk: "Дивитися Всі Роботи" },
  shop_custom_builder: { en: "Custom Workshop", lv: "Pielāgota Darbnīca", ru: "Индивидуальная Мастерская", pl: "Warsztat Niestandardowy", uk: "Індивідуальна Майстерня" },
  shop_empty_title: { en: "The shelves are resting", lv: "Plaukti atpūšas", ru: "Полки отдыхают", pl: "Półki odpoczywają", uk: "Полиці відпочивають" },
  shop_empty_desc: { en: "We are currently crafting new collections. In the meantime, visit the Custom Workshop to build your own unique piece.", lv: "Mēs pašlaik veidojam jaunas kolekcijas. Tikmēr apmeklējiet Pielāgoto darbnīcu, lai izveidotu savu unikālo gabalu.", ru: "В настоящее время мы создаем новые коллекции. Тем временем посетите Индивидуальную мастерскую, чтобы создать свое уникальное изделие.", pl: "Obecnie tworzymy nowe kolekcje. W międzyczasie odwiedź Warsztat Niestandardowy, aby stworzyć własny unikalny kawałek.", uk: "Наразі ми створюємо нові колекції. Тим часом відвідайте Індивідуальну майстерню, щоб створити свій унікальний виріб." },
  shop_enter_workshop: { en: "Enter Workshop", lv: "Ieiet Darbnīcā", ru: "Войти в мастерскую", pl: "Wejdź do warsztatu", uk: "Увійти в майстерню" },
  "shop.piece": { en: "piece", lv: "darbs", ru: "изделие", pl: "produkt", uk: "виріб" },
  "shop.pieces": { en: "pieces", lv: "darbi", ru: "изделия", pl: "produkty", uk: "вироби" },
  "shop.handcast_location": { en: "Hand-cast in Daugavpils, Latvia", lv: "Ar rokām liets Daugavpilī, Latvijā", ru: "Отлито вручную в Даугавпилсе, Латвия", pl: "Ręcznie odlewane w Daugavpils na Łotwie", uk: "Відлито вручну в Даугавпілсі, Латвія" },
  "shop.builder_intro": { en: "Build a piece with the workshop", lv: "Izveido darbu kopā ar darbnīcu", ru: "Создайте изделие вместе с мастерской", pl: "Stwórz produkt razem z warsztatem", uk: "Створіть виріб разом із майстернею" },
  "contact.origin": { en: "From Daugavpils", lv: "No Daugavpils", ru: "Из Даугавпилса", pl: "Z Daugavpils", uk: "З Даугавпілса" },
  "contact.make_title": { en: "Tell us what you want to make.", lv: "Pastāstiet, ko vēlaties radīt.", ru: "Расскажите, что вы хотите создать.", pl: "Powiedz nam, co chcesz stworzyć.", uk: "Розкажіть, що ви хочете створити." },
  "contact.make_desc": { en: "Questions about a piece, a custom order or the workshop are all welcome. We answer as a family workshop, not a call centre.", lv: "Droši jautājiet par darbu, individuālu pasūtījumu vai darbnīcu. Atbildam kā ģimenes darbnīca, nevis zvanu centrs.", ru: "Мы рады вопросам об изделиях, индивидуальных заказах и мастерской. Отвечаем как семейная мастерская, а не колл-центр.", pl: "Zapraszamy z pytaniami o produkty, zamówienia indywidualne i warsztat. Odpowiadamy jako rodzinny warsztat, nie infolinia.", uk: "Раді питанням про вироби, індивідуальні замовлення та майстерню. Відповідаємо як сімейна майстерня, а не кол-центр." },
  product_handmade_badge: { en: "Handmade by Oleg", lv: "Oļega roku darbs", ru: "Ручная работа Олега", pl: "Ręczna praca Olega", uk: "Ручна робота Олега" },
  product_view_piece: { en: "View Piece", lv: "Skatīt Darbu", ru: "Смотреть Изделие", pl: "Zobacz Dzieło", uk: "Дивитися Виріб" },

  // Featured Products
  featured_prod1_name: { en: "Heart Vessel Candle", lv: "Sirds Trauka Svece", ru: "Свеча-сердце", pl: "Świeca Serce", uk: "Свічка-Серце" },
  featured_prod1_desc: { en: "Hand-sculpted & gold-flecked.", lv: "Ar rokām veidots un zelta plāksnēm.", ru: "Вылеплено вручную с золотыми хлопьями.", pl: "Ręcznie rzeźbiona ze złotem.", uk: "Виліплено вручну із золотими пластівцями." },

  featured_prod2_name: { en: "Leaf Stepping Stone", lv: "Lapu Solīšanas Akmens", ru: "Плитка-лист", pl: "Kamień Ogrodowy Liść", uk: "Садова Плитка Лист" },
  featured_prod2_desc: { en: "Painted real leaf impression.", lv: "Krāsots īstas lapas nospiedums.", ru: "Расписной отпечаток настоящего листа.", pl: "Malowany odcisk liścia.", uk: "Розписаний відбиток листка." },

  featured_prod3_name: { en: "Sculpted Fountain", lv: "Veidota Strūklaka", ru: "Скульптурный фонтан", pl: "Rzeźbiona Fontanna", uk: "Скульптурний Фонтан" },
  featured_prod3_desc: { en: "Oleg's unique hand-cast work.", lv: "Oļega unikāls ar rokām liets darbs.", ru: "Уникальная работа Олега.", pl: "Unikalna praca Olega.", uk: "Унікальна робота Олега." },

  // Section Labels
  workshop_insight: { en: "Workshop insight", lv: "Darbnīcas ieskats", ru: "Инсайт мастерской", pl: "Wgląd w warsztat", uk: "Інсайт майстерні" },
  curated_selection: { en: "Curated Selection", lv: "Izvēlēta Kolekcija", ru: "Избранная коллекция", pl: "Wybrana Kolekcja", uk: "Вибрана Колекція" },
  workshop_journal: { en: "Workshop Journal", lv: "Darbnīcas Dienasgrāmata", ru: "Журнал мастерской", pl: "Dziennik Warsztatu", uk: "Журнал Майстерні" },

  // CTA Buttons
  view_detail: { en: "View Detail", lv: "Skatīt detaļas", ru: "Смотреть детали", pl: "Szczegóły", uk: "Деталі" },
  read_notes: { en: "Read the notes", lv: "Lasīt piezīmes", ru: "Читать заметки", pl: "Czytaj notatki", uk: "Читати нотатки" },
  explore_collections: { en: "Explore related collections", lv: "Izpētīt saistītās kolekcijas", ru: "Исследовать коллекции", pl: "Odkryj kolekcje", uk: "Дослідити колекції" },

  // Added/Updated Keys for UI Consistency
  "story.narrative": { en: "Our Family Story", lv: "Mūsu ģimenes stāsts", ru: "Наша семейная история", pl: "Nasza Rodzinna Historia", uk: "Наша Сімейна Історія" },
  "story.headline": { en: "Where family warmth meets handmade art.", lv: "Kur ģimenes siltums satiekas ar roku darba mākslu.", ru: "Где семейное тепло встречается с рукотворным искусством.", pl: "Gdzie ciepło rodziny spotyka rękodzieło.", uk: "Де сімейне тепло зустрічає рукотворне мистецтво." },
  "story.intro": { en: "Our roots are layered like our materials—Russian, Polish, and Latvian cultures mixing in one Daugavpils workshop. Three languages at dinner, three generations in the studio, and countless pieces carrying the warmth of all.", lv: "Mūsu saknes ir daudzslāņainas kā mūsu materiāli—krievu, poļu un latviešu kultūras saplūst vienā Daugavpils darbnīcā. Trīs valodas pie vakariņām, trīs paaudzes studijā un neskaitāmi darbi, kas nes visu siltumu.", ru: "Наши корни многослойны, как наши материалы—русская, польская и латышская культуры смешиваются в одной даугавпилсской мастерской. Три языка за ужином, три поколения в студии и бесчисленные работы, несущие тепло всех.", pl: "Nasze korzenie są wielowarstwowe jak nasze materiały—kultury rosyjska, polska i łotewska mieszają się w jednym warsztacie. Trzy języki przy kolacji, trzy pokolenia w pracowni.", uk: "Наші корені багатошарові, як наші матеріали—російська, польська та латвійська культури змішуються в одній майстерні. Три мови за вечерею, три покоління в студії." },
  "story.makers.quote": { en: "\"The best pieces are born when the whole family is in the workshop.\"", lv: "\"Labākie darbi dzimst, kad visa ģimene ir darbnīcā.\"", ru: "\"Лучшие работы рождаются, когда вся семья в мастерской.\"", pl: "\"Najlepsze prace powstają, gdy cała rodzina jest w warsztacie.\"", uk: "\"Найкращі роботи народжуються, коли вся сім'я в майстерні.\"" },
  "story.default.quote": { en: "\"Made in Daugavpils with love, meant to become part of your home.\"", lv: "\"Radīts Daugavpilī ar mīlestību, lemts kļūt par jūsu māju daļu.\"", ru: "\"Сделано в Даугавпилсе с любовью, предназначено стать частью вашего дома.\"", pl: "\"Zrobione w Daugavpils z miłością, by stać się częścią Twojego domu.\"", uk: "\"Зроблено в Даугавпілсі з любов'ю, щоб стати частиною вашого дому.\"" },
  
  "material.precision": { en: "Our Materials", lv: "Mūsu materiāli", ru: "Наши материалы", pl: "Nasze Materiały", uk: "Наші Матеріали" },
  "material.microscopic": { en: "Quality You Can Feel.", lv: "Kvalitāte, ko var sajust.", ru: "Качество, которое можно почувствовать.", pl: "Jakość, którą czuć.", uk: "Якість, яку можна відчути." },
  "material.desc": { en: "We work with concrete, gypsum, mineral acrylics, and natural resins—each chosen for durability, texture, and how it ages gracefully. Our architectural concrete withstands Baltic winters. Our gypsum takes paint beautifully. Our mineral finishes last for decades.", lv: "Mēs strādājam ar betonu, ģipsi, minerālajām akrila krāsām un dabīgiem sveķiem—katrs izvēlēts izturībai, tekstūrai un tam, kā tas graciozi noveco. Mūsu arhitektūras betons iztur Baltijas ziemas. Mūsu ģipsis skaisti pieņem krāsu. Mūsu minerālie apdari kalpo gadu desmitiem.", ru: "Мы работаем с бетоном, гипсом, минеральным акрилом и натуральными смолами—каждый выбран за долговечность, текстуру и то, как красиво он стареет. Наш архитектурный бетон выдерживает балтийские зимы. Наш гипс прекрасно принимает краску. Наша минеральная отделка служит десятилетиями.", pl: "Pracujemy z betonem, gipsem, mineralnymi akrylami i naturalnymi żywicami. Nasz beton architektoniczny wytrzymuje bałtyckie zimy. Gips pięknie przyjmuje farbę.", uk: "Ми працюємо з бетоном, гіпсом, мінеральним акрилом і натуральними смолами. Наш архітектурний бетон витримує балтійські зими. Гіпс чудово приймає фарбу." },
  "material.layer": { en: "Hand-Applied Layers", lv: "Ar rokām uzklāti slāņi", ru: "Нанесено вручную", pl: "Nakładane Ręcznie", uk: "Нанесено Вручну" },
  "material.compressive": { en: "Weather-Resistant", lv: "Laika apstākļiem izturīgs", ru: "Устойчиво к погоде", pl: "Odporne na Pogodę", uk: "Стійке до Погоди" },

  "artisan.hands": { en: "Family Hands", lv: "Ģimenes rokas", ru: "Семейные руки", pl: "Rodzinne Ręce", uk: "Сімейні Руки" },
  "artisan.soul": { en: "The Soul in Every Piece", lv: "Dvēsele katrā darbā", ru: "Душа в каждом изделии", pl: "Dusza w Każdym Dziele", uk: "Душа в Кожному Виробі" },
  "artisan.passion": { en: "Family rhythm, not factory speed.", lv: "Ģimenes ritms, ne rūpnīcas ātrums.", ru: "Семейный ритм, а не заводская скорость.", pl: "Rytm rodziny, nie fabryki.", uk: "Ритм сім'ї, а не фабрики." },
  "artisan.desc": { en: "We don't believe in mass-market speed. Trosheen.Crafts moves at a family pace—mornings mixing gypsum and pigments, afternoons painting and curing, evenings assembling with the kids nearby. Every piece breathes the comfy warmth of home.", lv: "Mēs neticam masu tirgus ātrumam. Trosheen.Crafts virzās ģimenes tempā—rītos jaucam ģipsi un pigmentus, pēcpusdienās krāsojam un žāvējam, vakaros saliekam ar bērniem tuvumā. Katrs darbs elpo māju mājīgo siltumu.", ru: "Мы не верим в скорость массового рынка. Trosheen.Crafts движется в семейном темпе—утром замешиваем гипс и пигменты, днем красим и сушим, вечером собираем с детьми рядом. Каждое изделие дышит уютным теплом дома.", pl: "Nie wierzymy w masową produkcję. Trosheen.Crafts porusza się w tempie rodziny. Każdy kawałek oddycha ciepłem domu.", uk: "Ми не віримо в масове виробництво. Trosheen.Crafts рухається в темпі сім'ї. Кожен виріб дихає теплом дому." },
  "artisan.lineage": { en: "Family Craft", lv: "Ģimenes amats", ru: "Семейное ремесло", pl: "Rodzinne Rzemiosło", uk: "Сімейне Ремесло" },
  "artisan.handcast": { en: "100% Handmade", lv: "100% roku darbs", ru: "100% ручная работа", pl: "100% Rękodzieło", uk: "100% Ручна Робота" },
  "artisan.hear_story": { en: "Meet Our Family", lv: "Iepazīsties ar mūsu ģimeni", ru: "Познакомиться с нашей семьей", pl: "Poznaj Naszą Rodzinę", uk: "Познайомтеся з Нашою Сім'єю" },

  "journal.follow": { en: "Stories from our workshop.", lv: "Stāsti no mūsu darbnīcas.", ru: "Истории из нашей мастерской.", pl: "Historie z naszego warsztatu.", uk: "Історії з нашої майстерні." },
  "journal.desc": { en: "Notes on innovation, Baltic winter frost tests, little helpers' adventures, and the quiet moments between casting gypsum and painting candles.", lv: "Piezīmes par inovācijām, Baltijas ziemas sala testiem, mazo palīgu piedzīvojumiem un klusajiem brīžiem starp ģipša liešanu un sveču krāsošanu.", ru: "Заметки об инновациях, испытаниях балтийским морозом, приключениях маленьких помощников и тихих моментах между заливкой гипса и росписью свечей.", pl: "Notatki o innowacjach, testach mrozu, przygodach małych pomocników i cichych chwilach w warsztacie.", uk: "Нотатки про інновації, випробування морозом, пригоди маленьких помічників і тихі моменти в майстерні." },

  // Admin Dashboard
  "admin.login_title": { en: "Workshop Access", lv: "Darbnīcas Pieeja", ru: "Доступ в Мастерскую", pl: "Dostęp do Warsztatu", uk: "Доступ до Майстерні" },
  "admin.login_subtitle": { en: "Enter your credentials to manage the workshop", lv: "Ievadiet savus datus, lai pārvaldītu darbnīcu", ru: "Введите данные для управления мастерской", pl: "Wprowadź dane logowania", uk: "Введіть дані для входу" },
  "admin.email": { en: "Email", lv: "E-pasts", ru: "Электронная почта", pl: "Email", uk: "Email" },
  "admin.password": { en: "Password", lv: "Parole", ru: "Пароль", pl: "Hasło", uk: "Пароль" },
  "admin.login_button": { en: "Access Workshop", lv: "Piekļūt Darbnīcai", ru: "Войти в Мастерскую", pl: "Wejdź do Warsztatu", uk: "Увійти в Майстерню" },
  "admin.logging_in": { en: "Authenticating...", lv: "Autorizējas...", ru: "Авторизация...", pl: "Logowanie...", uk: "Авторизація..." },
  "admin.login_success": { en: "Welcome back, artisan!", lv: "Laipni lūdzam atpakaļ, meistari!", ru: "С возвращением, мастер!", pl: "Witaj z powrotem, rzemieślniku!", uk: "З поверненням, майстре!" },
  "admin.login_error": { en: "Invalid email or password", lv: "Nepareizs e-pasts vai parole", ru: "Неверный email или пароль", pl: "Błędny email lub hasło", uk: "Невірний email або пароль" },
  "admin.logout": { en: "Logout", lv: "Iziet", ru: "Выйти", pl: "Wyloguj", uk: "Вийти" },
  "admin.dashboard": { en: "Dashboard", lv: "Panelis", ru: "Панель", pl: "Panel", uk: "Панель" },
  "admin.products": { en: "Artefacts", lv: "Darbi", ru: "Изделия", pl: "Dzieła", uk: "Вироби" },
  "admin.orders": { en: "Orders", lv: "Pasūtījumi", ru: "Заказы", pl: "Zamówienia", uk: "Замовлення" },
  "admin.messages": { en: "Inbox", lv: "Ziņas", ru: "Сообщения", pl: "Wiadomości", uk: "Повідомлення" },
  "admin.blog": { en: "Journal", lv: "Žurnāls", ru: "Журнал", pl: "Dziennik", uk: "Журнал" },
  "admin.view_store": { en: "View Live Store", lv: "Skatīt Veikalu", ru: "Просмотр Магазина", pl: "Zobacz Sklep", uk: "Переглянути Магазин" },
  "admin.analytics_title": { en: "Workshop Analytics", lv: "Darbnīcas Analītika", ru: "Аналитика Мастерской", pl: "Analityka Warsztatu", uk: "Аналітика Майстерні" },
  "admin.analytics_subtitle": { en: "Welcome back, artisan. Here is your workshop overview.", lv: "Laipni lūdzam atpakaļ, meistari. Šeit ir jūsu darbnīcas pārskats.", ru: "С возвращением, мастер. Вот обзор вашей мастерской.", pl: "Witaj z powrotem. Oto przegląd warsztatu.", uk: "З поверненням. Ось огляд майстерні." },
  "admin.live_artefacts": { en: "Live Artefacts", lv: "Aktīvie Darbi", ru: "Активные Изделия", pl: "Aktywne Dzieła", uk: "Активні Вироби" },
  "admin.total_orders": { en: "Total Orders", lv: "Kopējie Pasūtījumi", ru: "Всего Заказов", pl: "Suma Zamówień", uk: "Всього Замовлень" },
  "admin.new_messages": { en: "New Messages", lv: "Jaunas Ziņas", ru: "Новые Сообщения", pl: "Nowe Wiadomości", uk: "Нові Повідомлення" },
  "admin.journal_posts": { en: "Journal Posts", lv: "Žurnāla Ieraksti", ru: "Записи Журнала", pl: "Wpisy w Dzienniku", uk: "Записи в Журналі" },
  "admin.quick_actions": { en: "Quick Actions", lv: "Ātrās Darbības", ru: "Быстрые Действия", pl: "Szybkie Akcje", uk: "Швидкі Дії" },
  "admin.new_artefact": { en: "New Artefact", lv: "Jauns Darbs", ru: "Новое Изделие", pl: "Nowe Dzieło", uk: "Новий Виріб" },
  "admin.write_journal": { en: "Write Journal", lv: "Rakstīt Žurnālā", ru: "Написать в Журнал", pl: "Napisz w Dzienniku", uk: "Написати в Журнал" },
  "admin.products_title": { en: "Products", lv: "Produkti", ru: "Продукты", pl: "Produkty", uk: "Продукти" },
  "admin.products_subtitle": { en: "Add and manage your handcrafted artefacts.", lv: "Pievienojiet un pārvaldiet savus roku darbus.", ru: "Добавляйте и управляйте изделиями ручной работы.", pl: "Zarządzaj swoimi dziełami.", uk: "Керуйте своїми виробами." },
  "admin.add_artefact": { en: "Add Artefact", lv: "Pievienot Darbu", ru: "Добавить Изделие", pl: "Dodaj Dzieło", uk: "Додати Виріб" },
  "admin.item": { en: "Item", lv: "Vienums", ru: "Товар", pl: "Przedmiot", uk: "Товар" },
  "admin.category": { en: "Category", lv: "Kategorija", ru: "Категория", pl: "Kategoria", uk: "Категорія" },
  "admin.price": { en: "Price", lv: "Cena", ru: "Цена", pl: "Cena", uk: "Ціна" },
  "admin.stock": { en: "Stock", lv: "Noliktava", ru: "Наличие", pl: "Magazyn", uk: "Наявність" },
  "admin.actions": { en: "Actions", lv: "Darbības", ru: "Действия", pl: "Akcje", uk: "Дії" },
  "admin.in_stock": { en: "In Stock", lv: "Noliktavā", ru: "В наличии", pl: "W Magazynie", uk: "В Наявності" },
  "admin.out_of_stock": { en: "Out of Stock", lv: "Nav Noliktavā", ru: "Нет в наличии", pl: "Brak w Magazynie", uk: "Немає в Наявності" },
  "admin.orders_title": { en: "Order Archive", lv: "Pasūtījumu Arhīvs", ru: "Архив Заказов", pl: "Archiwum Zamówień", uk: "Архів Замовлень" },
  "admin.orders_subtitle": { en: "Monitor and process incoming artefact orders.", lv: "Uzraugiet un apstrādājiet ienākošos pasūtījumus.", ru: "Отслеживайте и обрабатывайте входящие заказы.", pl: "Monitoruj i przetwarzaj zamówienia.", uk: "Відстежуйте та обробляйте замовлення." },
  "admin.order_id": { en: "ID", lv: "ID", ru: "ID", pl: "ID", uk: "ID" },
  "admin.customer": { en: "Customer", lv: "Klients", ru: "Клиент", pl: "Klient", uk: "Клієнт" },
  "admin.artefacts": { en: "Artefacts", lv: "Darbi", ru: "Изделия", pl: "Dzieła", uk: "Вироби" },
  "admin.total": { en: "Total", lv: "Kopā", ru: "Итого", pl: "Suma", uk: "Всього" },
  "admin.status": { en: "Status", lv: "Statuss", ru: "Статус", pl: "Status", uk: "Статус" },
  "admin.no_orders": { en: "No orders yet", lv: "Vēl nav pasūtījumu", ru: "Заказов пока нет", pl: "Brak zamówień", uk: "Немає замовлень" },
  "admin.messages_title": { en: "Workshop Inbox", lv: "Darbnīcas Ziņas", ru: "Входящие Мастерской", pl: "Skrzynka Warsztatu", uk: "Вхідні Майстерні" },
  "admin.messages_subtitle": { en: "Respond to inquiries and custom commission requests.", lv: "Atbildiet uz pieprasījumiem un pasūtījumiem pēc mēra.", ru: "Отвечайте на запросы и индивидуальные заказы.", pl: "Odpowiadaj na zapytania.", uk: "Відповідайте на запити." },
  "admin.sender": { en: "Sender", lv: "Sūtītājs", ru: "Отправитель", pl: "Nadawca", uk: "Відправник" },
  "admin.subject": { en: "Subject", lv: "Tēma", ru: "Тема", pl: "Temat", uk: "Тема" },
  "admin.message": { en: "Message", lv: "Ziņa", ru: "Сообщение", pl: "Wiadomość", uk: "Повідомлення" },
  "admin.inbox_empty": { en: "Inbox Empty", lv: "Nav Ziņu", ru: "Нет Сообщений", pl: "Pusta Skrzynka", uk: "Порожня Скринька" },
  "admin.blog_title": { en: "Journal Management", lv: "Žurnāla Pārvaldība", ru: "Управление Журналом", pl: "Zarządzanie Dziennikiem", uk: "Управління Журналом" },
  "admin.blog_subtitle": { en: "Share stories from the workshop bench.", lv: "Dalieties ar stāstiem no darbnīcas.", ru: "Делитесь историями из мастерской.", pl: "Dziel się historiami z warsztatu.", uk: "Діліться історіями з майстерні." },
  "admin.write_entry": { en: "Write Entry", lv: "Rakstīt Ierakstu", ru: "Написать Запись", pl: "Napisz Wpis", uk: "Написати Запис" },
  "admin.article": { en: "Article", lv: "Raksts", ru: "Статья", pl: "Artykuł", uk: "Стаття" },
  "admin.author": { en: "Author", lv: "Autors", ru: "Автор", pl: "Autor", uk: "Автор" },
  "admin.date": { en: "Date", lv: "Datums", ru: "Дата", pl: "Data", uk: "Дата" },
  "admin.published": { en: "Published", lv: "Publicēts", ru: "Опубликовано", pl: "Opublikowano", uk: "Опубліковано" },
  "admin.draft": { en: "Draft", lv: "Melnraksts", ru: "Черновик", pl: "Szkic", uk: "Чернетка" },
  "admin.edit_artefact": { en: "Edit Artefact", lv: "Rediģēt Darbu", ru: "Редактировать Изделие", pl: "Edytuj Dzieło", uk: "Редагувати Виріб" },
  "admin.name": { en: "Name", lv: "Nosaukums", ru: "Название", pl: "Nazwa", uk: "Назва" },
  "admin.description": { en: "Description", lv: "Apraksts", ru: "Описание", pl: "Opis", uk: "Опис" },
  "admin.image": { en: "Image", lv: "Attēls", ru: "Изображение", pl: "Obraz", uk: "Зображення" },
  "admin.available_stock": { en: "Available in Stock", lv: "Pieejams Noliktavā", ru: "В наличии", pl: "Dostępne w Magazynie", uk: "В Наявності" },
  "admin.update_artefact": { en: "Update Artefact", lv: "Atjaunināt Darbu", ru: "Обновить Изделие", pl: "Aktualizuj Dzieło", uk: "Оновити Виріб" },
  "admin.create_artefact": { en: "Create Artefact", lv: "Izveidot Darbu", ru: "Создать Изделие", pl: "Utwórz Dzieło", uk: "Створити Виріб" },
  "admin.artefact_updated": { en: "Artefact updated", lv: "Darbs atjaunināts", ru: "Изделие обновлено", pl: "Dzieło zaktualizowane", uk: "Виріб оновлено" },
  "admin.artefact_added": { en: "Artefact added", lv: "Darbs pievienots", ru: "Изделие добавлено", pl: "Dzieło dodane", uk: "Виріб додано" },
  "admin.common.update": { en: "Update", lv: "Atjaunināt", ru: "Обновить", pl: "Aktualizuj", uk: "Оновити" },
  "admin.common.create": { en: "Create", lv: "Izveidot", ru: "Создать", pl: "Utwórz", uk: "Створити" },
  "admin.products.add": { en: "Add Product", lv: "Pievienot produktu", ru: "Добавить продукт", pl: "Dodaj produkt", uk: "Додати продукт" },
  "admin.products.edit": { en: "Edit Product", lv: "Rediģēt produktu", ru: "Редактировать продукт", pl: "Edytuj produkt", uk: "Редагувати продукт" },
  "admin.products.table.name": { en: "Name", lv: "Nosaukums", ru: "Название", pl: "Nazwa", uk: "Назва" },
  "admin.products.table.price": { en: "Price", lv: "Cena", ru: "Цена", pl: "Cena", uk: "Ціна" },
  "admin.products.table.category": { en: "Category", lv: "Kategorija", ru: "Категория", pl: "Kategoria", uk: "Категорія" },
  "admin.products.table.stock": { en: "Stock", lv: "Noliktava", ru: "Наличие", pl: "Stan", uk: "Запас" },
  "admin.sidebar.media": { en: "Media", lv: "Mediji", ru: "Медиа", pl: "Media", uk: "Медіа" },

  // Gallery Page
  "gallery.title": { en: "Our Gallery", lv: "Mūsu galerija", ru: "Наша галерея", pl: "Nasza Galeria", uk: "Наша Галерея" },
  "gallery.subtitle": { en: "Explore our collection of 3D models and photography showcasing unique handcrafted projects from our workshop.", lv: "Izpētiet mūsu 3D modeļu un fotogrāfiju kolekciju, kas demonstrē unikālus roku darbus no mūsu darbnīcas.", ru: "Исследуйте нашу коллекцию 3D-моделей и фотографий, демонстрирующих уникальные изделия ручной работы из нашей мастерской.", pl: "Odkryj naszą kolekcję modeli 3D i fotografii.", uk: "Відкрийте нашу колекцію 3D-моделей та фотографій." },
  "gallery.eyebrow": { en: "Workshop Gallery", lv: "Darbnīcas galerija", ru: "Галерея мастерской", pl: "Galeria Warsztatu", uk: "Галерея Майстерні" },
  "gallery.all": { en: "All", lv: "Visi", ru: "Все", pl: "Wszystkie", uk: "Всі" },
  "gallery.3d_models": { en: "3D Models", lv: "3D modeļi", ru: "3D модели", pl: "Modele 3D", uk: "3D Моделі" },
  "gallery.photos": { en: "Photos", lv: "Fotogrāfijas", ru: "Фотографии", pl: "Zdjęcia", uk: "Фотографії" },
  "gallery.search_placeholder": { en: "Search gallery...", lv: "Meklēt galerijā...", ru: "Поиск в галерее...", pl: "Szukaj w galerii...", uk: "Пошук у галереї..." },
  "gallery.all_categories": { en: "All Categories", lv: "Visas kategorijas", ru: "Все категории", pl: "Wszystkie Kategorie", uk: "Всі Категорії" },
  "gallery.no_items": { en: "No Items Found", lv: "Nekas nav atrasts", ru: "Ничего не найдено", pl: "Nic nie znaleziono", uk: "Нічого не знайдено" },
  "gallery.try_different_filter": { en: "Try adjusting your filters or search terms.", lv: "Mēģiniet mainīt filtrus vai meklēšanas vaicājumu.", ru: "Попробуйте изменить фильтры или поисковый запрос.", pl: "Spróbuj zmienić filtry.", uk: "Спробуйте змінити фільтри." },
  "gallery.3d_model": { en: "3D Model", lv: "3D modelis", ru: "3D модель", pl: "Model 3D", uk: "3D Модель" },
  "gallery.photograph": { en: "Photograph", lv: "Fotogrāfija", ru: "Фотография", pl: "Fotografia", uk: "Фотографія" },
  "gallery.back_to_gallery": { en: "Back to Gallery", lv: "Atpakaļ uz galeriju", ru: "Назад в галерею", pl: "Powrót do Galerii", uk: "Назад до Галереї" },
  "gallery.details": { en: "Details", lv: "Detaļas", ru: "Детали", pl: "Szczegóły", uk: "Деталі" },
  "gallery.year": { en: "Year", lv: "Gads", ru: "Год", pl: "Rok", uk: "Рік" },
  "gallery.materials": { en: "Materials", lv: "Materiāli", ru: "Материалы", pl: "Materiały", uk: "Матеріали" },
  "gallery.dimensions": { en: "Dimensions", lv: "Izmēri", ru: "Размеры", pl: "Wymiary", uk: "Розміри" },
  "gallery.location": { en: "Location", lv: "Vieta", ru: "Место", pl: "Lokalizacja", uk: "Місцезнаходження" },
  "gallery.like_this": { en: "Like This", lv: "Patīk", ru: "Нравится", pl: "Lubię to", uk: "Подобається" },
  "gallery.share": { en: "Share", lv: "Dalīties", ru: "Поделиться", pl: "Udostępnij", uk: "Поділитися" },
  "gallery.liked": { en: "Liked!", lv: "Patīk!", ru: "Понравилось!", pl: "Polubione!", uk: "Сподобалось!" },
  "gallery.liked_desc": { en: "Thank you for your appreciation!", lv: "Paldies par jūsu novērtējumu!", ru: "Спасибо за вашу оценку!", pl: "Dziękujemy za uznanie!", uk: "Дякуємо за вашу оцінку!" },
  "gallery.link_copied": { en: "Link Copied", lv: "Saite nokopēta", ru: "Ссылка скопирована", pl: "Link skopiowany", uk: "Посилання скопійовано" },
  "gallery.link_copied_desc": { en: "Gallery link has been copied to clipboard.", lv: "Galerijas saite ir nokopēta starpliktuvē.", ru: "Ссылка на galeriju скопирована в буфер обмена.", pl: "Link do galerii skopiowany do schowka.", uk: "Посилання на галерею скопійовано в буфер обміну." },
  "gallery.item_not_found": { en: "Item Not Found", lv: "Vienums nav atrasts", ru: "Элемент не найден", pl: "Element nie znaleziony", uk: "Елемент не знайдено" },
  "gallery.item_not_found_desc": { en: "This gallery item may have been removed or is no longer available.", lv: "Šis galerijas vienums, iespējams, ir noņemts vai vairs nav pieejams.", ru: "Этот элемент галереи мог быть удален или больше недоступен.", pl: "Ten element galerii mógł zostać usunięty.", uk: "Цей елемент галереї міг бути видалений." },
  "gallery.cta_title": { en: "Love This Piece?", lv: "Patīk šis darbs?", ru: "Понравилось это изделие?", pl: "Podoba Ci się to dzieło?", uk: "Подобається цей виріб?" },
  "gallery.cta_desc": { en: "Get in touch to discuss custom projects or commissions.", lv: "Sazinieties, lai apspriestu pielāgotus projektus.", ru: "Свяжитесь, чтобы обсудить индивидуальные проекты.", pl: "Skontaktuj się, aby omówić zamówienia indywidualne.", uk: "Зв'яжіться, щоб обговорити індивідуальні замовлення." },

  // Admin Gallery
  "admin.gallery.title": { en: "Gallery Management", lv: "Galerijas pārvaldība", ru: "Управление галереей", pl: "Zarządzanie Galerią", uk: "Управління Галереєю" },
  "admin.gallery.subtitle": { en: "Manage your 3D models and photo gallery with full control.", lv: "Pārvaldiet savus 3D modeļus un fotogrāfiju galeriju ar pilnu kontroli.", ru: "Управляйте вашими 3D-моделями и фотогалереей с полным контролем.", pl: "Zarządzaj modelami 3D i zdjęciami.", uk: "Керуйте 3D-моделями та фотографіями." },
  "admin.gallery.items": { en: "Gallery Items", lv: "Galerijas vienumi", ru: "Элементы галереи", pl: "Elementy Galerii", uk: "Елементи Галереї" },
  "admin.gallery.categories": { en: "Categories", lv: "Kategorijas", ru: "Категории", pl: "Kategorie", uk: "Категорії" },
  "admin.gallery.add_category": { en: "Add Category", lv: "Pievienot kategoriju", ru: "Добавить категорию", pl: "Dodaj Kategorię", uk: "Додати Категорію" },
  "admin.gallery.edit_category": { en: "Edit Category", lv: "Rediģēt kategoriju", ru: "Редактировать категорию", pl: "Edytuj Kategorię", uk: "Редагувати Категорію" },
  "admin.gallery.add_item": { en: "Add Item", lv: "Pievienot vienumu", ru: "Добавить элемент", pl: "Dodaj Element", uk: "Додати Елемент" },
  "admin.gallery.edit_item": { en: "Edit Item", lv: "Rediģēt vienumu", ru: "Редактировать элемент", pl: "Edytuj Element", uk: "Редагувати Елемент" },
  "admin.gallery.slug": { en: "Slug", lv: "Slug", ru: "Slug", pl: "Slug", uk: "Слаг" },
  "admin.gallery.preview": { en: "Preview", lv: "Priekšskatījums", ru: "Превью", pl: "Podgląd", uk: "Попередній перегляд" },
  "admin.gallery.stats": { en: "Stats", lv: "Statistika", ru: "Статистика", pl: "Statystyki", uk: "Статистика" },
  "admin.gallery.media_url": { en: "Media URL", lv: "Mediju URL", ru: "URL медиа", pl: "URL Mediów", uk: "URL Медіа" },
  "admin.gallery.thumbnail_url": { en: "Thumbnail URL", lv: "Sīktēla URL", ru: "URL миниатюры", pl: "URL Miniatury", uk: "URL Мініатюри" },
  "admin.gallery.tags": { en: "Tags", lv: "Tagi", ru: "Теги", pl: "Tagi", uk: "Теги" },
  "admin.gallery.add_tag": { en: "Add tag...", lv: "Pievienot tagu...", ru: "Добавить тег...", pl: "Dodaj tag...", uk: "Додати тег..." },
  "admin.gallery.featured": { en: "Featured", lv: "Izcelts", ru: "Избранное", pl: "Wyróżnione", uk: "Вибране" },
  "admin.gallery.published": { en: "Published", lv: "Publicēts", ru: "Опубликовано", pl: "Opublikowane", uk: "Опубліковано" },
  "admin.gallery.no_category": { en: "No Category", lv: "Nav kategorijas", ru: "Без категории", pl: "Bez Kategorii", uk: "Без Категорії" },
  "admin.gallery.3d_url_hint": { en: "URL to GLB/GLTF 3D model file", lv: "URL uz GLB/GLTF 3D modeļa failu", ru: "URL к файлу 3D-модели GLB/GLTF", pl: "URL do pliku modelu GLB/GLTF", uk: "URL до файлу моделі GLB/GLTF" },
  "admin.gallery.photo_url_hint": { en: "URL to high-resolution image", lv: "URL uz augstas izšķirtspējas attēlu", ru: "URL к изображению высокого разрешения", pl: "URL do zdjęcia w wysokiej rozdzielczości", uk: "URL до зображення високої роздільної здатності" },
  "admin.category_created": { en: "Category created successfully", lv: "Kategorija veiksmīgi izveidota", ru: "Категория успешно создана", pl: "Kategoria utworzona pomyślnie", uk: "Категорія успішно створена" },
  "admin.category_updated": { en: "Category updated successfully", lv: "Kategorija veiksmīgi atjaunināta", ru: "Категория успешно обновлена", pl: "Kategoria zaktualizowana pomyślnie", uk: "Категорія успішно оновлена" },
  "admin.category_deleted": { en: "Category deleted successfully", lv: "Kategorija veiksmīgi dzēsta", ru: "Категория успешно удалена", pl: "Kategoria usunięta pomyślnie", uk: "Категорія успішно видалена" },
  "admin.gallery.item_created": { en: "Gallery item created", lv: "Galerijas vienums izveidots", ru: "Элемент галереи создан", pl: "Element galerii utworzony", uk: "Елемент галереї створено" },
  "admin.gallery.item_updated": { en: "Gallery item updated", lv: "Galerijas vienums atjaunināts", ru: "Элемент галереи обновлен", pl: "Element galerii zaktualizowany", uk: "Елемент галереї оновлено" },
  "admin.gallery.item_deleted": { en: "Gallery item deleted", lv: "Galerijas vienums dzēsts", ru: "Элемент галереи удален", pl: "Element galerii usunięty", uk: "Елемент галереї видалено" },
  "admin.sidebar.gallery": { en: "Gallery", lv: "Galerija", ru: "Галерея", pl: "Galeria", uk: "Галерея" },
  "admin.category.type": { en: "Type", lv: "Tips", ru: "Тип", pl: "Typ", uk: "Тип" },
  "admin.category.featured": { en: "Featured", lv: "Izcelts", ru: "Избранное", pl: "Wyróżnione", uk: "Вибране" },
  "admin.category.sort_order": { en: "Sort Order", lv: "Kārtošanas secība", ru: "Порядок сортировки", pl: "Kolejność", uk: "Порядок сортування" },
  "common.add": { en: "Add", lv: "Pievienot", ru: "Добавить", pl: "Dodaj", uk: "Додати" },

  // Shop Page
  "shop.title": { en: "Pieces that Live Forever", lv: "Darbi, kas Dzīvo Mūžīgi", ru: "Работы, которые Живут Вечно", pl: "Dzieła, Które Żyją Wiecznie", uk: "Роботи, Які Живуть Вічно" },
  "shop.subtitle": { en: "Every piece is sculpted, cast, or painted by hand in our family workshop. Discover timeless concrete art from the heart of Latvia.", lv: "Katrs darbs ir veidots, liets vai krāsots ar rokām mūsu ģimenes darbnīcā. Atklājiet mūžīgu betona mākslu no Latvijas sirds.", ru: "Каждое изделие вылеплено, отлито или расписано вручную в нашей семейной мастерской. Откройте для себя вечное бетонное искусство из сердца Латвии.", pl: "Każdy kawałek jest rzeźbiony, odlewany lub malowany ręcznie w naszym rodzinnym warsztacie. Odkryj ponadczasową sztukę betonu z serca Łotwy.", uk: "Кожен виріб виліплений, відлитий або розписаний вручну в нашій сімейній майстерні. Відкрийте для себе вічне бетонне мистецтво з серця Латвії." },
  "shop.all_crafts": { en: "All Crafts", lv: "Visi darbi", ru: "Все работы", pl: "Wszystkie Dzieła", uk: "Всі Роботи" },
  "shop.candles": { en: "Candles", lv: "Sveces", ru: "Свечи", pl: "Świece", uk: "Свічки" },
  "shop.garden": { en: "Garden", lv: "Dārzs", ru: "Для сада", pl: "Ogród", uk: "Сад" },
  "shop.decor": { en: "Decor", lv: "Dekors", ru: "Декор", pl: "Dekoracje", uk: "Декор" },
  "shop.collections": { en: "Collections", lv: "Kolekcijas", ru: "Коллекции", pl: "Kolekcje", uk: "Колекції" },
  "shop.search": { en: "Find a piece...", lv: "Atrast darbu...", ru: "Найти работу...", pl: "Znajdź dzieło...", uk: "Знайти роботу..." },
  "shop.add_to_cart": { en: "Add to Cart", lv: "Pievienot Grozam", ru: "В Корзину", pl: "Dodaj do Koszyka", uk: "У Кошик" },
  "shop.no_items": { en: "No items found", lv: "Nav atrasts neviens darbs", ru: "Ничего не найдено", pl: "Nie znaleziono przedmiotów", uk: "Нічого не знайдено" },
  "shop.try_adjusting": { en: "Try adjusting your search or category filters.", lv: "Mēģiniet mainīt meklēšanas vai kategoriju filtrus.", ru: "Попробуйте изменить поиск или фильтры категорий.", pl: "Spróbuj zmienić filtry.", uk: "Спробуйте змінити фільтри." },
  "shop.sustainable_shipping": { en: "Sustainable Shipping", lv: "Ilgtspējīga Piegāde", ru: "Экологичная Доставка", pl: "Zrównoważona Dostawa", uk: "Екологічна Доставка" },
  "shop.shipping_desc": { en: "Each piece is carefully packed by our family in Daugavpils. We use minimal plastic and favor recycled materials to ensure your concrete heirloom arrives safely and ethically.", lv: "Katrs darbs ir rūpīgi iepakots mūsu ģimenes Daugavpilī. Mēs izmantojam minimālu plastmasu un dodam priekšroku pārstrādātiem materiāliem.", ru: "Каждое изделие тщательно упаковывается нашей семьей в Даугавпилсе. Мы используем минимум пластика и предпочитаем переработанные материалы.", pl: "Każdy kawałek jest starannie pakowany przez naszą rodzinę w Daugavpils.", uk: "Кожен виріб ретельно упаковується нашою сім'єю в Даугавпілсі." },
  "shop.items": { en: "items", lv: "vienumi", ru: "товаров", pl: "przedmiotów", uk: "товарів" },
  "shop.cart_summary": { en: "items in cart", lv: "preces grozā", ru: "товаров в корзине", pl: "w koszyku", uk: "у кошику" },

  // Blog Page
  "blog.title": { en: "Stories from the Bench", lv: "Stāsti no Darbnīcas", ru: "Истории из Мастерской", pl: "Historie z Warsztatu", uk: "Історії з Майстерні" },
  "blog.subtitle": { en: "Dive deep into our process, materials, and the philosophy behind our artefacts.", lv: "Iedziļinieties mūsu procesā, materiālos un filozofijā, kas slēpjas aiz mūsu darbiem.", ru: "Погрузитесь в наш процесс, материалы и философию наших изделий.", pl: "Zanurz się w naszym procesie i filozofii.", uk: "Пориньте в наш процес і філософію." },
  "blog.search": { en: "Search stories...", lv: "Meklēt stāstus...", ru: "Искать истории...", pl: "Szukaj historii...", uk: "Шукати історії..." },
  "blog.read_entry": { en: "Read Entry", lv: "Lasīt Ierakstu", ru: "Читать Запись", pl: "Czytaj Wpis", uk: "Читати Запис" },

  // Contact Page
  "contact.title": { en: "Get in Touch", lv: "Sazinieties ar Mums", ru: "Свяжитесь с Нами", pl: "Skontaktuj się", uk: "Зв'яжіться з Нами" },
  "contact.subtitle": { en: "Have questions about a piece, or want to commission something unique? We'd love to hear from you.", lv: "Vai ir jautājumi par darbu vai vēlaties pasūtīt kaut ko unikālu? Mēs labprāt dzirdēsim no jums.", ru: "Есть вопросы о работе или хотите заказать что-то уникальное? Мы будем рады услышать вас.", pl: "Masz pytania? Chętnie odpowiemy.", uk: "Є запитання? Ми будемо раді почути вас." },
  "contact.name": { en: "Your Name", lv: "Jūsu Vārds", ru: "Ваше Имя", pl: "Twoje Imię", uk: "Ваше Ім'я" },
  "contact.email": { en: "Email Address", lv: "E-pasta Adrese", ru: "Email Адрес", pl: "Adres Email", uk: "Email Адреса" },
  "contact.subject": { en: "Subject", lv: "Tēma", ru: "Тема", pl: "Temat", uk: "Тема" },
  "contact.message": { en: "Your Message", lv: "Jūsu Ziņa", ru: "Ваше Сообщение", pl: "Twoja Wiadomość", uk: "Ваше Повідомлення" },
  "contact.send": { en: "Send Message", lv: "Nosūtīt Ziņu", ru: "Отправить Сообщение", pl: "Wyślij Wiadomość", uk: "Надіслати Повідомлення" },
  "contact.sending": { en: "Sending...", lv: "Nosūta...", ru: "Отправка...", pl: "Wysyłanie...", uk: "Відправлення..." },
  "contact.let_start": { en: "Let's Start a", lv: "Sāksim", ru: "Давайте начнем", pl: "Zacznijmy", uk: "Почнемо" },
  "contact.conversation": { en: "Conversation", lv: "sarunu", ru: "разговор", pl: "rozmowę", uk: "розмову" },
  "contact.desc": { en: "Whether you're curious about a specific technique or want to commission a unique piece for your garden, we're here to help.", lv: "Neatkarīgi no tā, vai jūs interesē kāda konkrēta tehnika vai vēlaties pasūtīt unikālu darbu savam dārzam, mēs esam šeit, lai palīdzētu.", ru: "Если вам интересна конкретная техника или вы хотите заказать уникальное изделие для своего сада, мы здесь, чтобы помочь.", pl: "Jesteśmy tu, aby pomóc w każdym pytaniu.", uk: "Ми тут, щоб допомогти з будь-яким питанням." },
  "contact.form_success_title": { en: "Thank You!", lv: "Paldies!", ru: "Спасибо!", pl: "Dziękujemy!", uk: "Дякуємо!" },
  "contact.form_success_desc": { en: "Your message has been received. We will get back to you shortly.", lv: "Jūsu ziņa ir saņemta. Mēs drīzumā ar jums sazināsimies.", ru: "Ваше сообщение получено. Мы скоро свяжемся с вами.", pl: "Twoja wiadomość została odebrana.", uk: "Ваше повідомлення отримано." },
  "contact.form.name_placeholder": { en: "John Doe", lv: "Jānis Bērziņš", ru: "Иван Иванов", pl: "Jan Kowalski", uk: "Іван Іванов" },
  "contact.form.email_placeholder": { en: "john@example.com", lv: "janis@piemers.lv", ru: "ivan@example.com", pl: "jan@przyklad.pl", uk: "ivan@example.com" },
  "contact.form.subject_placeholder": { en: "How can we help?", lv: "Kā mēs varam palīdzēt?", ru: "Чем мы можем помочь?", pl: "W czym możemy pomóc?", uk: "Чим ми можемо допомогти?" },
  "contact.form.message_placeholder": { en: "Tell us about your project or inquiry...", lv: "Pastāstiet mums par savu projektu vai jautājumu...", ru: "Расскажите нам о вашем проекте или вопросе...", pl: "Opisz swój projekt...", uk: "Розкажіть про свій проект..." },
  "contact.phone": { en: "Phone", lv: "Tālrunis", ru: "Телефон", pl: "Telefon", uk: "Телефон" },
  "contact.location": { en: "Location", lv: "Atrašanās vieta", ru: "Местоположение", pl: "Lokalizacja", uk: "Місцезнаходження" },

  // Cart
  "cart.title": { en: "Your Cart", lv: "Jūsu Grozs", ru: "Ваша Корзина", pl: "Twój Koszyk", uk: "Ваш Кошик" },
  "cart.empty": { en: "Your cart is empty", lv: "Jūsu grozs ir tukšs", ru: "Ваша корзина пуста", pl: "Twój koszyk jest pusty", uk: "Ваш кошик порожній" },
  "cart.subtotal": { en: "Subtotal", lv: "Starpsumma", ru: "Подытог", pl: "Suma częściowa", uk: "Підсумок" },
  "cart.checkout": { en: "Proceed to Checkout", lv: "Turpināt uz Apmaksu", ru: "Перейти к Оплате", pl: "Przejdź do Płatności", uk: "Перейти до Оплати" },
  "cart.continue_shopping": { en: "Continue Shopping", lv: "Turpināt Iepirkties", ru: "Продолжить Покупки", pl: "Kontynuuj Zakupy", uk: "Продовжити Покупки" },
  "cart.empty_title": { en: "Your basket is empty", lv: "Jūsu grozs ir tukšs", ru: "Ваша корзина пуста", pl: "Twój koszyk jest pusty", uk: "Ваш кошик порожній" },
  "cart.empty_desc": { en: "Looks like you haven't discovered your next concrete artefact yet.", lv: "Izskatās, ka vēl neesat atradis savu nākamo betona mākslas darbu.", ru: "Похоже, вы еще не нашли свое следующее бетонное изделие.", pl: "Wygląda na to, że jeszcze nic nie wybrałeś.", uk: "Схоже, ви ще нічого не вибрали." },
  "cart.start_exploring": { en: "Start Exploring", lv: "Sākt meklēšanu", ru: "Начать поиск", pl: "Zacznij Odkrywać", uk: "Почати Досліджувати" },
  "cart.your": { en: "Your", lv: "Jūsu", ru: "Ваша", pl: "Twój", uk: "Ваш" },
  "cart.basket": { en: "Basket", lv: "Grozs", ru: "Корзина", pl: "Koszyk", uk: "Кошик" },
  "cart.summary": { en: "Summary", lv: "Kopsavilkums", ru: "Итог", pl: "Podsumowanie", uk: "Підсумок" },
  "cart.delivery": { en: "Delivery", lv: "Piegāde", ru: "Доставка", pl: "Dostawa", uk: "Доставка" },
  "cart.free": { en: "Free", lv: "Bezmaksas", ru: "Бесплатно", pl: "Darmowa", uk: "Безкоштовно" },
  "cart.total": { en: "Total", lv: "Kopā", ru: "Всего", pl: "Razem", uk: "Всього" },

  // Product Detail
  "product.back_to_shop": { en: "Back to Shop", lv: "Atpakaļ uz Veikalu", ru: "Назад в Магазин", pl: "Wróć do Sklepu", uk: "Назад в Магазин" },
  "product.in_stock": { en: "In Stock", lv: "Noliktavā", ru: "В наличии", pl: "Dostępne", uk: "В наявності" },
  "product.out_of_stock": { en: "Out of Stock", lv: "Nav Noliktavā", ru: "Нет в наличии", pl: "Niedostępne", uk: "Немає в наявності" },
  "product.add_to_cart": { en: "Add to Cart", lv: "Pievienot Grozam", ru: "В Корзину", pl: "Dodaj do Koszyka", uk: "У Кошик" },
  "product.details": { en: "Product Details", lv: "Produkta Detaļas", ru: "Детали Продукта", pl: "Szczegóły Produktu", uk: "Деталі Продукту" },
  "product.handcrafted_note": { en: "Handcrafted with care. Each piece is unique and may have slight variations that reflect its artisanal nature.", lv: "Ar mīlestību roku darbs. Katrs darbs ir unikāls un var būt nelielas variācijas, kas atspoguļo tā amatniecisko raksturu.", ru: "Изготовлено с любовью вручную. Каждое изделие уникально и может иметь небольшие вариации, отражающие его ремесленный характер.", pl: "Ręcznie wykonane z dbałością. Każdy egzemplarz jest unikalny.", uk: "Зроблено вручну з турботою. Кожен виріб унікальний." },
  "product.not_found": { en: "Product not found", lv: "Produkts nav atrasts", ru: "Продукт не найден", pl: "Produkt nie znaleziony", uk: "Продукт не знайдено" },
  "product.not_found_desc": { en: "This piece may have found a new home or been moved to a different collection.", lv: "Šis darbs, iespējams, ir atradis jaunas mājas vai pārvietots uz citu kolekciju.", ru: "Это изделие, возможно, нашло новый дом или перемещено в другую коллекцию.", pl: "Ten przedmiot mógł znaleźć nowy dom.", uk: "Цей виріб міг знайти новий дім." },
  "product.added_to_cart": { en: "Added to cart!", lv: "Pievienots grozam!", ru: "Добавлено в корзину!", pl: "Dodano do koszyka!", uk: "Додано в кошик!" },

  // Order Tracking
  "order.track_title": { en: "Track Your Order", lv: "Izsekot Pasūtījumu", ru: "Отследить Заказ", pl: "Śledź Zamówienie", uk: "Відстежити Замовлення" },
  "order.not_found": { en: "Order not found", lv: "Pasūtījums nav atrasts", ru: "Заказ не найден", pl: "Nie znaleziono zamówienia", uk: "Замовлення не знайдено" },
  "order.not_found_desc": { en: "Please check your order number and try again.", lv: "Lūdzu, pārbaudiet pasūtījuma numuru un mēģiniet vēlreiz.", ru: "Пожалуйста, проверьте номер заказа и попробуйте снова.", pl: "Sprawdź numer zamówienia.", uk: "Перевірте номер замовлення." },
  "order.number": { en: "Order Number", lv: "Pasūtījuma Numurs", ru: "Номер Заказа", pl: "Numer Zamówienia", uk: "Номер Замовлення" },
  "order.date": { en: "Order Date", lv: "Pasūtījuma Datums", ru: "Дата Заказа", pl: "Data Zamówienia", uk: "Дата Замовлення" },
  "order.status": { en: "Order Status", lv: "Pasūtījuma Statuss", ru: "Статус Заказа", pl: "Status Zamówienia", uk: "Статус Замовлення" },
  "order.current_status": { en: "Current Status", lv: "Pašreizējais Statuss", ru: "Текущий Статус", pl: "Obecny Status", uk: "Поточний Статус" },
  "order.tracking_number": { en: "Tracking Number", lv: "Izsekošanas Numurs", ru: "Номер Отслеживания", pl: "Numer Śledzenia", uk: "Номер Відстеження" },
  "order.items": { en: "Order Items", lv: "Pasūtījuma Preces", ru: "Товары в Заказе", pl: "Przedmioty w Zamówieniu", uk: "Товари в Замовленні" },
  "order.qty": { en: "Quantity", lv: "Daudzums", ru: "Количество", pl: "Ilość", uk: "Кількість" },
  "order.shipping_address": { en: "Shipping Address", lv: "Piegādes Adrese", ru: "Адрес Доставки", pl: "Adres Dostawy", uk: "Адреса Доставки" },

  // Blog
  "blog.back_to_story": { en: "Back to story", lv: "Atpakaļ pie stāsta", ru: "Назад к истории", pl: "Powrót do historii", uk: "Назад до історії" },
  "blog.webshop": { en: "Webshop", lv: "Veikals", ru: "Магазин", pl: "Sklep", uk: "Магазин" },
  "blog.journal_title": { en: "The Workshop Journal", lv: "Darbnīcas žurnāls", ru: "Журнал мастерской", pl: "Dziennik Warsztatu", uk: "Журнал Майстерні" },
  "blog.notes_from": { en: "Notes from", lv: "Piezīmes no", ru: "Заметки из", pl: "Notatki z", uk: "Нотатки з" },
  "blog.location": { en: "Daugavpils", lv: "Daugavpils", ru: "Даугавпилса", pl: "Daugavpils", uk: "Даугавпілса" },
  "blog.intro_text": { en: "A deeper exploration of the techniques, stories, and people behind Trosheen.Crafts. From material science breakthroughs to the simple joy of a family workshop.", lv: "Dziļāka Trosheen.Crafts tehniku, stāstu un cilvēku izpēte. No materiālzinātnes sasniegumiem līdz vienkāršam ģimenes darbnīcas priekam.", ru: "Более глубокое изучение техник, историй и людей, стоящих за Trosheen.Crafts. От прорывов в материаловедении до простой радости семейной мастерской.", pl: "Głębsze spojrzenie na techniki i ludzi stojących za Trosheen.Crafts.", uk: "Глибший погляд на техніки та людей, що стоять за Trosheen.Crafts." },
  "blog.loading": { en: "Loading blog post...", lv: "Ielādē rakstu...", ru: "Загрузка записи...", pl: "Ładowanie wpisu...", uk: "Завантаження запису..." },
  "blog.post_not_found": { en: "Post not found.", lv: "Raksts nav atrasts.", ru: "Запись не найдена.", pl: "Nie znaleziono wpisu.", uk: "Запис не знайдено." },
  "blog.back_to_blog": { en: "Back to blog", lv: "Atpakaļ uz žurnālu", ru: "Назад в журнал", pl: "Powrót do bloga", uk: "Назад до блогу" },
  "blog.browse": { en: "Browse", lv: "Apskatīt", ru: "Смотреть", pl: "Przeglądaj", uk: "Переглядати" },

  // About Page
  "about.back_home": { en: "Back Home", lv: "Atpakaļ uz sākumu", ru: "На главную", pl: "Powrót", uk: "На головну" },
  "about.our_family_story": { en: "Our Family Story", lv: "Mūsu ģimenes stāsts", ru: "Наша семейная история", pl: "Nasza Rodzinna Historia", uk: "Наша Сімейна Історія" },
  "about.three_generations": { en: "Three Generations,", lv: "Trīs paaudzes,", ru: "Три поколения,", pl: "Trzy Pokolenia,", uk: "Три Покоління," },
  "about.one_workshop": { en: "One Workshop", lv: "viena darbnīca", ru: "одна мастерская", pl: "Jeden Warsztat", uk: "Одна Майстерня" },
  "about.years": { en: "Years", lv: "Gadi", ru: "Лет", pl: "Lat", uk: "Років" },
  "about.visit_title": { en: "Come Visit", lv: "Nāciet ciemos", ru: "Приходите в гости", pl: "Odwiedź Nas", uk: "Завітайте до Нас" },
  "about.visit_desc": { en: "We'd love to show you around! See where the magic happens, meet the family, and maybe even get your hands dirty.", lv: "Mēs labprāt jums visu izrādītu! Redziet, kur notiek burvība, iepazīstiet ģimeni un varbūt pat sasmērējiet rokas.", ru: "Мы будем рады показать вам нашу мастерскую! Посмотрите, где происходит волшебство, познакомьтесь с семьей и, возможно, даже немного испачкайте руки.", pl: "Chętnie Cię oprowadzimy! Zobacz, gdzie dzieje się magia.", uk: "Ми будемо раді показати вам все! Подивіться, де відбувається магія." },
  "about.browse_work": { en: "Browse Our Work", lv: "Skatīt mūsu darbus", ru: "Наши работы", pl: "Zobacz Nasze Prace", uk: "Дивіться Наші Роботи" },
  "about.materials.concrete.name": { en: "Concrete", lv: "Betons", ru: "Бетон", pl: "Beton", uk: "Бетон" },
  "about.materials.concrete.desc": { en: "Architectural grade, frost-resistant, built to weather Baltic winters", lv: "Arhitektūras klases, sala izturīgs, radīts Baltijas ziemām", ru: "Архитектурный класс, морозостойкий, создан для балтийских зим", pl: "Klasa architektoniczna, mrozoodporny.", uk: "Архітектурний клас, морозостійкий." },
  "about.materials.gypsum.name": { en: "Gypsum", lv: "Ģipsis", ru: "Гипс", pl: "Gips", uk: "Гіпс" },
  "about.materials.gypsum.desc": { en: "Quick-setting, paintable, perfect for detailed decorative pieces", lv: "Ātri cietējošs, krāsojams, lieliski piemērots detaļām", ru: "Быстросхватывающийся, под покраску, идеален для декора", pl: "Szybkowiążący, idealny do detali.", uk: "Швидкотужавіючий, ідеальний для деталей." },
  "about.materials.acrylics.name": { en: "Mineral Acrylics", lv: "Minerālās akrila krāsas", ru: "Минеральный акрил", pl: "Akryle Mineralne", uk: "Мінеральний Акрил" },
  "about.materials.acrylics.desc": { en: "Lightfast pigments that won't fade, even in direct sunlight", lv: "Gaismas izturīgi pigmenti, kas neizbalē saulē", ru: "Светостойкие пигменты, которые не выцветают на солнце", pl: "Pigmenty odporne na światło.", uk: "Світлостійкі пігменти." },
  "about.materials.resins.name": { en: "Natural Resins", lv: "Dabīgie sveķi", ru: "Натуральные смолы", pl: "Naturalne Żywice", uk: "Натуральні Смоли" },
  "about.materials.resins.desc": { en: "Eco-friendly sealers derived from local botanical oils", lv: "Videi draudzīgi pārklājumi no vietējām eļļām", ru: "Эко-герметики из местных растительных масел", pl: "Ekologiczne uszczelniacze.", uk: "Екологічні герметики." },

  // Common UI
  "common.menu": { en: "Menu", lv: "Izvēlne", ru: "Меню", pl: "Menu", uk: "Меню" },
  "common.privacy": { en: "Privacy", lv: "Privātums", ru: "Конфиденциальность", pl: "Prywatność", uk: "Конфіденційність" },
  "common.terms": { en: "Terms", lv: "Noteikumi", ru: "Условия", pl: "Warunki", uk: "Умови" },
  "common.cookies": { en: "Cookies", lv: "Sīkdatnes", ru: "Куки", pl: "Pliki cookie", uk: "Куки" },
  "common.studio": { en: "Studio", lv: "Studija", ru: "Студия", pl: "Studio", uk: "Студія" },
  "common.loading": { en: "Loading...", lv: "Ielādē...", ru: "Загрузка...", pl: "Ładowanie...", uk: "Завантаження..." },
  "common.error": { en: "Something went wrong", lv: "Kaut kas nogāja greizi", ru: "Что-то пошло не так", pl: "Coś poszło nie tak", uk: "Щось пішло не так" },
  "common.try_again": { en: "Try Again", lv: "Mēģināt Vēlreiz", ru: "Попробовать Снова", pl: "Spróbuj Ponownie", uk: "Спробуйте Знову" },
  "common.back": { en: "Back", lv: "Atpakaļ", ru: "Назад", pl: "Wstecz", uk: "Назад" },
  "common.close": { en: "Close", lv: "Aizvērt", ru: "Закрыть", pl: "Zamknij", uk: "Закрити" },
  "common.save": { en: "Save", lv: "Saglabāt", ru: "Сохранить", pl: "Zapisz", uk: "Зберегти" },
  "common.cancel": { en: "Cancel", lv: "Atcelt", ru: "Отмена", pl: "Anuluj", uk: "Скасувати" },
  "common.delete": { en: "Delete", lv: "Dzēst", ru: "Удалить", pl: "Usuń", uk: "Видалити" },
  "common.edit": { en: "Edit", lv: "Rediģēt", ru: "Редактировать", pl: "Edytuj", uk: "Редагувати" },

  // Newsletter
  "newsletter.email_placeholder": { en: 'your@email.com', lv: 'jusu@epasts.lv', ru: 'vas@email.com', pl: 'twoj@email.com', uk: 'vash@email.com' },
  "newsletter.subscribe_button": { en: 'Subscribe', lv: 'Abonēt', ru: 'Подписаться', pl: 'Subskrybuj', uk: 'Підписатися' },
  "newsletter.join_button": { en: 'Join Now', lv: 'Pievienoties', ru: 'Присоединиться', pl: 'Dołącz Teraz', uk: 'Приєднатися' },
  "newsletter.subscribed": { en: 'Subscribed!', lv: 'Abonēts!', ru: 'Подписано!', pl: 'Zasubskrybowano!', uk: 'Підписано!' },
  "newsletter.exclusive_updates": { en: 'Exclusive Updates', lv: 'Ekskluzīvi jaunumi', ru: 'Эксклюзивные новости', pl: 'Ekskluzywne aktualizacje', uk: 'Ексклюзивні новини' },
  "newsletter.hero_title": { en: 'Stay in the Loop', lv: 'Esiet informēti', ru: 'Будьте в курсе', pl: 'Bądź na bieżąco', uk: 'Будьте в курсі' },
  "newsletter.hero_subtitle": {
    en: 'Get early access to new collections, workshop stories, and exclusive family craft insights.',
    lv: 'Saņemiet agrīnu piekļuvi jaunām kolekcijām, darbnīcas stāstiem un ekskluzīviem ieskatiem.',
    ru: 'Получите ранний доступ к новым коллекциям, историям мастерской и эксклюзивным инсайтам.',
    pl: 'Uzyskaj wczesny dostęp do nowych kolekcji, historii z warsztatu i ekskluzywnych informacji.',
    uk: 'Отримайте ранній доступ до нових колекцій, історій майстерні та ексклюзивних інсайтів.'
  },
  "newsletter.privacy_note": { en: 'We respect your privacy. Unsubscribe anytime.', lv: 'Mēs cienām jūsu privātumu. Atrakstīties jebkurā laikā.', ru: 'Мы уважаем вашу конфиденциальность. Отписаться в любое время.', pl: 'Szanujemy Twoją prywatność. Możesz zrezygnować w każdej chwili.', uk: 'Ми поважаємо вашу конфіденційність. Відписатися в будь-який час.' },

  // Footer
  "footer.newsletter_title": { en: 'Newsletter', lv: 'Jaunumi', ru: 'Новости', pl: 'Newsletter', uk: 'Новини' },
  "footer.newsletter_desc": { en: 'Get updates on new collections and workshop stories', lv: 'Saņemiet jaunumus par kolekcijām un stāstiem', ru: 'Получайте новости о коллекциях и историях', pl: 'Otrzymuj aktualności o kolekcjach i historiach', uk: 'Отримуйте новини про колекції та історії' },
  "footer.rights": { en: "Trosheen.Crafts. Hand-cast in Daugavpils.", lv: "Trosheen.Crafts. Roku darbs no Daugavpils.", ru: "Trosheen.Crafts. Ручная работа из Даугавпилса.", pl: "Trosheen.Crafts. Ręcznie odlewane w Daugavpils.", uk: "Trosheen.Crafts. Ручна робота з Даугавпілса." },
  "footer_desc": { en: "Family-made concrete, gypsum, and mixed-media art from the heart of Latvia. Three generations crafting heirlooms that feel like home.", lv: "Ģimenes radīta betona, ģipša un jaukto mediju māksla no Latvijas sirds. Trīs paaudzes veido mantojumus, kas jūtas kā mājas.", ru: "Семейный бетон, гипс и искусство смешанной техники из сердца Латвии. Три поколения создают реликвии, которые ощущаются как дом.", pl: "Sztuka rodzinna z serca Łotwy.", uk: "Сімейне мистецтво з серця Латвії." },
  "footer_explore": { en: "Explore", lv: "Izpētīt", ru: "Исследовать", pl: "Odkrywaj", uk: "Досліджуйте" },
  "footer_location": { en: "Visit Us", lv: "Apmeklējiet mūs", ru: "Посетите нас", pl: "Odwiedź Nas", uk: "Завітайте до Нас" },
  "footer.location_city": { en: "Daugavpils, Latvia", lv: "Daugavpils, Latvija", ru: "Даугавпилс, Латвия", pl: "Daugavpils, Łotwa", uk: "Даугавпілс, Латвія" },
  "footer.location_heart": { en: "The Heart of the Baltic", lv: "Baltijas sirds", ru: "Сердце Балтики", pl: "Serce Bałtyku", uk: "Серце Балтики" },
  "footer.hours_mon_fri": { en: "Mon — Fri", lv: "Pr — Pk", ru: "Пн — Пт", pl: "Pon — Pt", uk: "Пн — Пт" },
  "footer.hours_sat_sun": { en: "Sat — Sun", lv: "Se — Sv", ru: "Сб — Вс", pl: "Sob — Ndz", uk: "Сб — Нд" },
  "footer.family_time": { en: "Family Time", lv: "Ģimenes laiks", ru: "Семейное время", pl: "Czas dla Rodziny", uk: "Сімейний Час" },
  "footer.open_visits": { en: "Open for visits", lv: "Atvērts apmeklējumiem", ru: "Открыто для посещений", pl: "Otwarte dla odwiedzających", uk: "Відкрито для відвідувачів" },

  // Checkout Page
  "checkout.title": { en: "Securing Your Selection", lv: "Jūsu izvēles apstrāde", ru: "Оформление вашего выбора", pl: "Zabezpieczanie Twojego Wyboru", uk: "Оформлення Вашого Вибору" },
  "checkout.shipping.title": { en: "Shipping Details", lv: "Piegādes detaļas", ru: "Детали доставки", pl: "Szczegóły Dostawy", uk: "Деталі Доставки" },
  "checkout.shipping.desc": { en: "Where should we deliver your handcrafted artefacts?", lv: "Kur mums vajadzētu piegādāt jūsu roku darbus?", ru: "Куда нам доставить ваши изделия ручной работы?", pl: "Gdzie mamy dostarczyć Twoje rękodzieło?", uk: "Куди нам доставити ваші вироби ручної роботи?" },
  "checkout.shipping.email": { en: "Email Address", lv: "E-pasta adrese", ru: "Электронная почта", pl: "Adres Email", uk: "Електронна Пошта" },
  "checkout.shipping.name": { en: "Full Name", lv: "Vārds, Uzvārds", ru: "Имя и Фамилия", pl: "Imię i Nazwisko", uk: "Повне Ім'я" },
  "checkout.shipping.street": { en: "Street Address", lv: "Ielas adrese", ru: "Улица и дом", pl: "Ulica i Numer", uk: "Вулиця та Номер" },
  "checkout.shipping.city": { en: "City", lv: "Pilsēta", ru: "Город", pl: "Miasto", uk: "Місто" },
  "checkout.shipping.postal": { en: "Postal Code", lv: "Pasta indekss", ru: "Почтовый индекс", pl: "Kod Pocztowy", uk: "Поштовий Індекс" },
  "checkout.shipping.country": { en: "Country", lv: "Valsts", ru: "Страна", pl: "Kraj", uk: "Країна" },
  "checkout.payment.secure": { en: "Secure encrypted payment via Stripe", lv: "Drošs šifrēts maksājums caur Stripe", ru: "Безопасный зашифрованный платеж через Stripe", pl: "Bezpieczna płatność przez Stripe", uk: "Безпечний платіж через Stripe" },
  "checkout.summary.title": { en: "Order Summary", lv: "Pasūtījuma kopsavilkums", ru: "Сводка заказа", pl: "Podsumowanie Zamówienia", uk: "Підсумок Замовлення" },
  "checkout.summary.qty": { en: "Qty", lv: "Skaits", ru: "Кол-во", pl: "Ilość", uk: "К-сть" },
  "checkout.summary.subtotal": { en: "Subtotal", lv: "Starpsumma", ru: "Подытог", pl: "Suma Częściowa", uk: "Підсумок" },
  "checkout.summary.total": { en: "Total", lv: "Kopā", ru: "Всего", pl: "Razem", uk: "Всього" },

  // Confirmation Page
  "confirm.title": { en: "Artefact Reserved", lv: "Darbs rezervēts", ru: "Изделие зарезервировано", pl: "Dzieło Zarezerwowane", uk: "Виріб Зарезервовано" },
  "confirm.subtitle": { en: "Your order has been placed successfully.", lv: "Jūsu pasūtījums ir veiksmīgi veikts.", ru: "Ваш заказ успешно размещен.", pl: "Twoje zamówienie zostało złożone.", uk: "Ваше замовлення успішно розміщено." },
  "confirm.desc": { en: "A confirmation email has been sent. We'll start preparing your handcrafted piece for its new home.", lv: "Apstiprinājuma e-pasts ir nosūtīts. Mēs sāksim gatavot jūsu roku darbu jaunajām mājām.", ru: "Подтверждающее письмо отправлено. Мы начнем готовить ваше изделие к отправке в новый дом.", pl: "Wysłano email z potwierdzeniem.", uk: "Надіслано електронний лист з підтвердженням." },
  "confirm.continue": { en: "Continue Shopping", lv: "Turpināt iepirkties", ru: "Продолжить покупки", pl: "Kontynuuj Zakupy", uk: "Продовжити Покупки" },

  // Home Page misc
  "home.family_made": { en: "Family Made", lv: "Ģimenes radīts", ru: "Семейная работа", pl: "Rodzinna Robota", uk: "Сімейна Робота" },

  // Gallery (Extended)
  "gallery.featured": { en: "Featured", lv: "Izcelts", ru: "Избранное", pl: "Wyróżnione", uk: "Вибране" },
  "gallery.views": { en: "views", lv: "skatījumi", ru: "просмотров", pl: "wyświetleń", uk: "переглядів" },
  "gallery.likes": { en: "likes", lv: "patīk", ru: "лайков", pl: "polubień", uk: "вподобань" },
  "gallery.tags": { en: "Tags", lv: "Tagi", ru: "Теги", pl: "Tagi", uk: "Теги" },
  "gallery.not_found": { en: "Item not found", lv: "Elements nav atrasts", ru: "Элемент не найден", pl: "Element nie znaleziony", uk: "Елемент не знайдено" },

  // Admin Gallery (Extended)
  "admin.gallery": { en: "Gallery", lv: "Galerija", ru: "Галерея", pl: "Galeria", uk: "Галерея" },
  "admin.management": { en: "Management", lv: "Pārvaldība", ru: "Управление", pl: "Zarządzanie", uk: "Управління" },
  "admin.gallery_subtitle": { en: "Manage your gallery items and categories", lv: "Pārvaldiet galerijas elementus un kategorijas", ru: "Управляйте элементами галереи и категориями", pl: "Zarządzaj elementami galerii.", uk: "Керуйте елементами галереї." },
  "admin.gallery_items": { en: "Gallery Items", lv: "Galerijas Elementi", ru: "Элементы Галереи", pl: "Elementy Galerii", uk: "Елементи Галереї" },
  "admin.categories": { en: "Categories", lv: "Kategorijas", ru: "Категории", pl: "Kategorie", uk: "Категорії" },
  "admin.search_items": { en: "Search items...", lv: "Meklēt elementus...", ru: "Поиск элементов...", pl: "Szukaj elementów...", uk: "Пошук елементів..." },
  "admin.add_item": { en: "Add Item", lv: "Pievienot Elementu", ru: "Добавить Элемент", pl: "Dodaj Element", uk: "Додати Елемент" },
  "admin.edit_item": { en: "Edit Item", lv: "Rediģēt Elementu", ru: "Редактировать Элемент", pl: "Edytuj Element", uk: "Редагувати Елемент" },
  "admin.add_category": { en: "Add Category", lv: "Pievienot Kategoriju", ru: "Добавить Категорию", pl: "Dodaj Kategorię", uk: "Додати Категорію" },
  "admin.edit_category": { en: "Edit Category", lv: "Rediģēt Kategoriju", ru: "Редактировать Категорию", pl: "Edytuj Kategorię", uk: "Редагувати Категорію" },
  "admin.title": { en: "Title", lv: "Nosaukums", ru: "Название", pl: "Tytuł", uk: "Назва" },
  "admin.slug": { en: "Slug", lv: "Identifikators", ru: "Слаг", pl: "Slug", uk: "Слаг" },
  "admin.type": { en: "Type", lv: "Tips", ru: "Тип", pl: "Typ", uk: "Тип" },
  "admin.select_category": { en: "Select category", lv: "Izvēlieties kategoriju", ru: "Выберите категорию", pl: "Wybierz kategorię", uk: "Виберіть категорію" },
  "admin.media_url": { en: "Media URL", lv: "Multivides URL", ru: "URL Медиа", pl: "URL Mediów", uk: "URL Медіа" },
  "admin.thumbnail_url": { en: "Thumbnail URL", lv: "Sīktēla URL", ru: "URL Миниатюры", pl: "URL Miniatury", uk: "URL Мініатюри" },
  "admin.tags_hint": { en: "Separate tags with commas", lv: "Atdaliet tagus ar komatiem", ru: "Разделяйте теги запятыми", pl: "Oddziel tagi przecinkami", uk: "Розділяйте теги комами" },
  "admin.cancel": { en: "Cancel", lv: "Atcelt", ru: "Отмена", pl: "Anuluj", uk: "Скасувати" },
  "admin.create": { en: "Create", lv: "Izveidot", ru: "Создать", pl: "Utwórz", uk: "Створити" },
  "admin.update": { en: "Update", lv: "Atjaunināt", ru: "Обновить", pl: "Aktualizuj", uk: "Оновити" },
  "admin.no_results": { en: "No results found", lv: "Nav atrasts neviens rezultāts", ru: "Результаты не найдены", pl: "Brak wyników", uk: "Результатів не знайдено" },
  "admin.no_items": { en: "No items yet", lv: "Vēl nav elementu", ru: "Пока нет элементов", pl: "Brak elementów", uk: "Немає елементів" },
  "admin.no_categories": { en: "No categories yet", lv: "Vēl nav kategoriju", ru: "Пока нет категорий", pl: "Brak kategorii", uk: "Немає категорій" },
  "admin.confirm_delete": { en: "Are you sure you want to delete this?", lv: "Vai tiešām vēlaties dzēst?", ru: "Вы уверены, что хотите удалить?", pl: "Czy na pewno chcesz usunąć?", uk: "Ви впевнені, що хочете видалити?" },
  "admin.gallery_item_created": { en: "Gallery item created!", lv: "Galerijas elements izveidots!", ru: "Элемент галереи создан!", pl: "Element utworzony!", uk: "Елемент створено!" },
  "admin.gallery_item_updated": { en: "Gallery item updated!", lv: "Galerijas elements atjaunināts!", ru: "Элемент галереи обновлен!", pl: "Element zaktualizowany!", uk: "Елемент оновлено!" },
  "admin.gallery_item_deleted": { en: "Gallery item deleted!", lv: "Galerijas elements dzēsts!", ru: "Элемент галереи удален!", pl: "Element usunięty!", uk: "Елемент видалено!" },
  "admin.gallery_item_error": { en: "An error occurred", lv: "Radās kļūda", ru: "Произошла ошибка", pl: "Wystąpił błąd", uk: "Сталася помилка" },

  // Site Config Admin
  "admin.site_config": { en: "Site Settings", lv: "Vietnes Iestatījumi", ru: "Настройки Сайта", pl: "Ustawienia Strony", uk: "Налаштування Сайту" },
  "admin.contact_info": { en: "Contact Information", lv: "Kontaktinformācija", ru: "Контактная Информация", pl: "Informacje Kontaktowe", uk: "Контактна Інформація" },
  "admin.social_links": { en: "Social Links", lv: "Sociālās Saites", ru: "Социальные Ссылки", pl: "Linki Społecznościowe", uk: "Соціальні Посилання" },
  "admin.business_hours": { en: "Business Hours", lv: "Darba Laiks", ru: "Часы Работы", pl: "Godziny Otwarcia", uk: "Години Роботи" },
  "admin.save_changes": { en: "Save Changes", lv: "Saglabāt Izmaiņas", ru: "Сохранить Изменения", pl: "Zapisz Zmiany", uk: "Зберегти Зміни" },
  "admin.settings_saved": { en: "Settings saved successfully!", lv: "Iestatījumi veiksmīgi saglabāti!", ru: "Настройки успешно сохранены!", pl: "Ustawienia zapisane!", uk: "Налаштування збережено!" },
  "admin.settings_error": { en: "Failed to save settings", lv: "Neizdevās saglabāt iestatījumus", ru: "Не удалось сохранить настройки", pl: "Nie udało się zapisać ustawień", uk: "Не вдалося зберегти налаштування" },

  // Guide: Our Material
  "guide_material_eyebrow": { en: "Our Material", lv: "Mūsu materiāls", ru: "Наш материал", pl: "Our Material", uk: "Our Material" },
  "guide_material_title": { en: "Innovative Architectural Stone", lv: "Inovatīvs arhitektūras akmens", ru: "Инновационный Архитектурный Камень", pl: "Innovative Architectural Stone", uk: "Innovative Architectural Stone" },
  "guide_material_intro": { en: "Many use ordinary, fragile plaster. We went further and developed our own formula for an ultra-strong composite stone. This is a true engineering approach to art and ecology.", lv: "Daudzi izmanto parastu, trauslu ģipsi. Mēs gājām tālāk un izstrādājām paši savu īpaši izturīga kompozītakmens formulu. Tā ir patiesa inženierijas pieeja mākslai un ekoloģijai.", ru: "Многие используют обычный хрупкий гипс. Мы пошли дальше и разработали собственную формулу сверхпрочного композитного камня. Это настоящий инженерный подход к искусству и экологии.", pl: "Many use ordinary, fragile plaster. We went further and developed our own formula for an ultra-strong composite stone. This is a true engineering approach to art and ecology.", uk: "Many use ordinary, fragile plaster. We went further and developed our own formula for an ultra-strong composite stone. This is a true engineering approach to art and ecology." },
  "guide_material_subtitle": { en: "What is it made of?", lv: "No kā tas ir izgatavots?", ru: "Из чего это сделано?", pl: "What is it made of?", uk: "What is it made of?" },
  "guide_material_base": { en: "At its core are exclusively safe, natural minerals:", lv: "Pamatā ir tikai droši, dabiski minerāli:", ru: "В основе лежат исключительно безопасные природные минералы:", pl: "At its core are exclusively safe, natural minerals:", uk: "At its core are exclusively safe, natural minerals:" },
  "guide_material_gypsum": { en: "Sculptural Gypsum & White Cement: The perfect balance giving the piece monumental strength.", lv: "Tēlniecības ģipsis un baltais cements: Ideāls līdzsvars, kas piešķir izstrādājumam monumentālu izturību.", ru: "Скульптурный гипс и белый цемент: Идеальный баланс, дающий изделию монументальную прочность.", pl: "Sculptural Gypsum & White Cement: The perfect balance giving the piece monumental strength.", uk: "Sculptural Gypsum & White Cement: The perfect balance giving the piece monumental strength." },
  "guide_material_silica": { en: "Micro-silica (E551): Purified silicon dioxide. This safe (food-grade) additive binds minerals at the molecular level, filling even the smallest pores.", lv: "Mikrosilīcijs (E551): Attīrīts silīcija dioksīds. Šī drošā (pārtikas klases) piedeva saista minerālus molekulārā līmenī, aizpildot pat vismazākās poras.", ru: "Микрокремнезем (E551): Очищенный диоксид кремния. Эта безопасная (пищевая) добавка связывает минералы на молекулярном уровне, заполняя даже самые мелкие поры.", pl: "Micro-silica (E551): Purified silicon dioxide. This safe (food-grade) additive binds minerals at the molecular level, filling even the smallest pores.", uk: "Micro-silica (E551): Purified silicon dioxide. This safe (food-grade) additive binds minerals at the molecular level, filling even the smallest pores." },
  "guide_material_plasticizer": { en: "Hyperplasticizer: Removes excess water and air from the mixture, turning it into an absolute monolith.", lv: "Hiperplastifikators: Izvada lieko ūdeni un gaisu no maisījuma, pārvēršot to absolūtā monolītā.", ru: "Гиперпластификатор: Выводит лишнюю воду и воздух из раствора, превращая смесь в абсолютный монолит.", pl: "Hyperplasticizer: Removes excess water and air from the mixture, turning it into an absolute monolith.", uk: "Hyperplasticizer: Removes excess water and air from the mixture, turning it into an absolute monolith." },
  "guide_material_adv_title": { en: "Advantages of our formula:", lv: "Mūsu formulas priekšrocības:", ru: "Преимущества нашей формулы:", pl: "Advantages of our formula:", uk: "Advantages of our formula:" },
  "guide_material_adv_water": { en: "Water & Heat Resistance. Our stone does not absorb hot candle wax and does not degrade from water when used in garden fountains.", lv: "Mitruma un karstumizturība. Mūsu akmens neuzsūc karstu sveču vasku un nesabrūk no ūdens, darbojoties dārza strūklakās.", ru: "Влаго- и термостойкость. Наш камень не впитывает горячий воск от свечей и не разрушается от воды, работая в садовых фонтанах.", pl: "Water & Heat Resistance. Our stone does not absorb hot candle wax and does not degrade from water when used in garden fountains.", uk: "Water & Heat Resistance. Our stone does not absorb hot candle wax and does not degrade from water when used in garden fountains." },
  "guide_material_adv_density": { en: "Incredible Density. The pieces are heavy, cool to the touch, and feel like real wild stone in your hands.", lv: "Neticams blīvums. Izstrādājumi ir smagi, vēsi pieskaroties un rokās rada īsta, mežonīga akmens sajūtu.", ru: "Невероятная плотность. Изделия тяжелые, прохладные на ощупь и ощущаются в руках как настоящий дикий камень.", pl: "Incredible Density. The pieces are heavy, cool to the touch, and feel like real wild stone in your hands.", uk: "Incredible Density. The pieces are heavy, cool to the touch, and feel like real wild stone in your hands." },
  "guide_material_adv_aesthetics": { en: "Flawless Aesthetics. Our technology completely eliminates the appearance of white salt stains (efflorescence) on the surface. Pigments lay evenly, creating a pure and deep color.", lv: "Nevainojama estētika. Mūsu tehnoloģija pilnībā izslēdz baltu sāls traipu (izsvīdumu) parādīšanos uz virsmas. Pigmenti klājas vienmērīgi, radot tīru un dziļu krāsu.", ru: "Идеальная эстетика. Наша технология полностью исключает появление белых солевых разводов (высолов) на поверхности. Пигменты ложатся ровно, создавая чистый и глубокий цвет.", pl: "Flawless Aesthetics. Our technology completely eliminates the appearance of white salt stains (efflorescence) on the surface. Pigments lay evenly, creating a pure and deep color.", uk: "Flawless Aesthetics. Our technology completely eliminates the appearance of white salt stains (efflorescence) on the surface. Pigments lay evenly, creating a pure and deep color." },
  "guide_material_adv_safety": { en: "Absolute Safety. 100% eco-friendly composition without the use of toxic resins and microplastics.", lv: "Absolūta drošība. 100% ekoloģisks sastāvs, neizmantojot toksiskus sveķus un mikroplastmasu.", ru: "Абсолютная безопасность. 100% экологичный состав без использования токсичных смол и микропластика.", pl: "Absolute Safety. 100% eco-friendly composition without the use of toxic resins and microplastics.", uk: "Absolute Safety. 100% eco-friendly composition without the use of toxic resins and microplastics." },

  // Guide: Art Cast in Stone
  "guide_art_title": { en: "Art Cast in Stone", lv: "Māksla, kas iemūžināta akmenī", ru: "Искусство, застывшее в камне", pl: "Art Cast in Stone", uk: "Art Cast in Stone" },
  "guide_art_intro": { en: "Welcome to the Trosheen Crafts studio! We combine the power of natural minerals, modern technology, and handcrafting to create pieces that last for decades.", lv: "Laipni lūdzam Trosheen Crafts darbnīcā! Mēs apvienojam dabisko minerālu spēku, modernās tehnoloģijas un roku darbu, lai radītu lietas, kas kalpo gadu desmitiem.", ru: "Добро пожаловать в мастерскую Trosheen Crafts! Мы объединяем силу природных минералов, современные технологии и ручной труд, чтобы создавать вещи, которые живут десятилетиями.", pl: "Welcome to the Trosheen Crafts studio! We combine the power of natural minerals, modern technology, and handcrafting to create pieces that last for decades.", uk: "Welcome to the Trosheen Crafts studio! We combine the power of natural minerals, modern technology, and handcrafting to create pieces that last for decades." },
  "guide_art_scale": { en: "We do not limit ourselves. Our element is scale and versatility. Everything is born in our workshop: from cozy interior candles to monumental garden fountains, architectural planters, and functional decor.", lv: "Mēs neierobežojam sevi. Mūsu stihija ir mērogs un daudzpusība. Mūsu darbnīcā dzimst viss: no mājīgām interjera svecēm līdz monumentālām dārza strūklakām, arhitektūras puķu podiem un funkcionāliem dekoriem.", ru: "Мы не ограничиваемся рамками. Наша стихия — это масштаб и универсальность. В нашей мастерской рождается всё: от уютных интерьерных свечей до монументальных садовых фонтанов, архитектурных кашпо и функционального декора.", pl: "We do not limit ourselves. Our element is scale and versatility. Everything is born in our workshop: from cozy interior candles to monumental garden fountains, architectural planters, and functional decor.", uk: "We do not limit ourselves. Our element is scale and versatility. Everything is born in our workshop: from cozy interior candles to monumental garden fountains, architectural planters, and functional decor." },
  "guide_art_why_title": { en: "Why choose us?", lv: "Kāpēc izvēlēties mūs?", ru: "Почему выбирают нас?", pl: "Why choose us?", uk: "Why choose us?" },
  "guide_art_durability": { en: "Monolithic Durability. Every large piece is obligatorily reinforced. Our planters and fountains defy both time and harsh weather conditions.", lv: "Monolīta izturība. Katrs lielais izstrādājums ir obligāti stiegrots (armēts). Mūsu puķu podi un strūklakas nebaidās ne no laika, ne no skarbiem laikapstākļiem.", ru: "Монолитная прочность. Каждое крупное изделие проходит обязательное армирование. Наши кашпо и фонтаны не боятся ни времени, ни суровых погодных условий.", pl: "Monolithic Durability. Every large piece is obligatorily reinforced. Our planters and fountains defy both time and harsh weather conditions.", uk: "Monolithic Durability. Every large piece is obligatorily reinforced. Our planters and fountains defy both time and harsh weather conditions." },
  "guide_art_aesthetics": { en: "Premium Aesthetics. We use only high-quality pigments. The deep, noble shades do not fade in the sun and maintain their original beauty.", lv: "Premium estētika. Mēs izmantojam tikai augstākās kvalitātes pigmentus. Dziļie, cēlie toņi neizbalo saulē un saglabā savu sākotnējo skaistumu.", ru: "Премиальная эстетика. Мы используем только высококачественные пигменты. Глубокие, благородные оттенки не выцветают на солнце и сохраняют свою первозданную красоту.", pl: "Premium Aesthetics. We use only high-quality pigments. The deep, noble shades do not fade in the sun and maintain ich original beauty.", uk: "Premium Aesthetics. We use only high-quality pigments. The deep, noble shades do not fade in the sun and maintain their original beauty." },
  "guide_art_handmade": { en: "100% Handmade. Every texture, curve, and shade is unique. You receive not just an object, but a true sculpture with the artisan's soul.", lv: "100% Roku darbs. Katra faktūra, katrs izliekums un tonis ir unikāls. Jūs saņemat ne tikai priekšmetu, bet īstu skulptūru ar meistara dvēseli.", ru: "100% Ручная работа. Каждая фактура, каждый изгиб и оттенок уникальны. Вы получаете не просто предмет, а настоящую скульптуру с душой мастера.", pl: "100% Handmade. Every texture, curve, and shade is unique. You receive not just an object, but a true sculpture with the artisan's soul.", uk: "100% Handmade. Every texture, curve, and shade is unique. You receive not just an object, but a true sculpture with the artisan's soul." },
  "guide_art_eco": { en: "Eco-Philosophy. We work with safe, natural materials. Our decor blends harmoniously into both home interiors and landscape designs without harming the environment.", lv: "Eko-filozofija. Mēs strādājam ar drošiem, dabiskiem materiāliem. Mūsu dekori harmoniski iekļaujas gan mājas interjerā, gan ainavu dizainā, nekaitējot apkārtējai videi.", ru: "Эко-философия. Мы работаем с безопасными природными материалами. Наш декор гармонично вписывается как в домашний интерьер, так и в ландшафтный дизайн, не нанося вреда окружающей среде.", pl: "Eco-Philosophy. We work with safe, natural materials. Our decor blends harmoniously into both home interiors and landscape designs without harming the environment.", uk: "Eco-Philosophy. We work with safe, natural materials. Our decor blends harmoniously into both home interiors and landscape designs without harming the environment." },
  "guide_art_outro": { en: "Trosheen Crafts — reliability you can feel and beauty you want to touch.", lv: "Trosheen Crafts — uzticamība, ko var sajust, un skaistums, kam gribas pieskarties.", ru: "Trosheen Crafts — это надежность, которую можно почувствовать, и красота, которую хочется касаться.", pl: "Trosheen Crafts — reliability you can feel and beauty you want to touch.", uk: "Trosheen Crafts — reliability you can feel and beauty you want to touch." },

  // Guide: Care Guide
  "guide_care_eyebrow": { en: "Care Guide", lv: "Kopšanas ceļvedis", ru: "Гайд по уходу", pl: "Care Guide", uk: "Care Guide" },
  "guide_care_title": { en: "Care & Usage Guide", lv: "Lietošanas un kopšanas ceļvedis", ru: "Гайд по уходу и использованию", pl: "Care & Usage Guide", uk: "Care & Usage Guide" },
  "guide_care_intro": { en: "Our pieces are crafted from ultra-strong architectural stone to bring you joy for years. Follow these simple rules to maintain their pristine appearance.", lv: "Mūsu izstrādājumi ir radīti no īpaši izturīga arhitektūras akmens, lai priecētu jūs gadiem ilgi. Ievērojiet šos vienkāršos noteikumus, lai saglabātu to sākotnējo izskatu.", ru: "Наши изделия созданы из сверхпрочного архитектурного камня, чтобы радовать вас годами. Следуйте этим простым правилам, чтобы сохранить их первозданный вид.", pl: "Our pieces are crafted from ultra-strong architectural stone to bring you joy for years. Follow these simple rules to maintain their pristine appearance.", uk: "Our pieces are crafted from ultra-strong architectural stone to bring you joy for years. Follow these simple rules to maintain their pristine appearance." },
  "guide_care_general_title": { en: "General Stone Care", lv: "Akmens kopšanas pamati", ru: "Общий уход за камнем", pl: "General Stone Care", uk: "General Stone Care" },
  "guide_care_cleaning": { en: "Cleaning: Simply wipe the surface with a soft, damp cloth. For heavier dirt, use a mild soapy solution.", lv: "Tīrīšana: Pietiek noslaucīt virsmu ar mīkstu, mitru drānu. Lielākiem netīrumiem izmantojiet maigu ziepjūdeni.", ru: "Очистка: Достаточно протереть поверхность мягкой влажной тканью. При сильных загрязнениях используйте мягкий мыльный раствор.", pl: "Cleaning: Simply wipe the surface with a soft, damp cloth. For heavier dirt, use a mild soapy solution.", uk: "Cleaning: Simply wipe the surface with a soft, damp cloth. For heavier dirt, use a mild soapy solution." },
  "guide_care_protection": { en: "Protection: Avoid using harsh abrasive sponges and aggressive chemicals (acids or solvents) as they can damage the stone's texture.", lv: "Aizsardzība: Neizmantojiet cietus metāla sūkļus un agresīvu ķīmiju (skābes vai šķīdinātājus), jo tie var sabojāt akmens faktūru.", ru: "Защита: Избегайте использования жестких металлических губок и агрессивной химии (кислот и растворителей) — они могут повредить фактуру камня.", pl: "Protection: Avoid using harsh abrasive sponges and aggressive chemicals (acids or solvents) as they can damage the stone's texture.", uk: "Protection: Avoid using harsh abrasive sponges and aggressive chemicals (acids or solvents) as they can damage the stone's texture." },
  "guide_care_caution": { en: "Caution: Despite being reinforced and highly durable, stone items can chip if dropped from a height onto a hard surface (like tile).", lv: "Piesardzība: Neskatoties uz armējumu un augsto izturību, akmens izstrādājumi var ieplaisāt, ja tie nokrīt no augstuma uz cietas virsmas (piemēram, flīzēm).", ru: "Осторожность: Несмотря на армирование и высокую прочность, изделия из камня могут получить сколы при падении с высоты на твердую поверхность (например, на плитку).", pl: "Caution: Despite being reinforced and highly durable, stone items can chip if dropped from a height onto a hard surface (like tile).", uk: "Caution: Despite being reinforced and highly durable, stone items can chip if dropped from a height onto a hard surface (like tile)." },
  
  "guide_care_zero_title": { en: "Second Life for Candles (Zero Waste)", lv: "Sveču otrā dzīve (Zero Waste)", ru: "Вторая жизнь свечей (Zero Waste)", pl: "Second Life for Candles (Zero Waste)", uk: "Second Life for Candles (Zero Waste)" },
  "guide_care_zero_intro": { en: "When your soy candle burns out, don't throw away the container! Our material does not absorb wax, making the cup easy to clean:", lv: "Kad jūsu sojas svece ir izdegusi, nesteidzieties izmest trauku! Mūsu materiāls neuzsūc vasku, tāpēc trauku ir viegli iztīrīt:", ru: "Когда ваша соевая свеча догорит, не спешите выбрасывать контейнер! Наш материал не впитывает воск, поэтому стакан легко очистить:", pl: "When your soy candle burns out, don't throw away the container! Our material does not absorb wax, making the cup easy to clean:", uk: "When your soy candle burns out, don't throw away the container! Our material does not absorb wax, making the cup easy to clean:" },
  "guide_care_zero_step1": { en: "Pour warm water (not boiling!) into the container.", lv: "Ielejiet traukā siltu ūdeni (ne verdošu!).", ru: "Залейте в контейнер теплую воду (не кипяток!).", pl: "Pour warm water (not boiling!) into the container.", uk: "Pour warm water (not boiling!) into the container." },
  "guide_care_zero_step2": { en: "Wait a few minutes — the remaining soy wax will melt and float to the top.", lv: "Pagaidiet dažas minūtes — atlikušais sojas vasks izkusīs un uzpeldēs virspusē.", ru: "Подождите несколько минут — остатки соевого воска растают и всплывут на поверхность.", pl: "Wait a few minutes — the remaining soy wax will melt and float to the top.", uk: "Wait a few minutes — the remaining soy wax will melt and float to the top." },
  "guide_care_zero_step3": { en: "Let the water cool, remove the solid wax disk, and carefully detach the metal wick tab from the bottom.", lv: "Ļaujiet ūdenim atdzist, noņemiet cieto vaska kārtiņu un uzmanīgi izņemiet metāla daktis turētāju no apakšas.", ru: "Дайте воде остыть, снимите твердую восковую лепешку и аккуратно удалите металлический держатель фитиля со дна.", pl: "Let the water cool, remove the solid wax disk, and carefully detach the metal wick tab from the bottom.", uk: "Let the water cool, remove the solid wax disk, and carefully detach the metal wick tab from the bottom." },
  "guide_care_zero_step4": { en: "Wash the container with a sponge and regular dish soap. Done! Now you have a stylish planter for succulents, a brush holder, or a trinket box.", lv: "Izmazgājiet trauku ar sūkli un parasto trauku mazgāšanas līdzekli. Gatavs! Tagad tas ir stilīgs puķu pods sukulentiem, otu turētājs vai rotaslietu kastīte.", ru: "Промойте контейнер губкой с обычным средством для мытья посуды. Готово! Теперь это стильное кашпо для суккулентов, подставка для кистей или шкатулка.", pl: "Wash the container with a sponge and regular dish soap. Done! Now you have a stylish planter for succulents, a brush holder, or a trinket box.", uk: "Wash the container with a sponge and regular dish soap. Done! Now you have a stylish planter for succulents, a brush holder, or a trinket box." },

  "guide_care_planters_title": { en: "Planters and Garden Fountains", lv: "Puķu podi un dārza strūklakas", ru: "Кашпо и Садовые Фонтаны", pl: "Planters and Garden Fountains", uk: "Planters and Garden Fountains" },
  "guide_care_planters_planting": { en: "Planting: Our planters are moisture-resistant. You can use them as cover pots for plastic nursery pots or plant directly into the stone planter (in this case, add a drainage layer at the bottom).", lv: "Stādīšana: Mūsu puķu podi nebaidās no mitruma. Jūs varat stādīt augus gan tehniskajos plastmasas podiņos, gan tieši akmens podā (šajā gadījumā apakšā izveidojiet drenāžas slāni).", ru: "Высадка растений: Наши кашпо не боятся влаги. Вы можете сажать растения как в технических пластиковых горшочках, так и напрямую в каменное кашпо (в этом случае используйте дренажный слой на дне).", pl: "Planting: Our planters are moisture-resistant. You can use them as cover pots for plastic nursery pots or plant directly into the stone planter (in this case, add a drainage layer at the bottom).", uk: "Planting: Our planters are moisture-resistant. You can use them as cover pots for plastic nursery pots or plant directly into the stone planter (in this case, add a drainage layer at the bottom)." },
  "guide_care_planters_winter": { en: "Winterizing Fountains: The stone withstands temperature changes, but to prevent damage to the pump and pipes, be sure to drain all water from the fountains before winter freezes begin.", lv: "Strūklaku ieziemošana: Akmens iztur temperatūras svārstības, bet, lai izvairītos no sūkņa un cauruļu bojājumiem, pirms ziemas sala iestāšanās noteikti izlejiet ūdeni no strūklakām.", ru: "Зимовка фонтанов: Камень выдерживает перепады температур, но чтобы избежать повреждения насоса и труб, обязательно сливайте воду из фонтанов перед наступлением зимних заморозков.", pl: "Winterizing Fountains: The stone withstands temperature changes, but to prevent damage to the pump and pipes, be sure to drain all water from the fountains before winter freezes begin.", uk: "Winterizing Fountains: The stone withstands temperature changes, but to prevent damage to the pump and pipes, be sure to drain all water from the fountains before winter freezes begin." },

  // Constructor
  "constructor.title": { en: "The Workshop", lv: "Darbnīca", ru: "Мастерская", pl: "Warsztat", uk: "Майстерня" },
  "constructor.subtitle": { en: "Design your perfect piece", lv: "Dizainē savu ideālo darbu", ru: "Создайте свое идеальное изделие", pl: "Zaprojektuj swój idealny wyrób", uk: "Створіть свій ідеальний виріб" },
  "constructor.step1": { en: "1. Shape Your Vision", lv: "1. Veidojiet Savu Vīziju", ru: "1. Выберите Форму", pl: "1. Wybierz Kształt", uk: "1. Виберіть Форму" },
  "constructor.step2": { en: "2. The Finish", lv: "2. Apdare", ru: "2. Отделка", pl: "2. Wykończenie", uk: "2. Обробка" },
  "constructor.step3": { en: "3. Wax & Wick", lv: "3. Vasks un Dakts", ru: "3. Воск и Фитиль", pl: "3. Wosk i Knot", uk: "3. Віск і Гніт" },
  "constructor.step4": { en: "4. The Essence", lv: "4. Būtība", ru: "4. Эссенция", pl: "4. Esencja", uk: "4. Есенція" },
  "constructor.step_ready": { en: "Masterpiece Ready!", lv: "Meistardarbs Gatavs!", ru: "Шедевр Готов!", pl: "Arcydzieło Gotowe!", uk: "Шедевр Готовий!" },
  "constructor.base_price": { en: "Base Price", lv: "Pamatcena", ru: "Базовая цена", pl: "Cena podstawowa", uk: "Базова ціна" },
  "constructor.add_to_cart": { en: "Bring It To Life", lv: "Atdzīvināt To", ru: "Воплотить в жизнь", pl: "Ożyw to", uk: "Втілити в життя" },
  "constructor.review_design": { en: "Review Your Design", lv: "Pārskatiet Savu Dizainu", ru: "Проверьте Свой Дизайн", pl: "Przejrzyj Swój Projekt", uk: "Перевірте Свій Дизайн" },
  "constructor.loading": { en: "Loading workshop...", lv: "Ielādē darbnīcu...", ru: "Загрузка мастерской...", pl: "Ładowanie warsztatu...", uk: "Завантаження майстерні..." },
  // Admin
  "admin.dashboard": { en: "Dashboard", lv: "Informācijas panelis", ru: "Панель управления", pl: "Pulpit nawigacyjny", uk: "Панель управління" },
  "admin.analytics_title": { en: "Analytics", lv: "Analītika", ru: "Аналитика", pl: "Analityka", uk: "Аналітика" },
  "admin.orders": { en: "Orders", lv: "Pasūtījumi", ru: "Заказы", pl: "Zamówienia", uk: "Замовлення" },
  "admin.products": { en: "Products", lv: "Produkti", ru: "Продукты", pl: "Produkty", uk: "Продукти" },
  "admin.constructor": { en: "Constructor", lv: "Konstruktors", ru: "Конструктор", pl: "Konstruktor", uk: "Конструктор" },
  "admin.category": { en: "Categories", lv: "Kategorijas", ru: "Категории", pl: "Kategorie", uk: "Категорії" },
  "admin.blog": { en: "Blog", lv: "Emuārs", ru: "Блог", pl: "Blog", uk: "Блог" },
  "admin.promotions": { en: "Promotions", lv: "Akcijas", ru: "Акции", pl: "Promocje", uk: "Акції" },
  "admin.gallery.title": { en: "Gallery", lv: "Galerija", ru: "Галерея", pl: "Galeria", uk: "Галерея" },
  "admin.messages": { en: "Messages", lv: "Ziņas", ru: "Сообщения", pl: "Wiadomości", uk: "Повідомлення" },
  "admin.customer": { en: "Customers", lv: "Klienti", ru: "Клиенты", pl: "Klienci", uk: "Клієнти" },
  "footer.newsletter_title": { en: "Subscribers", lv: "Abonenti", ru: "Подписчики", pl: "Subskrybenci", uk: "Підписники" },
  "admin.logout": { en: "Logout", lv: "Izrakstīties", ru: "Выйти", pl: "Wyloguj", uk: "Вийти" },
  "admin.login_title": { en: "Admin Portal", lv: "Administratora portāls", ru: "Портал администратора", pl: "Portal administratora", uk: "Портал адміністратора" },

};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('trosheen-lang');
      if (savedLang && ['en', 'lv', 'ru', 'pl', 'uk'].includes(savedLang)) {
        return savedLang as Language;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return "lv";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('trosheen-lang', lang);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
