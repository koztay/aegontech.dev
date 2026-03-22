# Unique AI Content Generation Pattern for n8n Workflows

This document describes a pattern for ensuring AI-generated content (blog posts, articles, etc.) is unique and varied each time the workflow runs.

## The Problem

When using AI (like GPT-4) to generate content automatically:
1. **Duplicate titles/slugs**: The AI tends to generate similar titles, causing database constraint violations
2. **Repetitive topics**: Without memory of previous generations, the AI defaults to the same "safe" topics
3. **Content fatigue**: Readers see similar articles repeatedly

## The Solution: Two-Part Approach

### Option A: Query Existing Content
Fetch recent titles from your database and pass them to the AI with instructions to avoid similar titles.

### Option B: Random Topic Selector
Pre-define topic angles and randomly select one each run, forcing the AI to write from that specific perspective.

---

## Implementation Details

### Step 1: Create a Lightweight API Endpoint

Create an API endpoint that returns only the titles (not full content) of recent posts.

**Example: Next.js API Route (`/api/blog/titles/route.ts`)**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '15');

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .select('title, slug')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ titles: data });
}
```

**Response format:**
```json
{
  "titles": [
    { "title": "Post Title 1", "slug": "post-title-1" },
    { "title": "Post Title 2", "slug": "post-title-2" }
  ]
}
```

---

### Step 2: Add n8n Nodes Before AI Content Generation

#### Node 1: Fetch Recent Posts (HTTP Request)

```json
{
  "parameters": {
    "url": "https://your-domain.com/api/blog/titles?limit=15",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "options": {}
  },
  "name": "Fetch Recent Posts",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1
}
```

#### Node 2: Prepare Topic Context (Code Node)

This node:
1. Extracts titles from the API response
2. Randomly selects a topic angle from a predefined list
3. Outputs data for the AI prompt

```javascript
// Extract recent titles from the API response
const titlesData = $input.item.json.titles || [];
const recentTitles = titlesData.map(t => t.title).filter(Boolean);

// Topic angles - customize these for your product/niche
const topicAngles = [
  {
    angle: "Digital Nomad Communication Challenges",
    hook: "the struggle of staying connected while traveling through different countries",
    focus: "how your product solves communication problems for travelers"
  },
  {
    angle: "The True Cost of 'Free' Apps",
    hook: "hidden costs and data harvesting in supposedly free apps",
    focus: "transparent pricing and real value proposition"
  },
  {
    angle: "Why Legacy Software Is Dying",
    hook: "frustration with apps that require constant updates and heavy downloads",
    focus: "lightweight, browser-based alternatives"
  },
  // Add 10-15 more angles relevant to your product...
];

// Randomly select a topic
const randomIndex = Math.floor(Math.random() * topicAngles.length);
const selectedTopic = topicAngles[randomIndex];

return [{
  json: {
    recentTitles: recentTitles,
    selectedAngle: selectedTopic.angle,
    selectedHook: selectedTopic.hook,
    selectedFocus: selectedTopic.focus,
    timestamp: Date.now()
  }
}];
```

---

### Step 3: Update the AI Prompt

Modify your AI prompt to include:
1. The list of titles to avoid
2. The mandatory topic angle

**User message template:**

```
Generate a blog post with a COMPLETELY NEW AND UNIQUE topic.

**TITLES TO AVOID** (these have already been published - DO NOT use similar titles):
{{ JSON.stringify($json.recentTitles || []) }}

**MANDATORY TOPIC ANGLE FOR THIS POST:**
- Angle: {{ $json.selectedAngle }}
- Hook to start with: {{ $json.selectedHook }}
- Main focus: {{ $json.selectedFocus }}

You MUST write about the above angle. Do not deviate to a different topic.

**REQUIREMENTS:**
1. Your title and content MUST be about the specified angle above
2. The title MUST be different from the titles listed above
3. [... rest of your requirements ...]
```

---

### Step 4: Add Slug Uniqueness Safety Net

Even with the above measures, add a timestamp suffix to slugs as a safety net against database constraint violations.

**In your "Parse AI Response" code node:**

```javascript
const parsedData = JSON.parse(aiResponse);

// Generate unique slug with timestamp to prevent duplicates
const uniqueSlug = parsedData.slug + '-' + Date.now().toString(36);

return {
  json: {
    ...parsedData,
    slug: uniqueSlug
  }
};
```

This produces slugs like: `my-blog-post-title-m4k5x9p`

---

## Workflow Structure

```
┌─────────────────┐
│  Daily Schedule │
│    (Trigger)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Recent   │  ◄── Option A: Get existing titles from database
│     Posts       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prepare Topic   │  ◄── Option B: Random topic selection
│    Context      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Content     │  ◄── Receives: recentTitles + selectedTopic
│    Agent        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse AI       │  ◄── Adds unique slug suffix
│   Response      │
└────────┬────────┘
         │
         ▼
    [Rest of workflow...]
```

---

## Designing Good Topic Angles

Each topic angle should have three components:

| Component | Purpose | Example |
|-----------|---------|---------|
| **Angle** | The specific perspective/topic | "Expat Phone Bill Horror Stories" |
| **Hook** | The pain point to open with | "shocking international calling bills that expats face" |
| **Focus** | What to emphasize about your product | "cost-effective solutions for calling family back home" |

### Tips for Topic Angles:

1. **All angles should relate to your core product** - variety comes from perspective, not topic
2. **Target different audience segments** - nomads, freelancers, businesses, families, etc.
3. **Address different pain points** - cost, complexity, reliability, privacy, etc.
4. **Include trending topics** - "The Skype Exodus", "Post-Pandemic Remote Work", etc.
5. **Mix educational and promotional** - some explain technology, others focus on solutions

---

## Customization Checklist

When adapting this pattern for a new project:

- [ ] Create `/api/[resource]/titles` endpoint for your content type
- [ ] Define 10-15 topic angles relevant to your product/niche
- [ ] Update the AI system prompt with your product context
- [ ] Update mandatory keywords for SEO
- [ ] Configure the slug generation format
- [ ] Test with a few manual runs before enabling automation

---

## Troubleshooting

### "Duplicate key constraint" errors
- Check that the slug uniqueness suffix is being applied
- Verify the "Parse AI Response" node is processing correctly

### AI still generating similar content
- Add more specific topic angles
- Make the "MANDATORY TOPIC ANGLE" instructions more emphatic
- Increase the number of recent titles fetched (try 20-30)

### API endpoint returns empty titles
- Check database connection
- Verify `is_published` filter matches your data
- Check authentication if endpoint is protected
