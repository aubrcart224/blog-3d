import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' 

// This would typically come from your data source
const posts = [
  { title: "Getting Started", slug: "getting-started", excerpt: "Learn how to get started with our 3D blog." },
  { title: "Installation", slug: "installation", excerpt: "Step-by-step guide to install the necessary tools." },
  // ... add more posts
]

export default function PostsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.slug}>
            <CardHeader>
              <CardTitle>
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

