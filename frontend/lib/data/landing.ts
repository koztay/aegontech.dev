import { getDb, unwrap, reviveRows, fetchAll } from "@/lib/db/supabase";
import type {
    Service,
    FeaturedPortfolioItem,
    ContactFormData,
    BlogPost,
} from "@/lib/types";

export async function getServices(): Promise<Service[]> {
    try {
        const rows = reviveRows<any>(
            await fetchAll((from, to) =>
                getDb()
                    .from("services")
                    .select("*")
                    .order("sort_order", { ascending: true })
                    .order("id")
                    .range(from, to)
            )
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
        const rows = reviveRows<any>(
            unwrap(
                await getDb()
                    .from("portfolio_items")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(6)
            )
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
        const rows = reviveRows<any>(
            await fetchAll((from, to) =>
                getDb()
                    .from("blog_posts")
                    .select("*")
                    .eq("status", "published")
                    .order("published_at", { ascending: false })
                    .order("id")
                    .range(from, to)
            )
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
    unwrap(
        await getDb()
            .from("contact_submissions")
            .insert({ name: data.name, email: data.email, message: data.message })
    );

    // Send to n8n webhook if configured (fire-and-forget)
    try {
        const webhook = process.env.N8N_WEBHOOK_URL;
        if (webhook) {
                const payload = {
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    from: data.from,
                    userAgent: data.userAgent,
                    ip: data.ip,
                    receivedAt: new Date().toISOString(),
                };

            // Don't await - don't block DB insert on webhook latency
            fetch(webhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch((err) =>
                console.error("Error sending submission to n8n webhook:", err)
            );
        }
    } catch (err) {
        console.error("Failed to initiate n8n webhook:", err);
    }
}
