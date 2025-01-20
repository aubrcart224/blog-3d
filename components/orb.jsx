"use client"; 
// ^ Not necessary if you're on Next.js <13, 
//   but for the new App Router in Next.js 13, this ensures 
//   this file is treated as a client component.

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from "three";

// Separate component for the 3D orb
function OrbMesh() {
  const orbRef = useRef();
  const [scale, setScale] = useState(1);

  // Animation loop using useFrame
  useFrame(() => {
    if (orbRef.current) {
      orbRef.current.rotation.y += 0.01;
      orbRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <mesh ref={orbRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={0x00ff00} />
      </mesh>
    </>
  );
}

export default function Orb() {
  const blogOutputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (blogOutputRef.current) {
        blogOutputRef.current.innerText = transcript;
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <OrbMesh />
      </Canvas>
      <div
        ref={blogOutputRef}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.5)",
          padding: "10px",
          fontFamily: "sans-serif",
          maxWidth: "300px",
          overflow: "auto",
        }}
      >
        Speak something...
      </div>
    </div>
  );
}
