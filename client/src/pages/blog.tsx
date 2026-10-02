import { Link } from "wouter";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useApi";
import { Spinner } from "@/components/shared/LoadingStates";
import { useLanguage } from "@/lib/LanguageContext";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container">
          <p className="eyebrow">{t("blog.journal_title")}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h1 className="display-title">
              {t("blog.notes_from")} <span className="italic text-primary">{t("blog.location")}</span>
            </h1>
            <p className="lead lg:pb-2">{t("blog.intro_text")}</p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const localizedPost = post as any;
                const title = localizedPost.titleTranslations?.[language] || post.title;
                const excerpt = localizedPost.excerptTranslations?.[language] || post.excerpt;
                const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString(language, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <article key={post.id} className="group">
                    <Link href={"/blog/" + post.slug} className="block">
                      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-9 w-9 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="pt-5">
                        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          <span>{post.author}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>{date}</span>
                        </div>
                        <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight group-hover:text-primary">
                          {title}
                        </h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                          {excerpt}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {t("blog.browse")}
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="surface mx-auto max-w-xl p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-5 font-serif text-3xl font-semibold">{t("blog.journal_title")}</h2>
              <p className="mt-3 text-muted-foreground">{t("blog.intro_text")}</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/shop">{t("blog.webshop")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
