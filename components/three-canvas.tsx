'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber' 
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface Node {
  position: [number, number, number]
  connections: number[]
}

function generateNodesOnSphere(count: number, radius: number = 5): Node[] {
  const nodes: Node[] = []
  
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi

    const x = radius * Math.cos(theta) * Math.sin(phi)
    const y = radius * Math.sin(theta) * Math.sin(phi)
    const z = radius * Math.cos(phi)

    nodes.push({
      position: [x, y, z],
      connections: []
    })
  }

  // Add connections between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.sqrt(
        Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
        Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
        Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
      )
      if (distance < radius * 0.5) {
        nodes[i].connections.push(j)
        nodes[j].connections.push(i)
      }
    }
  }

  return nodes
}

function NodeMesh({ position, isSelected, isConnected, onClick }: { 
  position: [number, number, number], 
  isSelected: boolean, 
  isConnected: boolean, 
  onClick: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(isSelected ? 1.5 : isConnected ? 1.2 : 1)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#00ff88' : isConnected ? '#00aaff' : '#4a9eff'}
        emissive={isSelected ? '#00ff88' : isConnected ? '#00aaff' : '#4a9eff'}
        emissiveIntensity={isSelected ? 1 : isConnected ? 0.7 : 0.5}
      />
    </mesh>
  )
}

function ConnectionLine({ start, end, isActive }: { 
  start: [number, number, number], 
  end: [number, number, number], 
  isActive: boolean 
}) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={isActive ? '#00ff88' : '#4a9eff'}
        transparent
        opacity={isActive ? 0.6 : 0.2}
      />
    </line>
  )
}

function NodeNetwork() {
  const nodes = useMemo(() => generateNodesOnSphere(200), [])
  const groupRef = useRef<THREE.Group>(null)
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005
    }
  })

  const handleNodeClick = useCallback((index: number) => {
    setSelectedNode(prevSelected => prevSelected === index ? null : index)
  }, [])

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <NodeMesh
          key={i}
          position={node.position}
          isSelected={selectedNode === i}
          isConnected={selectedNode !== null && nodes[selectedNode].connections.includes(i)}
          onClick={() => handleNodeClick(i)}
        />
      ))}
      {nodes.map((node, i) => 
        node.connections.map((connectionIndex, j) => (
          <ConnectionLine
            key={`${i}-${j}`}
            start={node.position}
            end={nodes[connectionIndex].position}
            isActive={selectedNode === i || selectedNode === connectionIndex}
          />
        ))
      )}
    </group>
  )
}

export function ThreeCanvas({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <NodeNetwork />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  )
}

