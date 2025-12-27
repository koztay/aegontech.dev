import { query } from "@/lib/db/client";
import type {
    Service,
    FeaturedPortfolioItem,
    ContactFormData,
    BlogPost,
} from "@/lib/types";

export async function getServices(): Promise<Service[]> {
    try {
        const rows = await query<any>(
            "SELECT * FROM services ORDER BY sort_order ASC"
        );

        return rows.map((row) => ({
            id: row.id,
            icon: row.icon,
            title: row.title,
            description: row.description,
        }));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

export async function getFeaturedPortfolioItems(): Promise<
    FeaturedPortfolioItem[]
> {
    try {
        const rows = await query<any>(
            "SELECT * FROM portfolio_items ORDER BY created_at DESC LIMIT 6"
        );

        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            type: row.type,
            description: row.description,
            imageUrl: row.screenshot,
            url: row.website_url || row.app_store_url || row.play_store_url || "#",
        }));
    } catch (error) {
        console.error("Error fetching portfolio items:", error);
        return [];
    }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const rows = await query<any>(
            "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC"
        );

        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt,
            content: row.content,
            featuredImage: row.featured_image,
            publishedAt: row.published_at,
            status: row.status,
        }));
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
}

export async function submitContactForm(
    data: ContactFormData
): Promise<void> {
    await query(
        "INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3)",
        [data.name, data.email, data.message]
    );
}
