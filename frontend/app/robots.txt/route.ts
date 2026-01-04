import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aegontech.dev'
  
  const content = `User-Agent: *
Allow: /
Disallow: /admin
Disallow: /admin-login

Sitemap: ${siteUrl}/sitemap.xml
llms: ${siteUrl}/llms.txt`
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
