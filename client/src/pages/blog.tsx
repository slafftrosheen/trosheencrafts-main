import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { useBlogPosts } from "@/hooks/useApi";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";

const Arrow = () => (
  <svg
    className="tr-arrow"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export default function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const { t, language } = useLanguage();

  const localized = (post: any) => ({
    title: localizedText(post.title, post.titleTranslations, language),
    excerpt: localizedText(post.excerpt, post.excerptTranslations, language),
    date: new Date(post.publishedAt || post.createdAt).toLocaleDateString(language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  const [feature, ...rest] = posts;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="eyebrow">
          <Ornament name="austras-koks" size="sm" draw /> {t("v4.journal.eyebrow")}
        </p>
        <h1>{t("v4.journal.title")}</h1>
        <p className="lead">{t("v4.journal.lead")}</p>

        {isLoading ? (
          <div className="empty" role="status" style={{ marginTop: "2rem" }}>
            <Lottie file="trosheen-28-loader-seal.json" mode="loop" className="empty__art" />
            <p className="note" style={{ margin: 0 }}>
              {t("common.loading")}
            </p>
          </div>
        ) : posts.length > 0 ? (
          <>
            {feature && (
              <Link
                className="post feature-post"
                href={`/blog/${feature.slug}`}
                data-reveal
                style={{ marginTop: "2rem" }}
              >
                <div className="frame" style={{ aspectRatio: "16/10" }}>
                  {feature.image ? (
                    <img src={feature.image} alt={localized(feature).title} />
                  ) : (
                    <Lottie file="trosheen-29-gallery-frame.json" mode="view" className="empty__art" />
                  )}
                </div>
                <div>
                  <span className="post__meta">
                    {feature.author} · {localized(feature).date}
                  </span>
                  <h2 style={{ marginTop: ".6rem" }}>{localized(feature).title}</h2>
                  <p className="lead">{localized(feature).excerpt}</p>
                  <span className="link-arrow">
                    {t("v4.journal.read")} <Arrow />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-3" style={{ marginTop: "3.5rem" }}>
                {rest.map((post, index) => (
                  <Link
                    className="post"
                    href={`/blog/${post.slug}`}
                    key={post.id}
                    data-reveal
                    style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
                  >
                    <div className="frame" data-ink>
                      {post.image ? (
                        <img src={post.image} alt={localized(post).title} loading="lazy" />
                      ) : (
                        <Lottie file="trosheen-29-gallery-frame.json" mode="view" className="empty__art" />
                      )}
                    </div>
                    <span className="post__meta">
                      {post.author} · {localized(post).date}
                    </span>
                    <h3>{localized(post).title}</h3>
                    <p className="note">{localized(post).excerpt}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="divider" aria-hidden="true">
              <Ornament name="auseklis" size="sm" draw />
            </div>
            <p className="eyebrow center" style={{ display: "block" }}>
              {t("v4.journal.empty.label")}
            </p>
            <div className="empty" data-reveal>
              <Lottie file="trosheen-04-sprouting-planter.json" mode="view" className="empty__art" />
              <h3>{t("v4.journal.empty.title")}</h3>
              <p>{t("v4.journal.empty.desc")}</p>
              <Link className="btn btn--ghost" href="/#nl">
                {t("v4.journal.empty.cta")}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
