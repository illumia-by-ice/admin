"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bold, ChevronLeft, Heading2, ImageIcon, Italic, LinkIcon, List, Loader2, Quote, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { BlogPost, blogErrorMessage, createBlogPost, updateBlogPost, uploadBlogImage } from "@/lib/api/blog"

const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120)

export function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(post))
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [author, setAuthor] = useState(post?.author ?? "")
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "")
  const [cover, setCover] = useState(post?.cover_src ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [published, setPublished] = useState(post?.status === "published")

  const upload = useMutation({ mutationFn: uploadBlogImage })

  const save = useMutation({
    mutationFn: () => {
      const input = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content,
        cover_src: cover || null,
        author: author.trim() || null,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        status: published ? ("published" as const) : ("draft" as const),
      }
      return post ? updateBlogPost(post.id, input) : createBlogPost(input)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
      queryClient.invalidateQueries({ queryKey: ["blog-post", saved.id] })
      toast({
        title: saved.status === "published" ? "Post published" : "Draft saved",
        description: saved.status === "published" ? "It is now live on the website." : "It is not visible on the website yet.",
      })
      router.push("/dashboard/blog")
    },
    onError: (error) => toast({ title: "Unable to save", description: blogErrorMessage(error), variant: "destructive" }),
  })

  const submit = () => {
    if (title.trim().length < 3) return toast({ title: "Add a title", description: "The title needs at least 3 characters.", variant: "destructive" })
    if (!content.trim()) return toast({ title: "Add some content", description: "The post body is empty.", variant: "destructive" })
    save.mutate()
  }

  // --- Markdown toolbar helpers: edit the textarea selection in place ---
  const edit = (transform: (selected: string) => { text: string; select?: [number, number] }) => {
    const el = contentRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const result = transform(content.slice(start, end))
    setContent(content.slice(0, start) + result.text + content.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const [from, to] = result.select ?? [start + result.text.length, start + result.text.length]
      el.setSelectionRange(start + from, start + to)
    })
  }
  const wrap = (before: string, after: string, placeholder: string) =>
    edit((selected) => {
      const inner = selected || placeholder
      return { text: `${before}${inner}${after}`, select: [before.length, before.length + inner.length] }
    })
  const prefixLines = (prefix: string, placeholder: string) =>
    edit((selected) => ({ text: (selected || placeholder).split("\n").map((line) => prefix + line).join("\n") }))

  const insertImage = async (file?: File) => {
    if (!file) return
    try {
      const { src } = await upload.mutateAsync(file)
      edit(() => ({ text: `\n\n![${file.name.replace(/\.[^.]+$/, "")}](${src})\n\n` }))
    } catch (error) {
      toast({ title: "Upload failed", description: blogErrorMessage(error), variant: "destructive" })
    }
  }

  const uploadCover = async (file?: File) => {
    if (!file) return
    try {
      setCover((await upload.mutateAsync(file)).src)
    } catch (error) {
      toast({ title: "Upload failed", description: blogErrorMessage(error), variant: "destructive" })
    }
  }

  const tools = [
    { label: "Heading", icon: Heading2, run: () => prefixLines("## ", "Heading") },
    { label: "Bold", icon: Bold, run: () => wrap("**", "**", "bold text") },
    { label: "Italic", icon: Italic, run: () => wrap("*", "*", "italic text") },
    { label: "Link", icon: LinkIcon, run: () => wrap("[", "](https://)", "link text") },
    { label: "List", icon: List, run: () => prefixLines("- ", "List item") },
    { label: "Quote", icon: Quote, run: () => prefixLines("> ", "Quote") },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/blog" aria-label="Back to posts"><ChevronLeft className="h-5 w-5" /></Link></Button>
          <h1 className="text-3xl font-bold tracking-tight">{post ? "Edit post" : "New post"}</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><Switch checked={published} onCheckedChange={setPublished} />{published ? "Published" : "Draft"}</label>
          <Button onClick={submit} disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{post ? "Save changes" : published ? "Publish" : "Save draft"}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} placeholder="How to rent with confidence" onChange={(event) => { setTitle(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)) }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Summary <span className="text-muted-foreground">(shown on the blog page — optional)</span></Label>
                <Textarea id="excerpt" rows={2} maxLength={500} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write in Markdown. Use the toolbar, or type the syntax directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="write">
                <TabsList><TabsTrigger value="write">Write</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList>
                <TabsContent value="write" className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {tools.map(({ label, icon: Icon, run }) => <Button key={label} type="button" variant="outline" size="icon" title={label} aria-label={label} onClick={run}><Icon className="h-4 w-4" /></Button>)}
                    <Button type="button" variant="outline" size="sm" asChild disabled={upload.isPending}>
                      <label className="cursor-pointer">{upload.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}Image<input type="file" accept="image/*" className="hidden" onChange={(event) => { insertImage(event.target.files?.[0]); event.target.value = "" }} /></label>
                    </Button>
                  </div>
                  <Textarea ref={contentRef} value={content} onChange={(event) => setContent(event.target.value)} rows={22} className="font-mono text-sm" placeholder={"## A heading\n\nWrite your post here…"} />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="md-preview min-h-[300px] rounded-md border p-4">
                    {content.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="text-muted-foreground">Nothing to preview yet.</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cover image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cover ? (
                <>
                  <img src={cover} alt="Cover preview" className="aspect-video w-full rounded-md border object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setCover("")}><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
                </>
              ) : (
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/50">
                  {upload.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  Upload cover (max 5MB)
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => { uploadCover(event.target.files?.[0]); event.target.value = "" }} />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Web address</Label>
                <Input id="slug" value={slug} placeholder="how-to-rent-with-confidence" onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)) }} />
                <p className="text-xs text-muted-foreground">/blog/{slug || "your-post"}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} placeholder="Illumia Team" onChange={(event) => setAuthor(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={tags} placeholder="Property, Rent Support" onChange={(event) => setTags(event.target.value)} />
                <p className="text-xs text-muted-foreground">Separate with commas (up to 8).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
