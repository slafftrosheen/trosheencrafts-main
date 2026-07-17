import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Center } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

interface CandlePreview3DProps {
  shapeKey: string;
  colorHex: string;
}

export function CandlePreview3D({ shapeKey, colorHex }: CandlePreview3DProps) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colorHex || '#e0d8cc',
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [colorHex]);

  const renderShape = () => {
    // Map basic keys to shapes. Fallback to a cylinder (classic candle).
    const key = shapeKey.toLowerCase();
    if (key.includes('sphere')) {
      return <sphereGeometry args={[1, 64, 64]} />;
    } else if (key.includes('geo') || key.includes('cube')) {
      return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    } else if (key.includes('tall')) {
      return <cylinderGeometry args={[0.6, 0.6, 2.5, 32]} />;
    } else {
      return <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />;
    }
  };

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 2, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} contactShadow opacity={0.5}>
            <Float
              speed={2} // Animation speed
              rotationIntensity={0.5} // XYZ rotation intensity
              floatIntensity={0.5} // Up/down float intensity
            >
              <Center>
                <mesh castShadow receiveShadow material={material}>
                  {renderShape()}
                </mesh>
              </Center>
            </Float>
          </Stage>
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
