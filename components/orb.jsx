"use client"; 
// ^ Not necessary if you're on Next.js <13, 
//   but for the new App Router in Next.js 13, this ensures 
//   this file is treated as a client component.


import React, { useEffect, useRef } from 'react';
import * as THREE from "three";

export default function Orb() {
  const containerRef = useRef(null);
  const orbRef = useRef(null);       // We'll store our Three.js mesh here
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const recognitionRef = useRef(null);

  // For storing partial transcription
  const blogOutputRef = useRef(null);

  /**
   * 1) Speech recognition setup
   */
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    // Create recognition
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      // Update our blog output DOM if available
      if (blogOutputRef.current) {
        blogOutputRef.current.innerText = transcript;
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Attempt to restart for continuous listening
      recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  /**
   * 2) Set up Three.js scene once on mount
   */
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create the orb
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);
    orbRef.current = orb;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Start render/animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Simple rotation
      if (orbRef.current) {
        orbRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      // Stop the animation loop if needed or remove the canvas
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    };
  }, []);

  /**
   * 3) Web Audio API for volume -> animate orb scale
   */
  useEffect(() => {
    let audioContext;
    let analyser;
    let dataArray;
    let rafId;

    if (typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);

          analyser = audioContext.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);

          dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateAudioData = () => {
            rafId = requestAnimationFrame(updateAudioData);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const averageVolume = sum / dataArray.length;
            updateOrbScale(averageVolume);
          };
          updateAudioData();
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
        });
    }

    function updateOrbScale(volume) {
      if (!orbRef.current) return;
      // Map volume [0..255] to scale factor [1..2]
      const minScale = 1.0;
      const maxScale = 2.0;
      const scale = minScale + (volume / 255) * (maxScale - minScale);
      orbRef.current.scale.set(scale, scale, scale);
    }

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioContext) audioContext.close();
    };
  }, []);

  /**
   * 4) Handle window resizing (optional)
   */
  useEffect(() => {
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />
      {/* Blog text output */}
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
