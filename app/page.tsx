import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to the 3D Blog</h1>
      <p className="text-xl mb-8 max-w-2xl">
        Explore our interactive 3D visualization and dive into our latest blog posts.
      </p>
      <Button asChild>
        <Link href="/posts">
          View Blog Posts
        </Link>
      </Button>
    </div>
  )
}

