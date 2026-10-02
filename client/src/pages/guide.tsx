import { Droplets, Heart, ShieldCheck, Sun, Recycle, Beaker } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { ScrollStoryPhotos } from "@/lib/imageAssets";

export default function GuidePage() {
  const { t } = useLanguage();

  const advantages = [
    { icon: Droplets, text: t("guide_material_adv_water") },
    { icon: ShieldCheck, text: t("guide_material_adv_density") },
    { icon: Sun, text: t("guide_material_adv_aesthetics") },
    { icon: Heart, text: t("guide_material_adv_safety") },
  ];

  const careGroups = [
    {
      icon: ShieldCheck,
      title: t("guide_care_general_title"),
      items: [t("guide_care_cleaning"), t("guide_care_protection"), t("guide_care_caution")],
    },
    {
      icon: Droplets,
      title: t("guide_care_planters_title"),
      items: [t("guide_care_planters_planting"), t("guide_care_planters_winter")],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container max-w-5xl text-center">
          <p className="eyebrow">{t("guide_material_eyebrow")}</p>
          <h1 className="display-title mt-5">{t("guide_material_title")}</h1>
          <p className="lead mx-auto mt-6 max-w-3xl">{t("guide_material_intro")}</p>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">{t("guide_material_eyebrow")}</p>
            <h2 className="section-title mt-4">{t("guide_material_subtitle")}</h2>
            <p className="lead mt-6">{t("guide_material_base")}</p>

            <div className="mt-8 space-y-5">
              {[
                { icon: ShieldCheck, text: t("guide_material_gypsum") },
                { icon: Beaker, text: t("guide_material_silica") },
                { icon: Droplets, text: t("guide_material_plasticizer") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex gap-4 border-t border-border pt-5">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-7 text-muted-foreground sm:text-base">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            <img
              src={ScrollStoryPhotos.chapter2_materials}
              alt="Material mixing process"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="site-container section-space">
          <p className="eyebrow text-center">Material qualities</p>
          <h2 className="section-title mx-auto mt-4 max-w-3xl text-center">{t("guide_material_adv_title")}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="surface-muted p-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-5 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary text-secondary-foreground">
        <div className="site-container section-space max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary-foreground/50">
            Trosheen material philosophy
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-6xl">{t("guide_art_title")}</h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-secondary-foreground/70 sm:text-lg">{t("guide_art_intro")}</p>

          <div className="mt-10 border-t border-white/15 pt-8">
            <h3 className="font-serif text-2xl font-semibold">{t("guide_art_why_title")}</h3>
            <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {[
                t("guide_art_scale"),
                t("guide_art_durability"),
                t("guide_art_aesthetics"),
                t("guide_art_handmade"),
                t("guide_art_eco"),
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9cdbb]" />
                  <p className="text-sm leading-7 text-secondary-foreground/75">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 font-serif text-2xl italic text-[#d9cdbb]">{t("guide_art_outro")}</p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container max-w-5xl">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("guide_care_eyebrow")}</p>
            <h2 className="section-title mt-4">{t("guide_care_title")}</h2>
            <p className="lead mt-5">{t("guide_care_intro")}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {careGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="surface p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-2xl font-semibold">{group.title}</h3>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {group.items.map((item) => (
                      <li key={item} className="border-t border-border pt-4 text-sm leading-7 text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="surface md:col-span-2 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-2xl font-semibold">{t("guide_care_zero_title")}</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{t("guide_care_zero_intro")}</p>
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  t("guide_care_zero_step1"),
                  t("guide_care_zero_step2"),
                  t("guide_care_zero_step3"),
                  t("guide_care_zero_step4"),
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 border-t border-border pt-4">
                    <span className="font-serif text-lg font-semibold text-primary">0{index + 1}</span>
                    <span className="text-sm leading-7 text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
