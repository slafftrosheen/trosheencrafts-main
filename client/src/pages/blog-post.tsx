import { motion, useReducedMotion } from "framer-motion";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useQuery } from '@tanstack/react-query';
import React from "react";

function parseInline(text: string): React.ReactNode {
  // Split by bold markers (**text**)
  const parts = text.split(/(\$\$\*\*[^\*]+\$\$\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function SimpleMarkdown({ content }: { content: string }) {
  // Split by double newlines to get blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("# ")) {
           return <h1 key={i} className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-8 mb-4">{trimmed.substring(2)}</h1>;
        }
        if (trimmed.startsWith("## ")) {
           return <h2 key={i} className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-8 mb-4">{trimmed.substring(3)}</h2>;
        }
        if (trimmed.startsWith("### ")) {
           return <h3 key={i} className="text-xl md:text-2xl font-serif font-bold text-foreground mt-6 mb-3">{trimmed.substring(4)}</h3>;
        }
        if (trimmed.startsWith("---")) {
           return <hr key={i} className="my-8 border-border/40" />;
        }
        if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.includes("\n")) {
           // Italic block (e.g. caption or footer)
           return <p key={i} className="italic text-base opacity-80">{trimmed.replace(/^\*|\*$/g, "")}</p>;
        }

        // Lists
        if (trimmed.startsWith("- ")) {
           const items = trimmed.split("\n").map(item => item.replace(/^- /, ""));
           return (
             <ul key={i} className="list-disc pl-6 space-y-2 mb-6">
               {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
             </ul>
           );
        }

        // Numbered lists
        if (trimmed.match(/^\d+\. /)) {
           const items = trimmed.split("\n").map(item => item.replace(/^\d+\. /, ""));
           return (
             <ol key={i} className="list-decimal pl-6 space-y-2 mb-6">
               {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
             </ol>
           );
        }

        // Images: ![alt](url)
        if (trimmed.startsWith("![") && trimmed.includes("](")) {
          const altMatch = trimmed.match(/!\[(.*?)\]/);
          const urlMatch = trimmed.match(/\((.*?)\)/);
          if (urlMatch) {
             return <img key={i} src={urlMatch[1]} alt={altMatch ? altMatch[1] : ''} className="rounded-2xl w-full object-cover my-6 shadow-xl border border-border/40 max-h-[600px]" />;
          }
        }

        // Standard Paragraph
        return <p key={i}>{parseInline(trimmed)}</p>;
      })}
    </div>
  );
}

export default function BlogPostPage() {
  const reduceMotion = useReducedMotion();
  const [, params] = useRoute("/blog/:slug");
  const { language, t } = useLanguage();
  const slug = params?.slug;

  // Fetch blog post from API
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!slug, 
    staleTime: 5 * 60 * 1000, 
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("blog.loading")}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="text-sm text-muted-foreground">
            {t("blog.post_not_found")}
          </div>
          <Link href="/blog">
            <Button className="mt-4 rounded-full">
              <ArrowLeft size={16} strokeWidth={2.4} /> {t("blog.back_to_blog")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = post?.titleTranslations?.[language] || post?.title;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/blog" className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} strokeWidth={2.4} /> {t("nav_blog")}
            </span>
          </Link>
          <Link href="/shop">
            <Button className="rounded-full">
              {t("nav_shop")}
              <ArrowRight size={16} strokeWidth={2.4} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.2rem] border border-border/70 bg-card/60 p-8 md:p-12"
        >
          <div className="pointer-events-none absolute inset-0 halo opacity-70" />
          <div className="pointer-events-none absolute inset-0 opacity-60 noise" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                {post?.category}
              </span>
              <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                {post?.publishedAt ? new Date(post.publishedAt).toLocaleDateString(language) : post?.date}
              </div>
            </div>

            <h1 className="mt-2 font-serif text-4xl md:text-5xl font-bold tracking-tight mb-8 text-balance">
              {title}
            </h1>

            {post?.image && (
              <img 
                src={post.image} 
                alt={title} 
                className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl mb-12 shadow-xl border border-border/40"
              />
            )}

            <div className="mt-8">
              <SimpleMarkdown content={typeof post?.content === 'object' ? post.content[language] || post.content.en || '' : post?.content || ''} />
            </div>

            <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap items-center gap-4">
              <Link href="/shop">
                <Button className="rounded-full h-12 px-6">
                  {t("blog.browse")} {t("nav_shop")}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" className="rounded-full h-12 px-6">
                  {t("blog.back_to_story")}
                </Button>
              </Link>
            </div>
          </div>
        </motion.article>
      </main>
    </div>
  );
}