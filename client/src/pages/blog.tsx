import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
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

const PAGE_SIZE = 12;

export default function BlogPage() {
  const { t, language } = useLanguage();
  const {
    data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["blog-posts", "infinite"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => apiClient.get<any[]>("/blog", {
      params: { offset: pageParam, limit: PAGE_SIZE },
    }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
  });
  const posts = data?.pages.flat() || [];

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
        ) : isError && !posts.length ? (
          <div className="empty" role="alert">
            <Lottie file="trosheen-10-404-rolling-stone.json" mode="view" className="empty__art" />
            <p>{t("v4.journal.loadError")}</p>
            <button type="button" className="btn btn--ghost" onClick={() => void refetch()}>
              {t("v4.shop.retry")}
            </button>
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
            {hasNextPage && (
              <div className="center" style={{ marginTop: "2.5rem" }}>
                <button type="button" className="btn btn--ghost" disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()} aria-busy={isFetchingNextPage}>
                  {isFetchingNextPage ? t("common.loading") : t("v4.journal.more")}
                </button>
              </div>
            )}
            {isError && <p role="alert" className="center note">{t("v4.journal.loadError")}</p>}
          </>
        ) : (
          <>
            <div className="divider" aria-hidden="true">
              <Ornament name="auseklis" size="sm" draw />
            </div>
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
