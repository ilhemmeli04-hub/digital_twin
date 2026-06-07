import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import Navigation from './Navigation';

// ==========================
// TEXT FACE CAMERA
// ==========================
function CameraFacingText({ position, children, fontSize = 0.12, color = "white" }) {
  const textRef = useRef();

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <Text  
      ref={textRef}  
      position={position}  
      fontSize={fontSize}  
      color={color}  
      anchorX="center"  
      anchorY="middle"  
      outlineWidth={0.005}  
      outlineColor="black"  
    >
      {children}
    </Text>
  );
}

// ==========================
// LED COMPONENT
// ==========================
const Led = React.memo(function Led({ position, active, icon, label }) {
  return (
    <group position={position}>
      {/* chakl daiira*/}
      <mesh>
        <circleGeometry args={[0.04, 32]} />
        <meshBasicMaterial
          color={active ? "#00ff00" : "#ff0000"}
          transparent
          opacity={0.8}
          depthTest={false}
        />
      </mesh>

    
      <mesh position={[0, 0, -0.002]}>
        <circleGeometry args={[0.07, 32]} />
        <meshBasicMaterial
          color={active ? "#00ff00" : "#ff0000"}
          transparent
          opacity={0.2}
          depthTest={false}
        />
      </mesh>

      {/* الأيقونة */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.05} 
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="black"
        renderOrder={1}
        depthTest={false}
      >
        {icon}
      </Text>

      {/* */}
      <Text
        position={[0, -0.09, 0.01]}
        fontSize={0.035} 
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="black"
        renderOrder={1}
        depthTest={false}
      >
        {label}
      </Text>

      {/* حالة التشغيل */}
      <Text
        position={[0, -0.14, 0.01]}
        fontSize={0.35}
        scale={[0.1, 0.1, 0.1]}
        color={active ? "#28e028" : "#be4949"}
        anchorX="center"
        depthOffset={-1}
      >
        {active ? "ON" : "OFF"}
      </Text>
    </group>
  );
});

// ==========================
// INDICATOR PANEL
// ==========================
function IndicatorPanel({ heaterOn, humidifierOn, envTemp }) {
  const ventilatorOn = heaterOn || humidifierOn;
  const incubatorLedOn = envTemp >= 35 || envTemp <= 22;

  return (
    <group position={[0.40, -0.41, 0.83]} rotation={[-0.40, 0, 0]}>
      <Led position={[-0.35, 0, 0]} active={ventilatorOn} icon="🌀" label="VENTILATOR" />
      <Led position={[-0.12, 0, 0]} active={humidifierOn} icon="💧" label="HUMIDIFIER" />
      <Led position={[0.12, 0, 0]} active={heaterOn} icon="🔥" label="HEATER" />
      <Led position={[0.35, 0, 0]} active={incubatorLedOn} icon="💡" label="LED" />
    </group>
  );
}

// ==========================
// MODEL WITH INDICATORS
// ==========================
function ModelWithIndicators({ 
  url, heaterOn, humidifierOn, temperature, humidity, envTemp, oxygen, heartRate 
}) {
  const { scene } = useGLTF(url);
  const originalBabyColor = useRef();
  const babyRef = useRef();
  const incubatorRef = useRef([]);
  const group = useRef();

  // position core baby et incubator
  useEffect(() => {
    const glassParts = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        if (!babyRef.current && child.position.y > -0.5 && child.position.y < 1) {
          babyRef.current = child;
          child.material = child.material.clone();
          originalBabyColor.current = child.material.color.clone();
        }

        if (child.name && child.name.toLowerCase().includes("eye")) return;

        const size = new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
        if (size.x < 0.5 && size.y < 0.5 && size.z < 0.5) return;

        let parent = child.parent;
        while (parent) {
          if (babyRef.current && parent === babyRef.current) return;
          parent = parent.parent;
        }

        if (child.material && (child.material.transparent || child.material.opacity < 1)) {
          if (child.geometry.type === "SphereGeometry") return;
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.3;
          glassParts.push(child);
        }
      }
    });
    incubatorRef.current = glassParts;
  }, [scene]);

  // تغيير لون مجسم الرضيع بناءً على قراءة الحساسات الفعلية (Core Temp)
  useEffect(() => {
    if (!babyRef.current) return;
    if (temperature >= 38) babyRef.current.material.color.set("#ce0707");
    else if (temperature >= 36 && temperature < 38) babyRef.current.material.color.set("#eb892d");
    else if (temperature <= 32) babyRef.current.material.color.set("blue");
    else babyRef.current.material.color.copy(originalBabyColor.current);
    babyRef.current.material.needsUpdate = true;
  }, [temperature]);
   
  // تغيير لون زجاج الحاضنة بناءً على درجة حرارة الحاضنة الفعلية (Env Temp)
  useEffect(() => {
    if (!incubatorRef.current.length) return;
    incubatorRef.current.forEach((mesh) => {
      const mat = mesh.material;
      mat.transparent = true;
      mat.blending = THREE.NormalBlending;
      mat.depthWrite = false;

      if (envTemp >= 35) {
        mat.color.set("#ff0000");
        mat.emissive = new THREE.Color("#220000");
        mat.opacity = 0.2;
      } else if (envTemp <= 22) {
        mat.color.set("#0000ff");
        mat.emissive = new THREE.Color("#000022");
        mat.opacity = 0.2;
      } else {
        mat.color.set("#ffffff");
        mat.emissive = new THREE.Color("#000000");
        mat.opacity = 0.15;
      }
      mat.needsUpdate = true;
    });
  }, [envTemp]);

  return (
    <group ref={group}>
      <group scale={0.006} position={[0, 0, 0]}>
        <primitive object={scene} />
      </group>

      {/*valure sensor fo9 baby */}
      <CameraFacingText position={[0, 0.7, 0]} fontSize={0.12} color="#173357">
        {`💓 Heart: ${Math.round(heartRate)} bpm | O₂: ${oxygen.toFixed(1)}% | 🧠 Core: ${temperature.toFixed(1)}°C | 🌡️ Env: ${envTemp.toFixed(1)}°C | 💧 Hum: ${humidity.toFixed(1)}%`}
      </CameraFacingText>
    </group>
  );
}

