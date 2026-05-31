
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Center } from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

// ==========================
// STATUS CIRCLE
// ==========================
function StatusCircle({ position, status }) {
const meshRef = useRef();

useFrame(({ camera }) => {
if (meshRef.current) {
meshRef.current.quaternion.copy(camera.quaternion);
}
});

return (
<mesh position={position} ref={meshRef}>
<circleGeometry args={[0.08, 32]} />
<meshBasicMaterial
color={status ? '#00ff00' : '#ff0000'}
transparent
opacity={0.8}
/>
</mesh>
);
}

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
// --- هنا تكتبي وظيفة Led الجديدة بالتحسينات ---
  const Led = React.memo(function Led({
  position,
  active,
  icon,
  label
}) {
  const color = active ? "#00ff00" : "#ff0000";
    return (
      <group position={position}>
        {/* الدائرة المضيئة */}
        <mesh>
          <circleGeometry args={[0.04, 32]} />
          <meshBasicMaterial
            color={active ? "#00ff00" : "#ff0000"}
            transparent
            opacity={0.8}
            depthTest={false}
          />
        </mesh>

        {/* الهالة */}
        <mesh position={[0, 0, -0.002]}>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial
            color={active ? "#00ff00" : "#ff0000"}
            transparent
            opacity={0.2}
            depthTest={false}
          />
        </mesh>

        {/* الأيقونة بدقة عالية */}
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

        {/* اسم الجهاز بدقة عالية */}
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

        {/* حالة التشغيل (ON/OFF) */}
        <Text
          position={[0, -0.14, 0.01]}
          fontSize={0.35}
          scale={[0.1, 0.1, 0.1]}
          color={active ? "#28e028" : "#be4949"}
          anchorX="center"
          depthOffset={-1}
        >
          {active ? "(ON)" : "(OFF)"}
        </Text>
      </group>
  );
  });

