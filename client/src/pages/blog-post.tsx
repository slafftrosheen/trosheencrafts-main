import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/LoadingStates";
import { useLanguage } from "@/lib/LanguageContext";

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function ArticleBody({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return <h3 key={index} className="pt-4 font-serif text-2xl font-semibold text-foreground">{block.slice(4)}</h3>;
        }

        if (block.startsWith("## ")) {
          return <h2 key={index} className="pt-6 font-serif text-3xl font-semibold text-foreground sm:text-4xl">{block.slice(3)}</h2>;
        }

        if (block.startsWith("# ")) {
          return <h2 key={index} className="pt-6 font-serif text-4xl font-semibold text-foreground">{block.slice(2)}</h2>;
        }

        if (block === "---") {
          return <hr key={index} className="my-8 border-border" />;
        }

        if (block.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6">
              {block.split("\n").map((item, itemIndex) => (
                <li key={itemIndex}>{parseInline(item.replace(/^- /, ""))}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\. /.test(block)) {
          return (
            <ol key={index} className="list-decimal space-y-2 pl-6">
              {block.split("\n").map((item, itemIndex) => (
                <li key={itemIndex}>{parseInline(item.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          );
        }

        const image = block.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (image) {
          return (
            <img
              key={index}
              src={image[2]}
              alt={image[1]}
              loading="lazy"
              className="my-8 max-h-[640px] w-full rounded-3xl object-cover"
            />
          );
        }

        if (block.startsWith("*") && block.endsWith("*")) {
          return <p key={index} className="font-serif text-xl italic text-foreground/70">{block.slice(1, -1)}</p>;
        }

        return <p key={index}>{parseInline(block)}</p>;
      })}
    </div>
  );
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const { language, t } = useLanguage();
  const slug = params?.slug;

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const response = await fetch("/api/blog/" + slug);
      if (!response.ok) throw new Error("Failed to fetch blog post");
      return response.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PageLoader />;

  if (isError || !post) {
    return (
      <div className="site-container page-shell flex min-h-[60vh] items-center justify-center">
        <div className="surface max-w-xl p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-5 font-serif text-3xl font-semibold">{t("blog.post_not_found")}</h1>
          <Button asChild className="mt-6">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              {t("blog.back_to_blog")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = post.titleTranslations?.[language] || post.title;
  const content =
    typeof post.content === "object"
      ? post.content?.[language] || post.content?.en || ""
      : post.content || "";
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="pb-20 sm:pb-28">
      <div className="site-container pt-8 sm:pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back_to_blog")}
        </Link>
      </div>

      <header className="site-container max-w-5xl py-10 text-center sm:py-16">
        {post.category && <p className="eyebrow">{post.category}</p>}
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[.94] tracking-[-.045em]">
          {title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {post.author && <span>{post.author}</span>}
          {post.author && date && <span>·</span>}
          {date && <span>{date}</span>}
        </div>
      </header>

      {post.image && (
        <div className="site-container max-w-6xl">
          <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
            <img src={post.image} alt={title} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      <div className="site-container mt-10 max-w-3xl sm:mt-14">
        <ArticleBody content={content} />

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-7 sm:flex-row">
          <Button asChild>
            <Link href="/shop">
              {t("nav_shop")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog">{t("blog.back_to_blog")}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
