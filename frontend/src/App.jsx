import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Floor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 5]}
    >
      <planeGeometry args={[30, 70]} />
      <meshStandardMaterial color="#222222" />
    </mesh>
  );
}

function Screen() {
  return (
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[18, 5, 0.3]} />
      <meshStandardMaterial color="#eeeeee" />
    </mesh>
  );
}

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 8, 18], fov: 60 }}>

        <ambientLight intensity={1} />

        <directionalLight
          position={[0, 10, 10]}
          intensity={2}
        />

        <Floor />

        <Screen />

        <OrbitControls />

      </Canvas>
    </div>
  );
}

export default App;