import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'

interface PostProps {
  params: {
    slug: string
  }
}

export default async function Post({ params }: PostProps) {
  const { slug } = params
  const filePath = path.join(process.cwd(), 'posts', `${slug}.mdx`)
  
  const fileContent = await fs.readFile(filePath, 'utf8')
  const { content, data } = matter(fileContent)

  return (
    <article className="relative mx-auto max-w-3xl p-6">
      <div className="prose prose-invert">
        <h1>{data.title}</h1>
        <div className="text-sm text-muted-foreground">
          {new Date(data.date).toLocaleDateString()}
        </div>
        <MDXRemote source={content} />
      </div>
    </article>
  )
}

