import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import Overlay from './Overlay';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function View3D({ temperature = 12, humidity = 40 }) {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <OrbitControls enableZoom={true} />
        <Model url="/Mygreenhouse.glb" />
      </Canvas>
      <Overlay temperature={temperature} humidity={humidity} />
    </div>
  );
}