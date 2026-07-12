import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { WorkshopTourPhotos } from '@/lib/imageAssets';

interface Hotspot {
  id: string;
  pitch: number;
  yaw: number;
  type: 'info' | 'navigation' | 'product';
  title: string;
  description: string;
  linkedSceneId?: string;
  imageUrl?: string;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioNarration: string;
  hotspots: Hotspot[];
}

const WORKSHOP_SCENES: Scene[] = [
  {
    id: 'entrance',
    title: 'Workshop Entrance',
    description: 'Welcome to our family workshop in Daugavpils',
    imageUrl: WorkshopTourPhotos.entrance,
    audioNarration: '/audio/narration-entrance.mp3',
    hotspots: [
      {
        id: 'entrance-info',
        pitch: -10,
        yaw: 0,
        type: 'info',
        title: 'The Workshop Door',
        description: 'Built by Oleg\'s grandfather in 1995. The worn handle has felt three generations of hands.',
      },
      {
        id: 'entrance-to-materials',
        pitch: 0,
        yaw: 90,
        type: 'navigation',
        title: 'Material Storage',
        description: 'Explore where we keep pigments, aggregates, and botanicals',
        linkedSceneId: 'materials',
      },
    ],
  },
  {
    id: 'materials',
    title: 'Material Storage',
    description: 'Pigments, minerals, and botanicals collected across Latvia',
    imageUrl: WorkshopTourPhotos.materialsArea,
    audioNarration: '/audio/narration-materials.mp3',
    hotspots: [
      {
        id: 'pigment-shelf',
        pitch: 20,
        yaw: -45,
        type: 'info',
        title: 'Natural Pigments',
        description: 'Iron oxide from Kurzeme, copper dust from old workshops, earth tones from our backyard.',
        imageUrl: WorkshopTourPhotos.materialsArea,
      },
      {
        id: 'botanicals',
        pitch: -5,
        yaw: 45,
        type: 'info',
        title: 'Pressed Botanicals',
        description: 'Fern leaves, flower petals, moss—collected seasonally and preserved for embedding.',
      },
      {
        id: 'materials-to-casting',
        pitch: 0,
        yaw: 180,
        type: 'navigation',
        title: 'Casting Area',
        description: 'See where concrete is mixed and poured',
        linkedSceneId: 'casting',
      },
    ],
  },
  {
    id: 'casting',
    title: 'Casting & Molding Station',
    description: 'Where raw materials become art',
    imageUrl: WorkshopTourPhotos.castingStation,
    audioNarration: '/audio/narration-casting.mp3',
    hotspots: [
      {
        id: 'mixing-table',
        pitch: -20,
        yaw: 0,
        type: 'info',
        title: 'Mixing Table',
        description: 'Concrete is mixed by hand here. No two batches are identical—each has its own character.',
      },
      {
        id: 'molds',
        pitch: 10,
        yaw: 120,
        type: 'product',
        title: 'Heart Candle Molds',
        description: 'Silicone molds for our bestselling heart vessel candles. Cast weekly.',
      },
      {
        id: 'casting-to-finishing',
        pitch: 0,
        yaw: -90,
        type: 'navigation',
        title: 'Finishing Studio',
        description: 'Visit the painting and burnishing area',
        linkedSceneId: 'finishing',
      },
    ],
  },
  {
    id: 'finishing',
    title: 'Finishing & Painting Studio',
    description: 'Hand-painted patinas and burnished edges',
    imageUrl: WorkshopTourPhotos.finishingStudio,
    audioNarration: '/audio/narration-finishing.mp3',
    hotspots: [
      {
        id: 'painting-station',
        pitch: 5,
        yaw: 30,
        type: 'info',
        title: 'Painting Station',
        description: 'Copper and bronze oxides are applied layer by layer with grandfather\'s brushes.',
      },
      {
        id: 'burnishing-tools',
        pitch: -15,
        yaw: -60,
        type: 'info',
        title: 'Burnishing Tools',
        description: 'Steel tools used to polish edges until they catch light. A 30-minute meditation per piece.',
      },
      {
        id: 'finished-display',
        pitch: 10,
        yaw: 150,
        type: 'product',
        title: 'Ready for Shipping',
        description: 'Completed pieces waiting to find their homes.',
        imageUrl: WorkshopTourPhotos.completedPieces,
      },
    ],
  },
];

export function VirtualWorkshopTour() {
  const [currentSceneId, setCurrentSceneId] = useState('entrance');
  const currentScene = WORKSHOP_SCENES.find(s => s.id === currentSceneId) || WORKSHOP_SCENES[0];

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation' && hotspot.linkedSceneId) {
      setCurrentSceneId(hotspot.linkedSceneId);
    }
    // Handle other types if needed (info modal, product link)
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation': return ArrowRight;
      case 'product': return ShoppingBag;
      default: return Info;
    }
  };

  return (
    <div className="relative w-full min-h-[600px] bg-black text-white overflow-hidden rounded-xl shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image - Simulating 360 view with static image for now */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${currentScene.imageUrl})` }}>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 pointer-events-none">
            <div className="max-w-xl">
              <h2 className="text-4xl font-serif font-bold mb-2 text-white drop-shadow-lg">{currentScene.title}</h2>
              <p className="text-lg text-white/90 drop-shadow-md">{currentScene.description}</p>
            </div>

            {/* Hotspots List (as interactive elements at bottom since we don't have 3D coords logic) */}
            <div className="flex gap-4 overflow-x-auto pb-4 pointer-events-auto">
              {currentScene.hotspots.map((hotspot) => {
                const Icon = getHotspotIcon(hotspot.type);
                return (
                  <button
                    key={hotspot.id}
                    onClick={() => handleHotspotClick(hotspot)}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg p-4 transition-all min-w-[200px] text-left"
                  >
                    <div className="p-2 bg-primary rounded-full">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{hotspot.title}</p>
                      <p className="text-xs text-white/70 line-clamp-1">{hotspot.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
