
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  materials: string[];
  tags: string[];
  imageUrl: string;
}

interface ProductRecommendation {
  productId: string;
  score: number;
}

class RecommendationEngine {
  private products: Map<string, Product> = new Map();

  registerProduct(product: Product) {
    this.products.set(product.id, product);
  }

  getRecommendations(currentProductId: string, count: number): ProductRecommendation[] {
    // Mock implementation: return other products in the same category
    const current = this.products.get(currentProductId);
    if (!current) return [];

    return Array.from(this.products.values())
      .filter(p => p.id !== currentProductId && p.category === current.category)
      .slice(0, count)
      .map(p => ({ productId: p.id, score: 0.8 }));
  }

  getComplementaryProducts(currentProductId: string, count: number): ProductRecommendation[] {
    // Mock implementation: return products from other categories
    const current = this.products.get(currentProductId);
    if (!current) return [];

    return Array.from(this.products.values())
      .filter(p => p.id !== currentProductId && p.category !== current.category)
      .slice(0, count)
      .map(p => ({ productId: p.id, score: 0.7 }));
  }

  getTrending(count: number): string[] {
    // Mock implementation: return first 'count' products
    return Array.from(this.products.keys()).slice(0, count);
  }

  getFrequentlyBoughtTogether(currentProductId: string, count: number): string[] {
    // Mock implementation
    return this.getComplementaryProducts(currentProductId, count).map(p => p.productId);
  }
}

export const recommendationEngine = new RecommendationEngine();