function IndicatorPanel({
  heaterOn,
  humidifierOn,
  envTemp
}) {

  const ventilatorOn = heaterOn || humidifierOn;
  const incubatorLedOn = envTemp >= 35 || envTemp <= 22;

  

  // --- هنا ترسم اللوحة في مكانها الصحيح ---
  return (
    <group
      position={[0.40, -0.41, 0.83]} 
      rotation={[-0.40, 0, 0]} 
    >
      <Led position={[-0.35, 0, 0]} active={ventilatorOn} icon="🌀" label="VENTILATOR" />
      <Led position={[-0.12, 0, 0]} active={humidifierOn} icon="💧" label="HUMIDIFIER" />
      <Led position={[0.12, 0, 0]} active={heaterOn} icon="🔥" label="HEATER" />
      <Led position={[0.35, 0, 0]} active={incubatorLedOn} icon="💡" label="LED" />
    </group>
  );
}
// ==========================
// MODEL
// ==========================
function ModelWithIndicators({ url,
heaterOn,
humidifierOn,
temperature,
humidity,
setHeaterOn,
setHumidifierOn,
setTemperature,
setHumidity,envTemp, setEnvTemp,
  oxygen, setOxygen,
  heartRate, setHeartRate }) {
const { scene } = useGLTF(url);
const originalBabyColor = useRef();
const originalIncubatorColor = useRef();
const babyRef = useRef();
const incubatorRef = useRef([]);
const group = useRef();


   useEffect(() => {
  //async;m3nha function tstna les donnes yjo mn intrnet api
  const fetchData = async () => {
    //ydir try ida sra prblm yroh ll catch
    try {

      const response = await fetch("http://127.0.0.1:5000/data"); //njib akhir bayanat 

      const data = await response.json();

      // القيم الحقيقية القادمة من Python
      setTemperature(data.temp_core || 0);

      setHumidity(data.hum || 0);

      setEnvTemp(data.temp || 0);

      setOxygen(data.oxy || 0);

      setHeartRate(data.heart_rate || 0);

      // حالات الأجهزة
      setHeaterOn(data.heater === 1);

      setHumidifierOn(data.fan === 1);

    } catch (error) {

      console.error("Erreur API:", error);

    }

  };

  fetchData();

  const interval = setInterval(fetchData, 1000); //t7dith kol 1s

  return () => clearInterval(interval); //ki ngl9 safha yhbs t7dith fih

}, []);
  // 3. تغيير لون الطفل 
 useEffect(() => {

  const glassParts = [];

  scene.traverse((child) => {

    if (child.isMesh) {

      // 👶 الطفل detection
      if (!babyRef.current && child.position.y > -0.5 && child.position.y < 1) {
        babyRef.current = child;
        child.material = child.material.clone();
        originalBabyColor.current = child.material.color.clone();
      }

      // 👁️ استثناء العينين بالاسم
      if (child.name && child.name.toLowerCase().includes("eye")) return;

      // 📏 استثناء العينين بالحجم
      const size = new THREE.Box3()
        .setFromObject(child)
        .getSize(new THREE.Vector3());

      if (size.x < 0.5 && size.y < 0.5 && size.z < 0.5) return;

      // ❌ استثناء البيبي
      let parent = child.parent;
      while (parent) {
        if (babyRef.current && parent === babyRef.current) return;
        parent = parent.parent;
      }

      // 🟦 glass
      if (
        child.material &&
        (child.material.transparent || child.material.opacity < 1)
      ) {

        if (child.geometry.type === "SphereGeometry") return;

        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.3;

        glassParts.push(child);
      }
    }

  });

  incubatorRef.current = glassParts;

  console.log("✅ Glass refreshed:", glassParts.length);

}, [scene]);
  useEffect(() => {
    if (!babyRef.current) return;
    if (temperature >= 38) babyRef.current.material.color.set("#ce0707");
    else if (temperature >= 36 && temperature < 38) babyRef.current.material.color.set("#eb892d");
    else if (temperature <= 32) babyRef.current.material.color.set("blue");
    else babyRef.current.material.color.copy(originalBabyColor.current);
    babyRef.current.material.needsUpdate = true;
  }, [temperature]);
   
useEffect(() => {
  if (!incubatorRef.current.length) return;

  incubatorRef.current.forEach((mesh) => {
    const mat = mesh.material;

    mat.transparent = true;
    mat.blending = THREE.NormalBlending;
    mat.depthWrite = false;
    

    if (envTemp >= 35) {
      mat.color.set("#ff0000");
      mat.emissive = new THREE.Color("#220000"); // يعطي glow خفيف
      mat.opacity = 0.2;
    } 
    else if (envTemp <= 22) {
      mat.color.set("#0000ff");
      mat.emissive = new THREE.Color("#000022");
      mat.opacity = 0.2;
    } 
    else {
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

    {/* سطر واحد يحتوي على كل المعلومات بشكل أفقي */}
    <CameraFacingText position={[0, 0.7, 0]} fontSize={0.12} color="#173357">
      {`💓Fre_Car ${Math.round(heartRate)} bpm | O₂ Oxyg ${oxygen.toFixed(1)}% | 🌡️ T_core ${temperature.toFixed(1)}°C | 🌡️ T_Env: ${envTemp.toFixed(1)}°C | 💧 ${humidity.toFixed(1)}%`}
    </CameraFacingText>

  </group>
);
}

// ==========================
// MAIN VIEW
// ==========================
export default function View3D() {
  const [heaterOn, setHeaterOn] = useState(true);
  const [humidifierOn, setHumidifierOn] = useState(false);
  const [temperature, setTemperature] = useState(32);
  const [humidity, setHumidity] = useState(60);
  
  const [envTemp, setEnvTemp] = useState(28);
  const [oxygen, setOxygen] = useState(21);
  const [heartRate, setHeartRate] = useState(125);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 50}}>  
        <ambientLight intensity={0.6} />  
        <pointLight position={[10, 10, 10]} />
        <OrbitControls target={[0, 0.5, 0]} />
        
        {/* 2. مرري القيم الجديدة للمودل هنا */}
        <ModelWithIndicators   
          url="/Incubator.glb"  
          heaterOn={heaterOn} setHeaterOn={setHeaterOn}
          humidifierOn={humidifierOn} setHumidifierOn={setHumidifierOn}
          temperature={temperature} setTemperature={setTemperature}
          humidity={humidity} setHumidity={setHumidity}
          envTemp={envTemp} setEnvTemp={setEnvTemp}
          oxygen={oxygen} setOxygen={setOxygen}
          heartRate={heartRate} setHeartRate={setHeartRate}
        />
        <IndicatorPanel
  heaterOn={heaterOn}
  humidifierOn={humidifierOn}
  envTemp={envTemp}
/>
      </Canvas>

      {/* 3. تحديث قائمة الـ Dashboard */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px',
        background: 'rgba(0,0,0,0.7)', padding: '15px',
        borderRadius: '10px', color: 'white'
      }}>
        <div>💓 Heart: {Math.round(heartRate)} bpm</div>
        <div>💨 Oxygen: {oxygen.toFixed(1)}%</div>
        <div>🌡️ Env Temp: {envTemp.toFixed(1)}°C</div>
        <hr />
      
    
  


<div style={{ marginBottom: '10px' }}>  
    🔥 Heater:   
    <span style={{ color: heaterOn ? 'lime' : 'red' }}>  
      {heaterOn ? `ON (${temperature.toFixed(1)}°C)` : 'OFF'}  
    </span>  
  </div>    <div>  
    💧 Humidifier:   
    <span style={{ color:(humidifierOn || temperature >=36) ? 'lime' : 'red' }}>  
      {(humidifierOn || temperature >=36) ? `ON (${humidity.toFixed(1)}%)`: 'OFF'}  
    </span>  
  </div>  
</div>  

<div style={{
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column', // يضع المجموعات فوق بعضها
  gap: '10px',
  zIndex: 1000 // يضمن ظهورها فوق الـ Canvas
}}>
  
  {/* أزرار حرارة الطفل */}
  <div style={{ display: 'flex', gap: '10px' }}>
    <button onClick={() => setTemperature(40)}>🔥 Augmenter T_baby</button>
    <button onClick={() => setTemperature(30)}>❄️ Réduire T_baby</button>
    <button onClick={() => setTemperature(35)}>🙂 Baby Normal</button>
  </div>

  {/* أزرار حرارة الحاضنة */}
  <div style={{ display: 'flex', gap: '10px' }}>
    <button onClick={() => setEnvTemp(40)} style={{ border: '2px solid red' }}>🌡️ Test Env Hot (Red)</button>
    <button onClick={() => setEnvTemp(28)}>✅ Env Normal</button>
    <button onClick={() => setEnvTemp(15)} style={{ border: '2px solid blue' }}>❄️ Test Env Cold (Blue)</button>
  </div>
</div>

      {/* Back Button */}  
      <Link  
        to="/"  
        style={{  
          position: 'absolute',  
          top: '20px',  
          left: '20px',  
          padding: '10px 20px',  
          backgroundColor: 'rgba(0,0,0,0.7)',  
          color: 'white',  
          borderRadius: '5px',  
          textDecoration: 'none',  
          zIndex: 100  
        }}  
      >  
        ← Back  
      </Link> 
      

       </div>

);
}
