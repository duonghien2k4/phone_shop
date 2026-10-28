"use client";

import React, { Component, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { DoubleSide } from "three";
import PhoneModel from "./PhoneModel.jsx";

const MODEL_URL = "/models/iphone-18.glb";

class ModelErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ModelAsset({ rotationX, rotationY, scale, position }) {
  const { scene } = useGLTF(MODEL_URL);
  const { model } = useMemo(() => {
    const model = scene.clone(true);
    const ground = model.getObjectByName("Plane");
    const phone = model.getObjectByName("Object_7");

    if (ground) {
      ground.visible = false;
    }

    if (phone) {
      phone.matrix.identity();
      phone.matrixAutoUpdate = true;
      phone.position.set(0, 0, 0);
      phone.rotation.set(0, 0, 0);
      phone.scale.set(1, 1, 1);
    }

    model.traverse((object) => {
      if (object.isMesh) {
        object.frustumCulled = false;
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.side = DoubleSide;
      }
    });

    return { model };
  }, [scene]);

  return (
    <group
      position={position}
      rotation={[
        (rotationX * Math.PI) / 180,
        (rotationY * Math.PI) / 180,
        0,
      ]}
      scale={scale * 0.22}
    >
      <primitive object={model} />
    </group>
  );
}

function WebGLScene({ rotationX, rotationY, scale, position }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop="always"
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-3, 1, -2]} intensity={1.2} color="#9bb7ff" />
      <Suspense fallback={null}>
        <ModelAsset
          rotationX={rotationX}
          rotationY={rotationY}
          scale={scale}
          position={position}
        />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}

export default function IPhone18Model({
  rotationY = 0,
  rotationX = 0,
  scale = 1,
  position = [-0.48, 1.71, 0],
  accentColor = "#8a7bff",
  className = "",
}) {
  const fallback = (
    <PhoneModel
      rotationY={rotationY}
      rotationX={rotationX}
      scale={scale}
      accentColor={accentColor}
    />
  );

  return (
    <ModelErrorBoundary fallback={fallback}>
      <div className={`iphone18-webgl ${className}`} aria-label="iPhone 18 Pro Max 3D model">
        <WebGLScene
          rotationX={rotationX}
          rotationY={rotationY}
          scale={scale}
          position={position}
        />
      </div>
    </ModelErrorBoundary>
  );
}
