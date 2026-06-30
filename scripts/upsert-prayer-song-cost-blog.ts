import { loadEnvConfig } from "@next/env";
import "dotenv/config";
import { and, asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  posts,
  postTags,
  pricingPlans,
  tags,
  user,
  type PaymentType,
  type RecurringInterval,
  type PostType,
} from "../lib/db/schema";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const SLUG = "how-much-does-a-custom-prayer-song-cost";
const LANGUAGE = "en";
const POST_TYPE: PostType = "blog";
const TAG_NAMES = [
  "custom song",
  "prayer song",
  "songfinch comparison",
  "personalized music gift",
  "ai song generator",
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

function formatPlanLabel(
  title: string | null,
  price: string | null,
  suffix: string | null,
) {
  if (!title || !price) {
    return null;
  }

  const normalizedSuffix = suffix ? `/${suffix.replace(/^\/+/, "")}` : "";
  return `${title} (${price}${normalizedSuffix})`;
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
    singleLabel: formatPlanLabel(
      readLocalizedPlanField<string>(singlePlan, "cardTitle"),
      singlePrice,
      singlePlan.recurringInterval ?? singlePlan.paymentType ?? null,
    ),
    proLabel: formatPlanLabel(
      readLocalizedPlanField<string>(proPlan, "cardTitle"),
      proPrice,
      proPlan.recurringInterval ?? proPlan.paymentType ?? null,
    ),
    unlimitedLabel: formatPlanLabel(
      readLocalizedPlanField<string>(unlimitedPlan, "cardTitle"),
      unlimitedPrice,
      unlimitedPlan.recurringInterval ?? unlimitedPlan.paymentType ?? null,
    ),
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

- A custom prayer song can cost anywhere from coffee-money to $199+ on traditional custom song sites, depending on how it is made and how many revisions are included.
- At customsong.top, you can start with one song for ${singlePrice}, step up to Pro for ${proPrice}/month, or unlock Unlimited for ${unlimitedPrice}/year.
- You can preview first, tweak lyrics and style before paying, and move much faster than the week-long turnaround common with traditional custom music services.
- For gift-givers, the biggest practical advantages are lower upfront risk, faster turnaround, and much more freedom to retry until the song feels right.

## How much does a custom prayer song cost?

If you are searching for how much does a custom prayer song cost, the short answer is this: prices range from affordable AI-assisted tools to premium handcrafted services that can start around $199 or more for a single song. customsong.top sits at the low-risk, high-flexibility end of that spectrum. You can generate a personalized prayer song starting at ${singlePrice}, test the direction before committing, and keep refining the song concept instead of paying a large upfront fee and waiting days for delivery.

That pricing difference matters because prayer songs are deeply personal. They are often written for healing, remembrance, encouragement, weddings, baptisms, birthdays, church celebrations, or family milestones. In those situations, speed, emotional fit, and the ability to retry the wording can matter just as much as the final audio file.

## What is a custom prayer song?

A custom prayer song is a personalized piece of music built around a prayer, blessing, testimony, memory, or spiritual message. Instead of using generic lyrics, the song reflects specific people, events, scripture-inspired themes, hopes, and emotional details that matter to the person receiving it.

People usually commission or generate custom prayer songs for occasions like:

- memorial tributes
- healing and encouragement gifts
- anniversaries and weddings
- baptisms or dedications
- birthdays and milestone celebrations
- church and family events

Because the message is so personal, the best custom prayer song experience is not just about production quality. It is also about how easily you can adjust the lyrics, tone, and pacing until the song sounds emotionally true.

## customsong.top vs. traditional custom music sites

Here is the practical comparison most buyers care about:

| Feature | customsong.top | Traditional custom song services |
| --- | --- | --- |
| Starting price | ${singlePrice} for one song | Often $199+ for one song |
| Delivery speed | Around 2 minutes for an instant preview workflow | Often 4 to 7 days or longer |
| Pay-before-preview risk | Preview first, pay when you are happy | Often requires large upfront payment |
| Lyrics and style changes | Flexible retries and lyric tweaks before unlock | Often slower, more restricted, or revision-based |
| Download and keepsake value | Song access plus upgrade paths like MP3, video, and lyric keepsakes | Often centered on the song alone |
| Gift bundle potential | Song creation works naturally with music video and wall art offers on-site | Frequently requires separate purchases or add-ons |

That is the core reason this comparison matters. You are not just comparing a song to a song. You are comparing two very different buying experiences.

## Why traditional custom song websites usually cost more

Traditional custom song providers often price higher because they rely on a human-heavy workflow. That can include songwriter briefing, artist assignment, queue time, manual revisions, production coordination, customer support handling, and longer delivery promises. For some customers, that white-glove structure is exactly what they want.

But it also means the buyer usually absorbs more risk upfront. You may pay a significant fee before hearing anything usable. If the emotional tone, lyrics, or genre direction feels off, the path to a better version can involve more waiting, more back-and-forth, and less creative control.

For a prayer song, that tradeoff can feel especially frustrating. A single phrase may matter. A specific name, memory, or blessing may need to land exactly right. If you cannot quickly retry, the process becomes more stressful than meaningful.

## Why unlimited retry freedom matters so much for prayer songs

Prayer songs are not ordinary novelty gifts. Small wording choices change the emotional impact. A line can feel too formal, too broad, too romantic, too generic, or not spiritual enough. That is why retry freedom matters.

With customsong.top, the advantage is not just that the starting price is low. It is that you can steer the result. You can iterate on the story, reshape the lyrical focus, test a softer or more uplifting tone, and push the song closer to the moment you actually want to create.

That is a huge difference from the old model of sending one brief, waiting days, and hoping the final file gets the feeling right on the first try.

## Why fast turnaround matters for real-life gift moments

Prayer songs are often made under time pressure. A hospital visit, a memorial gathering, a last-minute birthday, a wedding weekend, or a church event does not always leave room for a multi-day production queue.

That is where speed becomes part of the product value. A fast preview workflow lets you go from idea to something emotionally usable in minutes, not nearly a week. Even if you continue refining after the first preview, the feedback loop is immediate. That lowers anxiety and increases the chance that you will actually finish the gift in time.

## Price-to-value breakdown: what you get at each level

For buyers comparing options, the simplest way to think about value is by how much flexibility each level unlocks:

- ${singlePrice} gets you started with a one-song option for a single occasion. That is the right fit when you want one meaningful prayer song without a subscription.
- ${proPrice}/month makes sense if you expect to create multiple songs or want recurring creative capacity for family, church, client, or seasonal gifting needs.
- ${unlimitedPrice}/year is the strongest long-term value if you want to create often and remove per-song hesitation altogether.

Compared with a traditional service that may start around $199+ for one song, even the entry-level customsong.top path dramatically lowers the cost of trying, refining, and actually finishing a personalized piece of music.

## When a traditional human custom song service may still be worth it

There are still cases where a traditional custom song company may be the better choice. If you specifically want a named human songwriter, a heavily curated artist-match experience, or a handcrafted process where the premium itself is part of the appeal, a traditional service can still make sense.

The key is being honest about what you are buying. If you want prestige and a slower white-glove workflow, the higher price may feel justified. If you want emotional personalization, creative control, fast turnaround, and dramatically lower cost, customsong.top is the more practical choice for most people.

## Bottom line: what should you expect to pay?

If you are asking how much does a custom prayer song cost, a realistic answer is that the market spans from affordable AI-assisted creation to premium traditional services priced at $199+ for one song. customsong.top gives you a much more accessible entry point at ${singlePrice}, with upgrade paths at ${proPrice}/month and ${unlimitedPrice}/year.

That combination of lower price, fast preview speed, and flexible retries is what makes the platform stand out. You are not locked into a big upfront bet. You can shape the result until it feels right, then pay for what you actually love.

## Frequently Asked Questions

### How much does a custom prayer song cost?

A custom prayer song can range from affordable AI-assisted pricing to $199+ on traditional custom music sites. On customsong.top, the current entry point is ${singlePrice} for one song, with higher-tier options at ${proPrice}/month and ${unlimitedPrice}/year.

### Can I hear a prayer song before paying?

That is one of the biggest differences between modern AI-assisted workflows and many traditional services. customsong.top is positioned around preview-first creation, so buyers can judge the direction before committing to the final unlock.

### Can I edit the lyrics after generating a song?

Yes, and that flexibility is especially important for prayer songs. You may want to change names, memories, blessings, emotional tone, or the overall musical style before deciding the song is ready.

### Is an AI custom prayer song good enough as a gift?

For many people, yes. If the lyrics are personal, the message is sincere, and the delivery fits the moment, an AI-assisted custom prayer song can feel thoughtful, moving, and genuinely memorable as a gift.

### How fast can I get a custom prayer song?

Traditional custom song services often take several days. customsong.top is designed around a much faster preview workflow, with messaging centered on near-instant feedback in minutes instead of nearly a week.

## Create your own prayer song

If you want to turn a memory, blessing, or heartfelt message into music without paying a large upfront fee, explore the current plans on [/pricing](/pricing) or start creating at [/create-song](/create-song).`;
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

    const { singlePrice, proPrice, unlimitedPrice, singleLabel, proLabel, unlimitedLabel } =
      getPlanCopy(livePlans);

    const content = buildContent({
      singlePrice,
      proPrice,
      unlimitedPrice,
    });

    const description =
      "How much does a custom prayer song cost? Compare customsong.top with traditional custom music sites on price, speed, retries, previews, and gift value.";

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

    const postData = {
      language: LANGUAGE,
      postType: POST_TYPE,
      authorId: preferredAdmin.id,
      title:
        "How Much Does a Custom Prayer Song Cost? customsong.top vs. Traditional Custom Music Sites",
      slug: SLUG,
      content,
      description,
      featuredImageUrl:
        `${process.env.R2_PUBLIC_URL}/images/blog/custom-prayer-song-cost-cover.webp`,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
    };

    const [existingPost] = await db
      .select({
        id: posts.id,
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
          authorEmail: preferredAdmin.email,
          usedFallbackAdmin: preferredAdmin.email !== "support@customsong.top",
          pricing: {
            singlePrice,
            proPrice,
            unlimitedPrice,
            singleLabel,
            proLabel,
            unlimitedLabel,
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
