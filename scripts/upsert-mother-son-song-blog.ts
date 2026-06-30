import { readFile } from "node:fs/promises";

import { loadEnvConfig } from "@next/env";
import "dotenv/config";
import { and, asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverUploadFile } from "../lib/cloudflare/r2";
import {
  posts,
  postTags,
  pricingPlans,
  tags,
  user,
  type PaymentType,
  type PostType,
  type RecurringInterval,
} from "../lib/db/schema";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const SLUG = "a-song-from-a-mother-to-her-son";
const LANGUAGE = "en";
const POST_TYPE: PostType = "blog";
const COVER_LOCAL_PATH =
  "public/images/blog/a-song-from-a-mother-to-her-son-cover.webp";
const COVER_R2_KEY = "a-song-from-a-mother-to-her-son-cover.webp";
const TAG_NAMES = [
  "mother son song",
  "custom song",
  "personalized music gift",
  "wedding song",
  "song for son",
] as const;

type PricingRow = {
  id: string;
  displayPrice: string | null;
  originalPrice: string | null;
  cardTitle: string;
  cardDescription: string | null;
  paymentType: PaymentType | null;
  recurringInterval: RecurringInterval | null;
  displayOrder: number;
  langJsonb: unknown;
};

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return connectionString;
}

function readLocalizedPlanField<T>(
  plan: PricingRow,
  field: "displayPrice" | "originalPrice" | "cardTitle" | "cardDescription",
): T | null {
  const localized = (plan.langJsonb as Record<string, Record<string, unknown>> | null)?.en;
  const localizedValue = localized?.[field];

  if (typeof localizedValue === "string" && localizedValue.trim().length > 0) {
    return localizedValue as T;
  }

  const fallbackValue = plan[field];
  return (fallbackValue as T | null) ?? null;
}

