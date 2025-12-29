import './index.css'
import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber';
import { CardGrid } from './components/CardGrid.jsx';
import { Environment, ContactShadows } from '@react-three/drei'

export default function App() {
  const [resetTick, setResetTick] = useState(0);

  const handleReset = () => {
    setResetTick(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <Canvas
        camera={{ position: [0, 0, 7.5] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <Environment preset="forest"/>
          <CardGrid resetTick={resetTick} onReset={handleReset} />
        </Suspense>
      </Canvas>
    </div>
  );
}
