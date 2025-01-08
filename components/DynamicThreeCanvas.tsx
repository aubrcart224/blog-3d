'use client'

import dynamic from 'next/dynamic'

const ThreeCanvas = dynamic(
  () => import('@/components/three-canvas').then((mod) => mod.ThreeCanvas),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-black" />,
  }
)

export default function DynamicThreeCanvas() {
  return <ThreeCanvas />
} 