function getPlanCopy(plans: PricingRow[]) {
  const liveDefaultPlans = plans
    .filter((plan) => plan.displayOrder >= -2 && plan.displayOrder <= 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (liveDefaultPlans.length < 3) {
    throw new Error("Expected at least 3 live default pricing plans");
  }

  const [singlePlan, proPlan, unlimitedPlan] = liveDefaultPlans;

  const singlePrice = readLocalizedPlanField<string>(singlePlan, "displayPrice");
  const proPrice = readLocalizedPlanField<string>(proPlan, "displayPrice");
  const unlimitedPrice = readLocalizedPlanField<string>(unlimitedPlan, "displayPrice");

  if (!singlePrice || !proPrice || !unlimitedPrice) {
    throw new Error("Missing live pricing values for one or more plans");
  }

  return {
    singlePrice,
    proPrice,
    unlimitedPrice,
  };
}

function buildContent({
  singlePrice,
  proPrice,
  unlimitedPrice,
}: {
  singlePrice: string;
  proPrice: string;
  unlimitedPrice: string;
}) {
  return `## Key Takeaways

- A song from a mother to her son works best when it feels specific, not generic. Personal memories, family language, and the son's life stage matter more than perfect poetry.
- The most common use cases are mother-son wedding dances, birthdays, graduation gifts, and encouragement songs for major life transitions.
- CustomSong lets you preview the song direction first, then refine lyrics, genre, and emotional tone before you commit.
- Current pricing starts at ${singlePrice} for one song, with Pro at ${proPrice} and Unlimited at ${unlimitedPrice}, which is far below the $199+ starting point many traditional custom song services advertise.

## A song from a mother to her son: what people are really looking for

When someone searches for **a song from a mother to her son**, they are usually not looking for background music. They are looking for a song that says something personal and lasting. Sometimes it is for a mother-son wedding dance. Sometimes it is a birthday gift, a graduation surprise, or a meaningful way to say “I am proud of you” during a hard season of life.

That is why the best mother-to-son songs do more than sound sweet. They capture history, personality, and love in a way that feels true to one family. If you want something deeper than a generic playlist, a personalized song is often the strongest option.

## What makes a mother-to-son song meaningful?

A meaningful mother-son song usually includes at least three things:

1. A specific memory, such as childhood routines, family trips, inside jokes, or a turning point you both remember.
2. A clear emotional message, such as pride, blessing, gratitude, or reassurance.
3. A sound that matches the occasion, whether that is soft acoustic, warm piano, cinematic pop, country, or uplifting ballad.

The emotional power comes from specificity. “I love you” matters, but “I still remember the red bike, the late-night talks, and the way you kept going when life got heavy” is what makes the song feel irreplaceable.

## The most common occasions for a song from a mother to her son

Here are the moments when people most often create this kind of song:

| Occasion | Why the song matters | Best tone |
| --- | --- | --- |
| Wedding day | A mother-son dance or private gift before the ceremony | Warm, proud, reflective |
| Birthday | A keepsake gift that feels personal instead of disposable | Joyful, grateful, affectionate |
| Graduation | A way to mark growth, resilience, and the next chapter | Hopeful, uplifting, proud |
| Military send-off or big move | A message of support when distance is about to change things | Encouraging, steady, emotional |
| Recovery or hard season | A reminder that he is loved and not alone | Gentle, comforting, sincere |
| Just because | A family keepsake with no event pressure attached | Honest, intimate, conversational |

## Mother-son wedding dance songs vs. a custom song

Wedding searches are one of the biggest reasons people look for a song from a mother to her son. Publications like [The Knot](https://www.theknot.com/content/mother-son-wedding-songs) and [Brides](https://www.brides.com/mother-son-dance-songs-5181800) regularly curate lists of mother-son dance songs because this moment matters so much in a wedding timeline.

Those lists are helpful if you want a familiar classic. But they also have a limit: the song belongs to everyone. A custom mother-son song belongs to your family only.

Here is the practical difference:

| Option | Best for | Tradeoff |
| --- | --- | --- |
| Popular mother-son dance song | Quick decision, familiar lyrics, low effort | Less personal, often overused |
| Custom mother-to-son song | Deep personalization, one-of-one emotional impact | Requires a little creative input |

If the moment is highly personal and you want guests or family members to feel that immediately, a custom song usually creates the stronger memory.

## How to write the message before turning it into a song

Before you generate anything, collect a few raw ideas. You do not need polished lyrics. You just need good source material.

Use this simple prompt:

> I want this song to tell my son that [core message].  
> I want it to mention [2 or 3 memories].  
> I want the feeling to be [tone].  
> I want him to remember that [blessing or life truth].

For example:

- Core message: “I am proud of the man you have become.”
- Memories: “Little League games, late-night homework at the kitchen table, the day he moved into his first apartment.”
- Tone: “warm and cinematic.”
- Blessing: “No matter where life takes him, he still has a home in my heart.”

That is already enough to generate a much better result than starting from a blank page.

## Lyrics ideas for a song from a mother to her son

If you need a little help getting unstuck, these themes usually work well:

- gratitude for watching him grow up
- pride in his character, not just his achievements
- quiet memories from everyday family life
- blessing for marriage, parenthood, or a new chapter
- reassurance during distance or change
- a message that he is still deeply known and loved

The strongest songs usually avoid trying to say everything. They choose one emotional center and build around it.

## How CustomSong fits this search intent

CustomSong is a strong fit for this keyword because the product matches the emotional job the reader is trying to get done. Most people searching for a mother-to-son song want one of two outcomes:

1. Find a song that already exists.
2. Create a song that sounds like it was made for their son.

CustomSong supports the second path with a much lower-friction workflow:

- Start with a story, memory, or message.
- Choose a musical direction.
- Get a preview before committing.
- Refine lyrics or genre if the first result is close but not perfect.
- Turn the final song into a fuller gift with a share page, music video, or printable lyric wall art.

That matters because this is not a commodity purchase. People want emotional accuracy, not just audio output.

## Why preview-first creation is important

Traditional custom song services often position themselves as premium keepsakes, but many require a large upfront payment and a wait that can stretch across several days. Songfinch, for example, is widely known as a premium custom song brand, and its offering is often discussed in a much higher price tier than AI-assisted creation tools.

For a mother-to-son song, preview-first creation changes the buying experience:

- you reduce the risk of getting the emotional tone wrong
- you can test softer or more celebratory language
- you can tweak names, memories, and phrasing before paying
- you can finish a meaningful gift much faster

That is a better fit for weddings, birthdays, and other dates that do not move.

## How much does a personalized mother-to-son song cost?

Pricing is one of the clearest reasons readers may choose a modern custom song workflow instead of a traditional service.

At CustomSong, the current entry points are:

- **${singlePrice}** for one song
- **${proPrice}** for Pro access
- **${unlimitedPrice}** for Unlimited

That opens the door for people who want a meaningful gift without making a $199+ leap before hearing anything. For many families, the ability to preview, revise, and keep the budget manageable is the deciding factor.

## A simple framework for choosing the right musical style

If you are not sure what style fits, use this:

| If the moment feels like... | Choose a style like... |
| --- | --- |
| A wedding dance | Acoustic pop, piano ballad, soft country |
| A birthday or celebration | Warm pop, feel-good folk, light cinematic |
| A serious life transition | Inspirational pop, reflective piano, cinematic vocal |
| A deeply emotional private gift | Sparse acoustic, intimate ballad, ambient piano |

Do not overthink genre labels. Start with the feeling first, then let the sound support it.

## When a custom song is better than a store-bought gift

A personalized mother-to-son song tends to outperform physical gifts when:

- the relationship is emotionally expressive
- the milestone marks real change
- you want a keepsake that can be replayed
- words matter more than objects

Flowers, cufflinks, framed prints, and gift boxes can all be lovely. But a song can carry voice, memory, blessing, and identity in one format. That is why it often becomes the gift people remember longest.

## Frequently Asked Questions

### What is the best song from a mother to her son for a wedding?

The best song depends on whether you want something familiar or something personal. A classic mother-son dance song works well for easy recognition, but a custom song is stronger when you want the moment to reflect your actual relationship and shared memories.

### Can I create a personalized song from a mother to her son without writing full lyrics?

Yes. You do not need to write a finished song first. A short message, a few specific memories, and the tone you want are enough to generate a strong starting point.

### Is a custom mother-son song only for weddings?

No. Weddings are a major use case, but people also create mother-to-son songs for birthdays, graduation, recovery, big moves, military send-offs, and everyday family keepsakes.

### How fast can I get a mother-to-son song made?

With a modern AI-assisted workflow, you can get a preview in minutes instead of waiting several days for a traditional custom song process. That speed is especially useful for event-driven gifts.

### What should a mother say in a song to her son?

The best message is usually simple and specific: what she has seen in him, what she is proud of, what she hopes for him, and one or two memories that make the relationship unmistakably personal.

## Create your own song from a mother to her son

If you want a mother-to-son song that feels personal instead of borrowed, start with a few memories and let the song grow from there. You can explore plans on [/pricing](/pricing) or begin the first draft now at [/create-song](/create-song).`;
}

async function uploadCoverImage() {
  const data = await readFile(COVER_LOCAL_PATH);

  return serverUploadFile({
    data,
    contentType: "image/webp",
    path: "images/blog",
    key: COVER_R2_KEY,
  });
}

async function main() {
  const client = postgres(getConnectionString(), {
    prepare: false,
  });
  const db = drizzle(client);

  try {
    const admins = await db
      .select({
        id: user.id,
        email: user.email,
      })
      .from(user)
      .where(eq(user.role, "admin"))
      .orderBy(asc(user.createdAt));

    if (admins.length === 0) {
      throw new Error("No admin user found to assign as blog author");
    }

    const preferredAdmin =
      admins.find((admin) => admin.email === "support@customsong.top") ?? admins[0];

    const livePlans = await db
      .select({
        id: pricingPlans.id,
        displayPrice: pricingPlans.displayPrice,
        originalPrice: pricingPlans.originalPrice,
        cardTitle: pricingPlans.cardTitle,
        cardDescription: pricingPlans.cardDescription,
        paymentType: pricingPlans.paymentType,
        recurringInterval: pricingPlans.recurringInterval,
        displayOrder: pricingPlans.displayOrder,
        langJsonb: pricingPlans.langJsonb,
      })
      .from(pricingPlans)
      .where(
        and(
          eq(pricingPlans.environment, "live"),
          eq(pricingPlans.isActive, true),
          eq(pricingPlans.groupSlug, "default"),
        ),
      )
      .orderBy(asc(pricingPlans.displayOrder));

    const { singlePrice, proPrice, unlimitedPrice } = getPlanCopy(livePlans);
    const content = buildContent({
      singlePrice,
      proPrice,
      unlimitedPrice,
    });
    const { url: featuredImageUrl } = await uploadCoverImage();

    const description =
      "Create a song from a mother to her son with personal memories, lyric prompts, mother-son dance ideas, and CustomSong's free preview workflow.";

    const existingTags = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .where(and(eq(tags.postType, POST_TYPE), inArray(tags.name, [...TAG_NAMES])));

    const existingTagByName = new Map(existingTags.map((tag) => [tag.name, tag]));

    for (const tagName of TAG_NAMES) {
      if (!existingTagByName.has(tagName)) {
        const [createdTag] = await db
          .insert(tags)
          .values({
            name: tagName,
            postType: POST_TYPE,
          })
          .returning({
            id: tags.id,
            name: tags.name,
          });

        existingTagByName.set(tagName, createdTag);
      }
    }

    const tagIds = TAG_NAMES.map((tagName) => {
      const tag = existingTagByName.get(tagName);

      if (!tag) {
        throw new Error(`Failed to resolve tag "${tagName}"`);
      }

      return tag.id;
    });

    const [existingPost] = await db
      .select({
        id: posts.id,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(
        and(
          eq(posts.slug, SLUG),
          eq(posts.language, LANGUAGE),
          eq(posts.postType, POST_TYPE),
        ),
      )
      .limit(1);

    const postData = {
      language: LANGUAGE,
      postType: POST_TYPE,
      authorId: preferredAdmin.id,
      title:
        "A Song from a Mother to Her Son: How to Create a Personal Mother-Son Song",
      slug: SLUG,
      content,
      description,
      featuredImageUrl,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: existingPost?.publishedAt ?? new Date(),
    };

    let postId: string;

    if (existingPost) {
      postId = existingPost.id;

      await db
        .update(posts)
        .set({
          ...postData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      await db.delete(postTags).where(eq(postTags.postId, postId));
    } else {
      const [createdPost] = await db
        .insert(posts)
        .values(postData)
        .returning({
          id: posts.id,
        });

      postId = createdPost.id;
    }

    await db.insert(postTags).values(
      tagIds.map((tagId) => ({
        postId,
        tagId,
      })),
    );

    console.log(
      JSON.stringify(
        {
          postId,
          slug: SLUG,
          language: LANGUAGE,
          featuredImageUrl,
          authorEmail: preferredAdmin.email,
          pricing: {
            singlePrice,
            proPrice,
            unlimitedPrice,
          },
          tags: [...TAG_NAMES],
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
