import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BlogCardProps = {
  title: string;
  summary: string;
  href: string;
  tag?: string;
  publishedAt?: string;
};

export function BlogCard({ title, summary, href, tag, publishedAt }: BlogCardProps) {
  return (
    <a href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Card className="h-full border-slate-200 transition hover:-translate-y-1 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ink">{title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {tag ? <span className="rounded-full bg-accent px-2 py-1 text-accent-foreground">{tag}</span> : null}
            {publishedAt ? <span className="text-slate-500">{publishedAt}</span> : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">{summary}</p>
        </CardContent>
      </Card>
    </a>
  );
}
