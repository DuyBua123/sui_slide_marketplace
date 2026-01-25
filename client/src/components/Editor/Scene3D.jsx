import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Float } from "@react-three/drei";
import { Suspense } from "react";

const Model = ({ modelType, color }) => {
    // In a real app, we would load GLTF models here.
    // For this demo, we use R3F/Three primitives to simulate models.

    if (modelType === "cube") {
        return (
            <mesh>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
            </mesh>
        );
    }

    if (modelType === "sphere") {
        return (
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.6} />
            </mesh>
        );
    }

    // Ring/Torus
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.4, 16, 100]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
        </mesh>
    );
};

export const Scene3D = ({ modelUrl, color = "cyan" }) => {
    // modelUrl in this MVP acts as the "type" identifier (cube, sphere, ring)
    return (
        <div className="w-full h-full">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                            <Model modelType={modelUrl} color={color} />
                        </Float>
                    </Stage>
                    <OrbitControls makeDefault autoRotate autoRotateSpeed={2} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Scene3D;
