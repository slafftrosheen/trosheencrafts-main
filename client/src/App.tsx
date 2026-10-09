import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/LanguageContext";
import { Layout } from "@/components/shared/Layout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/shared/LoadingStates";

const Home = lazy(() => import("@/pages/home"));
const Shop = lazy(() => import("@/pages/shop"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const OrderConfirmation = lazy(() => import("@/pages/order-confirmation"));
const OrderTracking = lazy(() => import("@/pages/order-tracking"));
const Contact = lazy(() => import("@/pages/contact"));
const About = lazy(() => import("@/pages/about"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const Gallery = lazy(() => import("@/pages/gallery"));
const GalleryDetail = lazy(() => import("@/pages/galleryDetail"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Cookies = lazy(() => import("@/pages/cookies"));
const Withdrawal = lazy(() => import("@/pages/withdrawal"));
const Guide = lazy(() => import("@/pages/guide"));
const NotFound = lazy(() => import("@/pages/not-found"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminBlog = lazy(() => import("@/pages/admin/Blog"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminInventory = lazy(() => import("@/pages/admin/Inventory"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminGallery = lazy(() => import("@/pages/admin/Gallery"));
const AdminPromotions = lazy(() => import("@/pages/admin/Promotions"));
const AdminNewsletterSubscribers = lazy(() => import("@/pages/admin/NewsletterSubscribers"));
const AdminConstructor = lazy(() => import("@/pages/admin/ConstructorConfig"));
const AdminHomepageMedia = lazy(() => import("@/pages/admin/HomepageMedia"));

function Router() {
  const [location] = useLocation();
  const loadingText = location.startsWith("/admin") ? "Загрузка..." : undefined;

  return (
    <Suspense fallback={<PageLoader text={loadingText} />}>
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin"><AdminLayout><AdminDashboard /></AdminLayout></Route>
        <Route path="/admin/promotions"><AdminLayout><AdminPromotions /></AdminLayout></Route>
        <Route path="/admin/homepage-media"><AdminLayout><AdminHomepageMedia /></AdminLayout></Route>
        <Route path="/admin/subscribers"><AdminLayout><AdminNewsletterSubscribers /></AdminLayout></Route>
        <Route path="/admin/products"><AdminLayout><AdminProducts /></AdminLayout></Route>
        <Route path="/admin/constructor"><AdminLayout><AdminConstructor /></AdminLayout></Route>
        <Route path="/admin/orders"><AdminLayout><AdminOrders /></AdminLayout></Route>
        <Route path="/admin/messages"><AdminLayout><AdminMessages /></AdminLayout></Route>
        <Route path="/admin/blog"><AdminLayout><AdminBlog /></AdminLayout></Route>
        <Route path="/admin/gallery"><AdminLayout><AdminGallery /></AdminLayout></Route>
        <Route path="/admin/analytics"><AdminLayout><AdminAnalytics /></AdminLayout></Route>
        <Route path="/admin/settings"><AdminLayout><AdminSettings /></AdminLayout></Route>
        <Route path="/admin/inventory"><AdminLayout><AdminInventory /></AdminLayout></Route>
        <Route path="/admin/categories"><AdminLayout><AdminCategories /></AdminLayout></Route>

        <Route path="/"><Layout><Home /></Layout></Route>
        <Route path="/shop"><Layout><Shop /></Layout></Route>
        <Route path="/shop/:id"><Layout><ProductDetail /></Layout></Route>
        <Route path="/gallery"><Layout><Gallery /></Layout></Route>
        <Route path="/gallery/:slug"><Layout><GalleryDetail /></Layout></Route>
        <Route path="/cart"><Layout><Cart /></Layout></Route>
        <Route path="/checkout"><Layout><Checkout /></Layout></Route>
        <Route path="/order-confirmation"><Layout><OrderConfirmation /></Layout></Route>
        <Route path="/order/:id"><Layout><OrderTracking /></Layout></Route>
        <Route path="/blog"><Layout><Blog /></Layout></Route>
        <Route path="/blog/:slug"><Layout><BlogPost /></Layout></Route>
        <Route path="/contact"><Layout><Contact /></Layout></Route>
        <Route path="/about"><Layout><About /></Layout></Route>
        <Route path="/guide"><Layout><Guide /></Layout></Route>
        <Route path="/privacy"><Layout><Privacy /></Layout></Route>
        <Route path="/terms"><Layout><Terms /></Layout></Route>
        <Route path="/cookies"><Layout><Cookies /></Layout></Route>
        <Route path="/withdrawal"><Layout><Withdrawal /></Layout></Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Router />
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
