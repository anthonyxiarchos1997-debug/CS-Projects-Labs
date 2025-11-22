"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Building({ position, height }: { position: [number, number, number]; height: number }) {
    const mesh = useRef<THREE.Mesh>(null);

    // Random neon color
    const color = useMemo(() => {
        const colors = ["#00f3ff", "#bc13fe", "#ff00ff", "#0066ff"];
        return colors[Math.floor(Math.random() * colors.length)];
    }, []);

    return (
        <mesh position={position} ref={mesh}>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial
                color="black"
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
                wireframe
            />
        </mesh>
    );
}

function City() {
    const buildings = useMemo(() => {
        const items = [];
        const size = 10;
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                if (Math.random() > 0.7) {
                    const height = Math.random() * 5 + 1;
                    items.push({ position: [x * 1.5, height / 2, z * 1.5] as [number, number, number], height });
                }
            }
        }
        return items;
    }, []);

    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.001;
        }
    });

    return (
        <group ref={group}>
            {buildings.map((b, i) => (
                <Building key={i} position={b.position} height={b.height} />
            ))}
            {/* Ground Grid */}
            <gridHelper args={[40, 40, 0x00f3ff, 0x1a1a1a]} position={[0, 0, 0]} />
        </group>
    );
}

export function ThreatSkyline() {
    return (
        <div className="w-full h-full min-h-[300px] relative rounded-sm overflow-hidden border border-white/10 bg-black/50">
            <div className="absolute top-4 left-4 z-10">
                <div className="text-xs text-neon-cyan font-orbitron tracking-widest">LIVE THREAT TOPOLOGY</div>
                <div className="text-[10px] text-muted-foreground">SECTOR 7 // ACTIVE</div>
            </div>
            <Canvas>
                <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <City />
                <fog attach="fog" args={['#020204', 10, 40]} />
            </Canvas>
        </div>
    );
}
