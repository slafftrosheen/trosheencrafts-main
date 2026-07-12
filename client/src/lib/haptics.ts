/**
 * Haptic Feedback System for Texture Simulation
 * Uses Vibration API to simulate material textures when browsing products
 */

type TexturePattern = 'smooth' | 'rough' | 'bumpy' | 'grainy' | 'soft' | 'rigid';
type InteractionType = 'tap' | 'swipe' | 'long-press' | 'hover';

interface HapticConfig {
  enabled: boolean;
  intensity: number; // 0-1
}

class HapticsManager {
  private config: HapticConfig = {
    enabled: true,
    intensity: 0.7,
  };

  private texturePatterns: Record<TexturePattern, number[]> = {
    // Vibration patterns in milliseconds [vibrate, pause, vibrate, pause...]
    smooth: [5, 50, 5],
    rough: [30, 20, 30, 20, 30],
    bumpy: [50, 30, 50, 30, 50, 30],
    grainy: [10, 10, 10, 10, 10, 10, 10],
    soft: [20, 100, 20],
    rigid: [80],
  };

  private interactionPatterns: Record<InteractionType, number[]> = {
    tap: [10],
    swipe: [5, 20, 5, 20, 5],
    'long-press': [50, 50, 50],
    hover: [3],
  };

  constructor() {
    // Check if vibration is supported
    if (typeof navigator !== 'undefined' && !('vibrate' in navigator)) {
      this.config.enabled = false;
      console.warn('Vibration API not supported on this device');
    }

    // Load user preferences from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedConfig = localStorage.getItem('haptic-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    }
  }

  /**
   * Enable or disable haptics
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * Set haptic intensity (0-1)
   */
  setIntensity(intensity: number) {
    this.config.intensity = Math.max(0, Math.min(1, intensity));
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): HapticConfig {
    return { ...this.config };
  }

  /**
   * Simulate texture feel
   */
  playTexture(texture: TexturePattern) {
    if (!this.config.enabled) return;

    const pattern = this.texturePatterns[texture];
    const adjustedPattern = this.adjustPatternIntensity(pattern);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(adjustedPattern);
    }
  }

  /**
   * Play interaction feedback
   */
  playInteraction(type: InteractionType) {
    if (!this.config.enabled) return;

    const pattern = this.interactionPatterns[type];
    const adjustedPattern = this.adjustPatternIntensity(pattern);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(adjustedPattern);
    }
  }

  /**
   * Custom vibration pattern
   */
  playCustom(pattern: number[]) {
    if (!this.config.enabled) return;

    const adjustedPattern = this.adjustPatternIntensity(pattern);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(adjustedPattern);
    }
  }

  /**
   * Stop all vibrations
   */
  stop() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  /**
   * Simulate concrete texture (primary material)
   */
  playConcreteTexture() {
    // Concrete feels rough with some grain
    this.playCustom([20, 15, 15, 15, 20, 30, 20]);
  }

  /**
   * Simulate smooth ceramic glaze
   */
  playCeramicTexture() {
    this.playTexture('smooth');
  }

  /**
   * Simulate weathered stone
   */
  playWeatheredStone() {
    this.playCustom([30, 20, 40, 15, 25, 20, 35]);
  }

  /**
   * Product card interaction
   */
  playProductCardTap() {
    this.playInteraction('tap');
  }

  /**
   * Add to cart success
   */
  playAddToCart() {
    this.playCustom([10, 50, 30]);
  }

  /**
   * Like/favorite action
   */
  playFavorite() {
    this.playCustom([5, 30, 5, 30, 15]);
  }

  /**
   * Error feedback
   */
  playError() {
    this.playCustom([50, 100, 50, 100, 50]);
  }

  /**
   * Success feedback
   */
  playSuccess() {
    this.playCustom([10, 50, 10, 50, 30]);
  }

  private adjustPatternIntensity(pattern: number[]): number[] {
    // Adjust vibration duration based on intensity setting
    return pattern.map((duration, index) => {
      // Only adjust vibration durations (odd indices), not pauses
      if (index % 2 === 0) {
        return Math.round(duration * this.config.intensity);
      }
      return duration;
    });
  }

  private saveConfig() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('haptic-config', JSON.stringify(this.config));
    }
  }
}

// Singleton instance
export const haptics = new HapticsManager();
