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
  tags,
  user,
  type PostType,
} from "../lib/db/schema";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const TITLE = "Anniversary Songs for Couples: Romantic Picks and How to Create Your Own";
const SLUG = "anniversary-songs-for-couples";
const LANGUAGE = "en";
const POST_TYPE: PostType = "blog";
const COVER_LOCAL_PATH =
  "public/images/blog/anniversary-songs-for-couples-cover.webp";
const COVER_R2_KEY = "anniversary-songs-for-couples-cover.webp";
const DESCRIPTION =
  "Find anniversary songs for couples by mood, milestone, and dance style, plus a simple way to create a personal anniversary song.";
const TAG_NAMES = [
  "anniversary song",
  "anniversary songs for couples",
  "wedding anniversary songs",
  "custom song",
  "couples songs",
] as const;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return connectionString;
}

function buildContent() {
  return `## Key Takeaways

- **Anniversary songs for couples** work best when the music matches both the relationship stage and the way the couple actually celebrates, whether that is a quiet dinner, a party, or a dance.
- The strongest options usually fall into three buckets: timeless romantic classics, milestone-ready anniversary dance songs, and custom songs built from real memories.
- If you are searching for **good anniversary songs** or **wedding anniversary songs for couple** moments, focus first on mood, lyrics, and replay value rather than popularity alone.
- A custom anniversary song becomes more memorable when it includes your first meeting, private jokes, promises, and the everyday details that define your story.

## Anniversary songs for couples: the short answer

If you are looking for **anniversary songs for couples**, the best choice depends on the moment you want to create. Some couples want a soft song for a candlelit dinner. Some want **anniversary dance wedding songs** for a vow renewal or reception-style celebration. Others want a playlist that feels personal enough for a 1st, 10th, or **25th anniversary songs for couple** milestone.

The simplest way to choose is to start with the emotion first: romantic, nostalgic, joyful, elegant, or deeply personal. Then match the song to the setting. If no existing track feels specific enough, a custom anniversary song can turn your actual memories into the centerpiece of the celebration.

## How to choose anniversary songs for couples

Before building a playlist, answer three questions:

1. Is this song for listening, gifting, or dancing?
2. Does the couple prefer classic romance, modern pop, country, jazz, or acoustic music?
3. Should the song feel universal, or should it sound like it belongs only to this relationship?

That third question matters most. Many people begin with **happy anniversary songs for couples**, but what they really want is a song that brings shared history back to life. A familiar classic is convenient. A more personal anniversary song is often more powerful.

## The best anniversary song moods and when to use them

| Mood or goal | Best use case | Anniversary song direction |
| --- | --- | --- |
| Soft and intimate | Private dinner, at-home celebration, slideshow | Acoustic love songs, piano ballads, gentle soul |
| Joyful and celebratory | Surprise party, couple reel, family gathering | Upbeat pop love songs, disco-leaning classics, feel-good duets |
| Elegant and danceable | Vow renewal, anniversary dance, reception-style moment | Slow dance standards, romantic oldies, crossover ballads |
| Deeply personal | Gift reveal, keepsake video, lyric wall art | Custom anniversary song built from your story |
| Nostalgic and reflective | Milestone year, memory montage, photo album soundtrack | Timeless classics, first-dance callbacks, songs from your early years together |

This framework also helps if you started with a broad search like **anniversary songs for couple** and need to narrow it down quickly.

## Good anniversary songs by relationship moment

Some anniversaries call for romance. Others call for gratitude, humor, or a look back at everything a couple has survived together.

### For the first anniversary

The first anniversary usually feels bright, hopeful, and still close to the energy of dating or newlywed life. Good songs here often sound warm and youthful rather than grand.

Look for:

- romantic acoustic pop
- modern love songs with simple, direct lyrics
- songs tied to the couple's first date, trip, or wedding season

### For 5th or 10th anniversaries

These anniversaries often work best with songs that mix celebration and depth. By this point, the relationship has texture. The music can acknowledge growth, not just attraction.

Good directions include:

- soulful R&B love songs
- piano-driven pop ballads
- first-dance songs revisited in a more mature setting

### For 25th anniversary songs for couple celebrations

When people search for **25th anniversary songs for couple** ideas, they are usually planning a milestone that honors endurance. The music should feel lasting, graceful, and meaningful enough for family members to hear too.

Songs in this category often work best when they feel:

- timeless instead of trendy
- lyrical without sounding overly theatrical
- romantic but still grounded in real life

For a 25th anniversary, it is especially powerful to pair a classic love song with a custom anniversary track that reflects the marriage in the couple's own words.

## Wedding anniversary songs for couple celebrations

Some couples celebrate their anniversary almost like a second wedding. That is where **wedding anniversary songs for couple** searches usually come from. The goal is not just background music. It is a moment.

These songs tend to work best for:

- vow renewals
- anniversary dinner entrances
- family tribute videos
- a slow dance at an anniversary party

If the celebration includes guests, choose a song with a graceful tempo and emotionally clear lyrics. If the moment is private, you can go more specific and sentimental.

## Anniversary dance wedding songs: what works best

For **anniversary dance wedding songs**, movement matters as much as lyrics. A beautiful song is not always an easy dance song.

Use this quick filter:

| Dance need | What to prioritize | Best music direction |
| --- | --- | --- |
| Slow, simple dance | Steady rhythm, clear phrasing | Classic ballads, soft pop, easy-tempo soul |
| Formal event dance | Elegant tone, broad appeal | Standards, cinematic love songs, polished crossover tracks |
| Casual home dance | Comfort, intimacy, low pressure | Acoustic duets, stripped-back love songs |

If the song is for a public dance, familiarity helps. If the song is for a gift reveal or a private room dance, personalization often wins.

## Popular sources for anniversary song ideas

If you want inspiration from existing curated lists, [The Knot](https://www.theknot.com/content/anniversary-songs) regularly features anniversary song ideas for couples and wedding-adjacent celebrations. Spotify also makes it easy to browse anniversary-themed playlists through its [anniversary song search](https://open.spotify.com/search/anniversary%20songs/playlists), which can help you test mood and genre quickly.

These sources are useful for discovery, but they also reveal the main limitation of playlist-first searching: the songs are still shared by everyone. That is why many couples end up wanting something more specific after building a first shortlist.

## When a custom anniversary song is better than an existing song

A custom song is not necessary for every anniversary. But it becomes the better option when:

- the relationship has a very specific story
- the couple already has heard most of the common anniversary songs
- you want a gift, not just a playlist
- the celebration includes a video, framed lyrics, or a keepsake reveal

This is the difference between “a beautiful song” and “our song.”

## How to create your own anniversary song

You do not need to write full lyrics to create a strong anniversary track. Start with four inputs:

> We met when [moment].  
> The memory we never stop talking about is [memory].  
> The feeling I want this anniversary song to carry is [mood].  
> The promise I want the song to leave with is [message].

Example:

> We met when we were both exhausted and not looking for anything serious.  
> The memory we never stop talking about is the rainy-night diner after our second date.  
> The feeling I want this anniversary song to carry is warm, grateful, and cinematic.  
> The promise I want the song to leave with is that home is wherever we keep choosing each other.

That is enough to create a far more meaningful result than a generic prompt.

## Why One Custom Song fits this search intent

Many readers looking for **anniversary songs for couples** are not only comparing playlists. They are trying to find a gift or a moment that feels unmistakably personal.

One Custom Song fits that intent because it lets you:

- start from a real relationship story
- choose an anniversary mood or genre
- preview the song direction before committing
- refine lyrics, tone, and style
- turn the result into something larger, like a song page, video, or lyric-based keepsake

That makes it useful for people who want more than **good anniversary songs** from a list. They want something that sounds emotionally true.

## Best times to use a custom anniversary song

Custom anniversary songs are especially effective for:

- first-anniversary gift reveals
- milestone 10th or 25th anniversary celebrations
- vow renewal dances
- surprise videos from one partner to the other
- parents or friends gifting a song to a couple

They also work well when one partner is not naturally verbal. A song can say something thoughtful and lasting without sounding stiff.

## Existing playlist vs custom anniversary song

| Option | Best for | Tradeoff |
| --- | --- | --- |
| Existing anniversary playlist | Fast setup, broad familiarity, easy background listening | Less personal, easier to forget |
| One standout classic song | Simple dance moment or emotional anchor | Still shared with many other couples |
| Custom anniversary song | High emotional specificity, keepsake value, gift impact | Requires a few story details to create well |

## Frequently Asked Questions

### What are the best anniversary songs for couples?

The best **anniversary songs for couples** are the ones that fit the celebration and the relationship itself. Some couples want a timeless romantic classic. Others want an intimate acoustic track or a custom anniversary song built from real memories.

### What are good anniversary songs for couples to dance to?

The best dance options have a steady tempo, clear phrasing, and lyrics that feel romantic without being distracting. For public celebrations, classic slow-dance songs usually work well. For private moments, a more personal or custom song can feel stronger.

### Are wedding anniversary songs for couple celebrations different from normal love songs?

Usually, yes. **Wedding anniversary songs for couple** events often need more elegance, broader family appeal, and stronger “shared life” themes than ordinary dating-era love songs.

### What should I use for 25th anniversary songs for couple events?

For a 25th anniversary, choose songs that feel timeless, reflective, and emotionally durable. Many couples combine one classic song with a custom anniversary song that tells their own story.

### Can I make a custom anniversary song without writing lyrics?

Yes. A short story, a few memories, the mood you want, and one lasting message are usually enough to generate a meaningful starting point.

## Create your own anniversary song

If you want something more personal than a generic playlist, start your anniversary song at [/create-song?occasion=anniversary](/create-song?occasion=anniversary), explore examples on [/samples](/samples), or compare options on [/pricing](/pricing).`;
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
      admins.find((admin) => admin.email === "support@onecustomsong.com") ?? admins[0];

    const { url: featuredImageUrl } = await uploadCoverImage();
    const content = buildContent();

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
      title: TITLE,
      slug: SLUG,
      content,
      description: DESCRIPTION,
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
          title: TITLE,
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
