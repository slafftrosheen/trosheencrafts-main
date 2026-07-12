import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vibrate, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { haptics } from '@/lib/haptics';

export function HapticSettings() {
  const [config, setConfig] = useState(haptics.getConfig());

  useEffect(() => {
    setConfig(haptics.getConfig());
  }, []);

  const handleToggle = () => {
    const newEnabled = !config.enabled;
    haptics.setEnabled(newEnabled);
    setConfig({ ...config, enabled: newEnabled });

    if (newEnabled) {
      haptics.playSuccess();
    }
  };

  const handleIntensityChange = (intensity: number) => {
    haptics.setIntensity(intensity);
    setConfig({ ...config, intensity });
    haptics.playInteraction('tap');
  };

  const testTextures = () => {
    haptics.playConcreteTexture();
    setTimeout(() => haptics.playCeramicTexture(), 800);
    setTimeout(() => haptics.playWeatheredStone(), 1600);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-card border border-border/40">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Vibrate className="text-primary" size={24} />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold">Haptic Feedback</h3>
          <p className="text-sm text-muted-foreground">Feel textures as you browse</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold mb-1">Enable Vibrations</p>
            <p className="text-sm text-muted-foreground">
              Simulate material textures through haptic feedback
            </p>
          </div>
          <Button
            size="lg"
            variant={config.enabled ? "default" : "outline"}
            className="rounded-full"
            onClick={handleToggle}
          >
            {config.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {/* Intensity Slider */}
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Intensity</p>
              <span className="text-sm text-muted-foreground">
                {Math.round(config.intensity * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={config.intensity * 100}
              onChange={(e) => handleIntensityChange(Number(e.target.value) / 100)}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${config.intensity * 100}%, hsl(var(--muted)) ${config.intensity * 100}%, hsl(var(--muted)) 100%)`,
              }}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>Strong</span>
            </div>
          </motion.div>
        )}

        {/* Test Textures */}
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-6 border-t border-border/40"
          >
            <p className="font-semibold mb-4">Test Textures</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-auto py-4 flex flex-col gap-2"
                onClick={() => haptics.playConcreteTexture()}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-400" />
                <span className="text-xs">Concrete</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-auto py-4 flex flex-col gap-2"
                onClick={() => haptics.playCeramicTexture()}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-200" />
                <span className="text-xs">Ceramic</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-auto py-4 flex flex-col gap-2"
                onClick={() => haptics.playWeatheredStone()}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-600" />
                <span className="text-xs">Stone</span>
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 rounded-full"
              onClick={testTextures}
            >
              <Volume2 className="mr-2" size={16} />
              Play All Textures
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
