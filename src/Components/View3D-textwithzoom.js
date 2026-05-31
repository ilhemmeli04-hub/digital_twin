import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import Overlay from './Overlay';

function ModelWithText({ url, temperature = 12 }) {
  const group = useRef();
  const { scene } = useGLTF(url);
  const textRef = useRef();

  // Make text always face camera
  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={group}>
      {/* Main model */}
      <primitive object={scene} />
      
      {/* 3D Text attached to model */}
      <Text
        ref={textRef}
        position={[2, 0.5, 0.5]}  // Adjust to position inside your greenhouse
        fontSize={0.3}
        color="white"
        outlineWidth={0.02}
        outlineColor="black"
        anchorX="center"
        anchorY="middle"
      >
        {`T = ${temperature}°C`}
      </Text>
    </group>
  );
}

export default function View3D({ temperature = 12, humidity = 40 }) {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} />
        <ModelWithText url="/Mygreenhouse.glb" temperature={temperature} />
      </Canvas>
      
      {/* 2D Overlay with back button */}
      <Overlay temperature={temperature} humidity={humidity} />
    </div>
  );
}