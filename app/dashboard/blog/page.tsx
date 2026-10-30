"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ExternalLink, Eye, EyeOff, Newspaper, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { BlogPost, blogErrorMessage, deleteBlogPost, getBlogPosts, updateBlogPost } from "@/lib/api/blog"

const SITE_URL = (process.env.NEXT_PUBLIC_LANDING_URL || "https://illumiacityempire.com").replace(/\/$/, "")
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "—")

export default function BlogPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<BlogPost | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog-posts", page, search],
    queryFn: () => getBlogPosts({ page, limit: 10, search: search || undefined }),
    refetchOnWindowFocus: false,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
  const onError = (error: unknown) => toast({ title: "Something went wrong", description: blogErrorMessage(error), variant: "destructive" })

  const toggle = useMutation({
    mutationFn: (post: BlogPost) => updateBlogPost(post.id, { status: post.status === "published" ? "draft" : "published" }),
    onSuccess: (post) => { refresh(); toast({ title: post.status === "published" ? "Post published" : "Post unpublished" }) },
    onError,
  })

  const remove = useMutation({
    mutationFn: (post: BlogPost) => deleteBlogPost(post.id),
    onSuccess: () => { refresh(); setToDelete(null); toast({ title: "Post deleted" }) },
    onError,
  })

  const posts = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Write posts in Markdown. Published posts appear on the website blog.</p>
        </div>
        <Button asChild><Link href="/dashboard/blog/new"><Plus className="mr-2 h-4 w-4" />New post</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>{meta ? `${meta.total} post${meta.total === 1 ? "" : "s"}` : "Loading…"}</CardDescription>
          <div className="relative max-w-sm pt-2">
            <Search className="absolute left-2.5 top-[1.15rem] h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search by title" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="py-10 text-center text-muted-foreground">Unable to load posts. Check that the API is running and the blog migration has been applied.</p>
          ) : !isLoading && posts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">{search ? "No posts match your search" : "No blog posts yet"}</p>
              {!search && <Button asChild><Link href="/dashboard/blog/new"><Plus className="mr-2 h-4 w-4" />Write the first post</Link></Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Published</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 3 }, (_, index) => <TableRow key={index}><TableCell colSpan={4}><div className="h-6 animate-pulse rounded bg-muted" /></TableCell></TableRow>)}
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell><Link href={`/dashboard/blog/${post.id}`} className="font-medium hover:underline">{post.title}</Link><p className="text-xs text-muted-foreground">/blog/{post.slug}</p></TableCell>
                    <TableCell><Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status === "published" ? "Published" : "Draft"}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(post.published_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {post.status === "published" && <Button variant="ghost" size="icon" asChild title="View on website"><a href={`${SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on website"><ExternalLink className="h-4 w-4" /></a></Button>}
                        <Button variant="ghost" size="icon" title={post.status === "published" ? "Unpublish" : "Publish"} aria-label={post.status === "published" ? "Unpublish" : "Publish"} disabled={toggle.isPending} onClick={() => toggle.mutate(post)}>{post.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        <Button variant="ghost" size="icon" asChild title="Edit"><Link href={`/dashboard/blog/${post.id}`} aria-label="Edit"><Pencil className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" title="Delete" aria-label="Delete" onClick={() => setToDelete(post)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>“{toDelete?.title}” will be permanently removed from the website. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove.mutate(toDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
