import { useRoute } from 'wouter';
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, User, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBlogPost } from '@/hooks/useApi';
import { Spinner } from '@/components/shared/LoadingStates';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

export default function BlogPostPage() {
  const reduceMotion = useReducedMotion();
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';
  const { data: post, isLoading } = useBlogPost(slug);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!post?.content) return '';
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 
        'src', 'alt', 'title', 'width', 'height',
        'class', 'id'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [post?.content]);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;

  if (!post) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="text-sm text-muted-foreground">
            Post not found.
          </div>
          <Link href="/blog">
            <Button className="mt-4 rounded-full">
              <ArrowLeft size={16} strokeWidth={2.4} /> Back to blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-40 noise" />
      
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/blog" className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} strokeWidth={2.4} /> Blog
            </span>
          </Link>
          <Link href="/shop">
            <Button className="rounded-full">
              Webshop
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
          className="space-y-12"
        >
          <header className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                {post.author}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
              {post.title}
            </h1>

            {post.image && (
              <div className="rounded-[3rem] overflow-hidden border-2 border-border/40 shadow-2xl relative group">
                <img src={post.image} alt={post.title} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            )}
          </header>

          <div 
            className="prose prose-stone prose-2xl dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <footer className="pt-16 border-t border-border/40 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                   {post.author[0]}
                </div>
                <div>
                   <p className="text-sm font-bold">{post.author}</p>
                   <p className="text-xs text-muted-foreground">Trosheen Crafts Artisan</p>
                </div>
             </div>
             <Button variant="outline" size="icon" className="rounded-full">
                <Share2 size={18} />
             </Button>
          </footer>
        </motion.article>
      </main>
    </div>
  );
}
