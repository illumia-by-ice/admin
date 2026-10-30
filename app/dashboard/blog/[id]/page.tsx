"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BlogEditor } from "@/components/blog/blog-editor"
import { getBlogPost } from "@/lib/api/blog"

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useQuery({ queryKey: ["blog-post", id], queryFn: () => getBlogPost(id), refetchOnWindowFocus: false })

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>
  if (isError || !data) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-lg font-medium">This post could not be found.</p>
        <Button asChild><Link href="/dashboard/blog">Back to posts</Link></Button>
      </div>
    )
  }
  return <BlogEditor key={data.id} post={data} />
}