// ==========================
// MAIN VIEW
// ==========================
export default function View3D() {
  const [heaterOn, setHeaterOn] = useState(false);
  const [humidifierOn, setHumidifierOn] = useState(false);
  const [temperature, setTemperature] = useState(36.5);
  const [humidity, setHumidity] = useState(60);
  const [envTemp, setEnvTemp] = useState(28);
  const [oxygen, setOxygen] = useState(21);
  const [heartRate, setHeartRate] = useState(120);

  // دالة جلب البيانات الحقيقية من الـ API الخاص بالبايثون
  const fetchLiveValues = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/data'); // جلب سطر البيانات الحالي 
      if (response.ok) {
        const data = await response.json();
        if (data && !data.message) {
          // تحديث قراءات الحساسات الفعلية القادمة من الـ ESP32
          setTemperature(Number(data.temp_core || 36.5));
          setHumidity(Number(data.hum || 60));
          setEnvTemp(Number(data.temp || 28));
          setOxygen(Number(data.oxy || 21));
          setHeartRate(Number(data.heart_rate || 120));

          // تحديث حالات المخرجات الفعلية (1 تعني شغال، 0 تعني منطفئ)
          setHeaterOn(data.heater === 1);
          setHumidifierOn(data.fan === 1); 
        }
      }
    } catch (error) {
      console.error("Error fetching data from Flask server:", error);
    }
  };

  // جلب دوري حقيقي للبيانات كل 2 ثانية 
  useEffect(() => {
    fetchLiveValues();
    const interval = setInterval(fetchLiveValues, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        right: '20px', 
        zIndex: 110 
      }}>
        <Navigation />
      </div>
      <Canvas camera={{ position: [0, 2, 6], fov: 50}}>  
        <ambientLight intensity={0.6} />  
        <pointLight position={[10, 10, 10]} />
        <OrbitControls target={[0, 0.5, 0]} />
        
        <ModelWithIndicators   
          url="/Incubator.glb"  
          heaterOn={heaterOn}
          humidifierOn={humidifierOn}
          temperature={temperature}
          humidity={humidity}
          envTemp={envTemp}
          oxygen={oxygen}
          heartRate={heartRate}
        />
        <IndicatorPanel
          heaterOn={heaterOn}
          humidifierOn={humidifierOn}
          envTemp={envTemp}
        />
      </Canvas>

      {/* لوحة عرض البيانات الجانبية (Dashboard) - تحديث حقيقي */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px',
        background: 'rgba(0,0,0,0.7)', padding: '15px',
        borderRadius: '10px', color: 'white', fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>🔴 Live ESP32 Monitor</div>
        <div>💓 Heart: {Math.round(heartRate)} bpm</div>
        <div>💨 Oxygen: {oxygen.toFixed(1)}%</div>
        <div>🌡️ Env Temp: {envTemp.toFixed(1)}°C</div>
        <div>🧠 Core Temp: {temperature.toFixed(1)}°C</div>
        <hr style={{ opacity: 0.3, margin: '10px 0' }} />
        
        <div style={{ marginBottom: '10px' }}>  
          🔥 Heater:   
          <span style={{ color: heaterOn ? 'lime' : 'red', marginLeft: '5px', fontWeight: 'bold' }}>  
            {heaterOn ? "ON" : "OFF"}  
          </span>  
        </div>    
        <div>  
          💧 Humidifier:   
          <span style={{ color: humidifierOn ? 'lime' : 'red', marginLeft: '5px', fontWeight: 'bold' }}>  
            {humidifierOn ? "ON" : "OFF"}  
          </span>  
        </div>  
      </div>  

    </div>
  );
}