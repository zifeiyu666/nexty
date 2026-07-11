export type PlaylistDimension = "occasion" | "recipient" | "style";

export type PlaylistTrack = {
  title: string;
  artist: string;
  reason: string;
  mood: string;
  moment: string;
};

export type DemoTrack = {
  id: string;
  title: string;
  audioUrl: string;
  duration: string;
  style: string;
};

export type GiftPlaylist = {
  slug: string;
  dimension: PlaylistDimension;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  audience: string;
  mood: string;
  songCountLabel: string;
  image: string;
  accent: string;
  createHref: string;
  canonicalPath: string;
  relatedSlugs: string[];
  tracks: PlaylistTrack[];
  demos: DemoTrack[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const demoTracks = {
  birthday: {
    id: "playlist-demo-birthday",
    title: "Cart and Umbrella",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/sweetest-day-cart-and-umbrella.mp3",
    duration: "1:42",
    style: "Birthday Pop",
  },
  anniversary: {
    id: "playlist-demo-anniversary",
    title: "Ten Years, Ava",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/anniversary-ten-years-ava.mp3",
    duration: "2:05",
    style: "Romantic Ballad",
  },
  mom: {
    id: "playlist-demo-mom",
    title: "Linda My Mom",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/mothers-day-linda-my-mom.mp3",
    duration: "2:12",
    style: "Acoustic",
  },
  dad: {
    id: "playlist-demo-dad",
    title: "Seatbelt and Wrenches",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/fathers-day-seatbelt-and-wrenches.mp3",
    duration: "1:39",
    style: "Country",
  },
  wife: {
    id: "playlist-demo-wife",
    title: "Final Page Forever",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/proposal-final-page-forever.mp3",
    duration: "2:18",
    style: "Romantic Ballad",
  },
  thankYou: {
    id: "playlist-demo-thank-you",
    title: "Ms Country",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/thankyou-ms-country.mp3",
    duration: "1:33",
    style: "Country",
  },
};

const birthdayTracks: PlaylistTrack[] = [
  {
    title: "Isn't She Lovely",
    artist: "Stevie Wonder",
    reason: "A joyful opener when the playlist is for someone who lights up a room.",
    mood: "Joyful",
    moment: "Opening toast",
  },
  {
    title: "Birthday",
    artist: "The Beatles",
    reason: "Classic, familiar, and instantly clear about why everyone is gathered.",
    mood: "Celebratory",
    moment: "Cake moment",
  },
  {
    title: "Count on Me",
    artist: "Bruno Mars",
    reason: "Works well for a friend birthday playlist with a loyal, warm message.",
    mood: "Friendly",
    moment: "Photo slideshow",
  },
  {
    title: "Good Life",
    artist: "OneRepublic",
    reason: "Gives the playlist an upbeat, forward-looking birthday energy.",
    mood: "Optimistic",
    moment: "Party arrival",
  },
  {
    title: "Forever Young",
    artist: "Rod Stewart",
    reason: "A sweet choice for parents, grandparents, or milestone birthdays.",
    mood: "Tender",
    moment: "Family speech",
  },
  {
    title: "Happy",
    artist: "Pharrell Williams",
    reason: "Keeps the room bright when the playlist needs an easy crowd lift.",
    mood: "Bright",
    moment: "Group video",
  },
  {
    title: "You've Got a Friend in Me",
    artist: "Randy Newman",
    reason: "A playful pick for kids, siblings, or lifelong best friends.",
    mood: "Playful",
    moment: "Memory montage",
  },
  {
    title: "Best Day of My Life",
    artist: "American Authors",
    reason: "Fits a birthday recap, party reel, or surprise reveal.",
    mood: "Big-hearted",
    moment: "Highlight reel",
  },
  {
    title: "September",
    artist: "Earth, Wind & Fire",
    reason: "Adds movement and nostalgia without making the playlist too sentimental.",
    mood: "Danceable",
    moment: "Dance floor",
  },
  {
    title: "Cart and Umbrella",
    artist: "One Custom Song",
    reason: "A custom birthday-style song turns shared memories into the centerpiece.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

const anniversaryTracks: PlaylistTrack[] = [
  {
    title: "At Last",
    artist: "Etta James",
    reason: "A timeless romantic anchor for an anniversary dinner or slow dance.",
    mood: "Classic",
    moment: "Dinner",
  },
  {
    title: "All of Me",
    artist: "John Legend",
    reason: "Direct, intimate, and easy to connect with a couple's story.",
    mood: "Devoted",
    moment: "Slow dance",
  },
  {
    title: "Thinking Out Loud",
    artist: "Ed Sheeran",
    reason: "Works for couples who want the playlist to feel warm and familiar.",
    mood: "Romantic",
    moment: "Video montage",
  },
  {
    title: "You Are the Best Thing",
    artist: "Ray LaMontagne",
    reason: "Brings a celebratory soul feel without losing tenderness.",
    mood: "Soulful",
    moment: "Anniversary toast",
  },
  {
    title: "First Day of My Life",
    artist: "Bright Eyes",
    reason: "A stripped-back track for quiet, story-first relationships.",
    mood: "Intimate",
    moment: "Private note",
  },
  {
    title: "Lover",
    artist: "Taylor Swift",
    reason: "Feels like a vow renewal in playlist form.",
    mood: "Dreamy",
    moment: "Home dinner",
  },
  {
    title: "Make You Feel My Love",
    artist: "Adele",
    reason: "A strong choice when the playlist needs emotional weight.",
    mood: "Heartfelt",
    moment: "Letter reading",
  },
  {
    title: "Better Together",
    artist: "Jack Johnson",
    reason: "Keeps the playlist relaxed, sunny, and personal.",
    mood: "Easygoing",
    moment: "Weekend trip",
  },
  {
    title: "The Luckiest",
    artist: "Ben Folds",
    reason: "A gentle closer for a couple looking back on years together.",
    mood: "Reflective",
    moment: "Closing track",
  },
  {
    title: "Ten Years, Ava",
    artist: "One Custom Song",
    reason: "A custom anniversary song can name the people, places, and promises.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

const momTracks: PlaylistTrack[] = [
  {
    title: "A Song for Mama",
    artist: "Boyz II Men",
    reason: "A direct gratitude song that fits Mother's Day or a birthday gift.",
    mood: "Grateful",
    moment: "Mother's Day brunch",
  },
  {
    title: "The Best Day",
    artist: "Taylor Swift",
    reason: "Strong for playlists built around childhood memories with mom.",
    mood: "Nostalgic",
    moment: "Family photos",
  },
  {
    title: "You Raise Me Up",
    artist: "Josh Groban",
    reason: "Works when the message is respect, strength, and lifelong support.",
    mood: "Reverent",
    moment: "Thank-you speech",
  },
  {
    title: "Because You Loved Me",
    artist: "Celine Dion",
    reason: "A big emotional choice for honoring everything she carried.",
    mood: "Emotional",
    moment: "Milestone gift",
  },
  {
    title: "In My Life",
    artist: "The Beatles",
    reason: "A graceful classic for memories, distance, and gratitude.",
    mood: "Reflective",
    moment: "Printed card",
  },
  {
    title: "Sweetest Devotion",
    artist: "Adele",
    reason: "Adds warmth when the playlist is from a child to a mother.",
    mood: "Warm",
    moment: "Quiet listening",
  },
  {
    title: "Wind Beneath My Wings",
    artist: "Bette Midler",
    reason: "A familiar tribute for the person who stayed behind the scenes.",
    mood: "Honoring",
    moment: "Family gathering",
  },
  {
    title: "Linda My Mom",
    artist: "One Custom Song",
    reason: "A custom song can include her name, family rituals, and private jokes.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

const dadTracks: PlaylistTrack[] = [
  {
    title: "Father and Son",
    artist: "Cat Stevens",
    reason: "A thoughtful pick for parent-child reflection and life advice.",
    mood: "Reflective",
    moment: "Father's Day morning",
  },
  {
    title: "My Father's Eyes",
    artist: "Eric Clapton",
    reason: "Works for a deeper playlist about legacy and understanding.",
    mood: "Deep",
    moment: "Long letter",
  },
  {
    title: "There Goes My Life",
    artist: "Kenny Chesney",
    reason: "A country storytelling song that lands well for family milestones.",
    mood: "Storytelling",
    moment: "Family slideshow",
  },
  {
    title: "Drive",
    artist: "Alan Jackson",
    reason: "Great for dads associated with cars, lessons, roads, and small rituals.",
    mood: "Nostalgic",
    moment: "Memory montage",
  },
  {
    title: "Lean on Me",
    artist: "Bill Withers",
    reason: "Simple, strong, and right for the dad who always showed up.",
    mood: "Steady",
    moment: "Thank-you toast",
  },
  {
    title: "Forever Young",
    artist: "Bob Dylan",
    reason: "A blessing-style track for dads and grandfathers.",
    mood: "Tender",
    moment: "Closing track",
  },
  {
    title: "Seatbelt and Wrenches",
    artist: "One Custom Song",
    reason: "A custom dad song can turn his everyday habits into the hook.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

const wifeTracks: PlaylistTrack[] = [
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    reason: "A familiar romantic opener for a wife, anniversary, or vow renewal.",
    mood: "Romantic",
    moment: "Dinner",
  },
  {
    title: "Adore You",
    artist: "Harry Styles",
    reason: "Keeps the playlist modern, warm, and affectionate.",
    mood: "Warm",
    moment: "Weekend drive",
  },
  {
    title: "A Thousand Years",
    artist: "Christina Perri",
    reason: "A cinematic pick for big anniversaries and wedding memories.",
    mood: "Cinematic",
    moment: "Video montage",
  },
  {
    title: "Just the Way You Are",
    artist: "Bruno Mars",
    reason: "A bright, direct reminder that she is seen and loved.",
    mood: "Affirming",
    moment: "Morning surprise",
  },
  {
    title: "Come Away With Me",
    artist: "Norah Jones",
    reason: "Softens the playlist for a private, intimate gift moment.",
    mood: "Quiet",
    moment: "Home dinner",
  },
  {
    title: "XO",
    artist: "Beyonce",
    reason: "Adds lift and glow without breaking the romantic theme.",
    mood: "Glowing",
    moment: "Photo reel",
  },
  {
    title: "Final Page Forever",
    artist: "One Custom Song",
    reason: "A custom song for your wife can carry vows, names, and real memories.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

const countryTracks: PlaylistTrack[] = [
  {
    title: "Speechless",
    artist: "Dan + Shay",
    reason: "A polished country-pop track for romantic playlist gifts.",
    mood: "Romantic",
    moment: "Anniversary dinner",
  },
  {
    title: "Die a Happy Man",
    artist: "Thomas Rhett",
    reason: "A clear fit for wife, husband, or anniversary playlists.",
    mood: "Devoted",
    moment: "Slow dance",
  },
  {
    title: "Humble and Kind",
    artist: "Tim McGraw",
    reason: "Works well for family playlists with advice and gratitude.",
    mood: "Grounded",
    moment: "Family gift",
  },
  {
    title: "My Wish",
    artist: "Rascal Flatts",
    reason: "A country staple for daughters, sons, graduates, and birthdays.",
    mood: "Blessing",
    moment: "Milestone montage",
  },
  {
    title: "Remember When",
    artist: "Alan Jackson",
    reason: "A memory-rich choice for long relationships and parents.",
    mood: "Nostalgic",
    moment: "Anniversary slideshow",
  },
  {
    title: "Seatbelt and Wrenches",
    artist: "One Custom Song",
    reason: "A custom country song can sound personal, grounded, and story-led.",
    mood: "Personal",
    moment: "Gift reveal",
  },
];

export const giftPlaylists = [
  {
    slug: "birthday",
    dimension: "occasion",
    title: "Birthday Playlist Ideas: Songs and Custom Song Gifts",
    shortTitle: "Birthday Playlist",
    eyebrow: "Birthday songs playlist",
    description:
      "Build a birthday playlist with joyful songs, memory-driven picks, and one custom birthday song made from your story.",
    intro:
      "A strong birthday playlist should feel more personal than a shuffle of happy songs. Start with familiar celebration tracks, add songs that match your relationship, then make the gift unforgettable with one original custom song.",
    primaryKeyword: "birthday playlist",
    secondaryKeywords: [
      "birthday songs playlist",
      "birthday playlist for friend",
      "custom birthday song",
    ],
    audience: "Friends, partners, kids, parents, and milestone birthdays",
    mood: "Joyful, nostalgic, personal",
    songCountLabel: "10 song ideas",
    image: "/occasion-generated/avif/04-birthday.avif",
    accent: "rose",
    createHref: "/create-song?occasion=birthday",
    canonicalPath: "/playlists/occasions/birthday",
    relatedSlugs: ["anniversary", "mom", "wife", "country"],
    tracks: birthdayTracks,
    demos: [demoTracks.birthday, demoTracks.thankYou, demoTracks.mom],
    faqs: [
      {
        question: "What songs should I put in a birthday playlist?",
        answer:
          "Mix one obvious birthday song, a few songs tied to your relationship, a joyful crowd-pleaser, and one personal song that mentions the recipient's memories or name.",
      },
      {
        question: "How do I make a birthday playlist feel personal?",
        answer:
          "Add songs connected to shared trips, inside jokes, childhood memories, and a custom birthday song that turns those details into lyrics.",
      },
      {
        question: "Can I create one original song for this playlist?",
        answer:
          "Yes. Use One Custom Song to create a birthday song from names, memories, style, and tone, then place it as the gift reveal track.",
      },
    ],
  },
  {
    slug: "anniversary",
    dimension: "occasion",
    title: "Anniversary Playlist Ideas: Romantic Songs and Custom Gifts",
    shortTitle: "Anniversary Playlist",
    eyebrow: "Anniversary songs playlist",
    description:
      "Plan an anniversary playlist with romantic classics, modern love songs, and a custom anniversary song for your shared story.",
    intro:
      "An anniversary playlist works best when it moves like a relationship: the first spark, the everyday life you built, the promises that still matter, and one song that could only belong to you.",
    primaryKeyword: "anniversary playlist",
    secondaryKeywords: [
      "anniversary songs playlist",
      "romantic anniversary songs",
      "custom anniversary song",
    ],
    audience: "Couples, spouses, vow renewals, and milestone anniversaries",
    mood: "Romantic, reflective, devoted",
    songCountLabel: "10 song ideas",
    image: "/occasion-generated/avif/02-anniversary.avif",
    accent: "amber",
    createHref: "/create-song?occasion=anniversary",
    canonicalPath: "/playlists/occasions/anniversary",
    relatedSlugs: ["wife", "birthday", "mom", "country"],
    tracks: anniversaryTracks,
    demos: [demoTracks.anniversary, demoTracks.wife, demoTracks.birthday],
    faqs: [
      {
        question: "What makes a good anniversary playlist?",
        answer:
          "Use songs that match your history: the beginning, the hard seasons, the ordinary rituals, and the future you still want together.",
      },
      {
        question: "Is a custom song better than a Spotify playlist?",
        answer:
          "A playlist gives context, but a custom song becomes the centerpiece because it can include names, places, vows, and memories.",
      },
      {
        question: "Where should the custom anniversary song go?",
        answer:
          "Place it near the middle as the emotional reveal, or use it as the final track when giving the gift.",
      },
    ],
  },
  {
    slug: "mom",
    dimension: "recipient",
    title: "Songs for Mom Playlist: Mother's Day and Custom Song Ideas",
    shortTitle: "Songs for Mom Playlist",
    eyebrow: "Mother's Day songs playlist",
    description:
      "Create a songs for mom playlist with grateful classics, family memory tracks, and a custom song written just for her.",
    intro:
      "A playlist for mom should sound specific. Choose songs that say thank you, honor what she carried, and leave room for a custom track with her name, family memories, and the details only she would recognize.",
    primaryKeyword: "songs for mom playlist",
    secondaryKeywords: [
      "mother's day songs playlist",
      "custom song for mom",
      "songs for mother playlist",
    ],
    audience: "Moms, grandmothers, stepmoms, and mother figures",
    mood: "Grateful, warm, nostalgic",
    songCountLabel: "8 song ideas",
    image: "/occasion/imgi_35_1668109402.avif",
    accent: "emerald",
    createHref: "/create-song?occasion=mothers-day&recipient=mom",
    canonicalPath: "/playlists/recipients/mom",
    relatedSlugs: ["dad", "birthday", "anniversary", "wife"],
    tracks: momTracks,
    demos: [demoTracks.mom, demoTracks.thankYou, demoTracks.anniversary],
    faqs: [
      {
        question: "What songs should I put in a playlist for mom?",
        answer:
          "Blend gratitude songs, memory songs, and gentle classics. Add one custom song if you want the playlist to mention her actual story.",
      },
      {
        question: "Is this good for Mother's Day?",
        answer:
          "Yes. A Mother's Day playlist works especially well when paired with a note, family photos, or a custom song gift.",
      },
      {
        question: "Can I make a custom song for my mom?",
        answer:
          "Yes. Add her name, relationship details, favorite memories, and preferred style, then create a song that fits the playlist.",
      },
    ],
  },
  {
    slug: "dad",
    dimension: "recipient",
    title: "Songs for Dad Playlist: Father's Day and Custom Song Ideas",
    shortTitle: "Songs for Dad Playlist",
    eyebrow: "Father's Day songs playlist",
    description:
      "Build a songs for dad playlist with country memories, steady gratitude, and a custom Father's Day song.",
    intro:
      "Songs for dad often work best when they avoid being too polished. Use tracks about lessons, small rituals, family stories, and the kind of love that showed up through actions.",
    primaryKeyword: "songs for dad playlist",
    secondaryKeywords: [
      "father's day songs playlist",
      "custom song for dad",
      "songs for father playlist",
    ],
    audience: "Dads, grandfathers, stepdads, and father figures",
    mood: "Steady, nostalgic, grateful",
    songCountLabel: "7 song ideas",
    image: "/occasion/imgi_25_1683057745.avif",
    accent: "sky",
    createHref: "/create-song?occasion=fathers-day&recipient=dad",
    canonicalPath: "/playlists/recipients/dad",
    relatedSlugs: ["mom", "country", "birthday", "anniversary"],
    tracks: dadTracks,
    demos: [demoTracks.dad, demoTracks.thankYou, demoTracks.mom],
    faqs: [
      {
        question: "What songs should I put in a playlist for dad?",
        answer:
          "Choose songs about guidance, family, quiet strength, and shared rituals. Country and acoustic tracks often fit well.",
      },
      {
        question: "How can I make a Father's Day playlist more personal?",
        answer:
          "Include songs connected to things he taught you, then add one custom song that mentions real memories and details.",
      },
      {
        question: "Can One Custom Song make a song for dad?",
        answer:
          "Yes. You can create a song from stories, names, favorite memories, and a style such as country, acoustic, or classic rock.",
      },
    ],
  },
  {
    slug: "wife",
    dimension: "recipient",
    title: "Songs for Wife Playlist: Romantic Love Songs and Custom Gifts",
    shortTitle: "Songs for Wife Playlist",
    eyebrow: "Love songs for wife playlist",
    description:
      "Make a romantic songs for wife playlist with love songs, anniversary tracks, and a custom song written from your memories.",
    intro:
      "A playlist for your wife should feel intentional, not generic. Pair recognizable love songs with tracks that match your life together, then add a custom song as the one she has never heard before.",
    primaryKeyword: "songs for wife playlist",
    secondaryKeywords: [
      "love songs for wife playlist",
      "custom song for wife",
      "romantic songs for wife",
    ],
    audience: "Wives, partners, anniversaries, birthdays, and vow renewals",
    mood: "Romantic, intimate, affirming",
    songCountLabel: "7 song ideas",
    image: "/occasion/imgi_15_1683057771.avif",
    accent: "violet",
    createHref: "/create-song?occasion=anniversary&recipient=wife",
    canonicalPath: "/playlists/recipients/wife",
    relatedSlugs: ["anniversary", "birthday", "mom", "country"],
    tracks: wifeTracks,
    demos: [demoTracks.wife, demoTracks.anniversary, demoTracks.birthday],
    faqs: [
      {
        question: "What songs should I put in a playlist for my wife?",
        answer:
          "Use songs that affirm her, songs tied to your relationship, and one custom song that says what a normal love song cannot.",
      },
      {
        question: "Is a playlist a good anniversary gift for my wife?",
        answer:
          "Yes, especially when it includes a personal note, photos, or an original custom song created from your story.",
      },
      {
        question: "What style works for a custom song for my wife?",
        answer:
          "Romantic ballad, acoustic, R&B, pop, and country all work well depending on her taste and the tone of the gift.",
      },
    ],
  },
  {
    slug: "country",
    dimension: "style",
    title: "Country Love Songs Playlist for Personalized Song Gifts",
    shortTitle: "Country Playlist",
    eyebrow: "Country love songs playlist",
    description:
      "Browse country playlist ideas for romantic gifts, family milestones, and custom songs with grounded storytelling.",
    intro:
      "Country playlists are useful when the gift needs plainspoken emotion, family detail, and story. They work especially well for dads, anniversaries, weddings, and milestone birthdays.",
    primaryKeyword: "country love songs playlist",
    secondaryKeywords: [
      "country custom song",
      "country songs for gifts",
      "country anniversary playlist",
    ],
    audience: "Country fans, couples, parents, and family milestone gifts",
    mood: "Grounded, sincere, storytelling",
    songCountLabel: "6 song ideas",
    image: "/occasion/imgi_43_1683057420.avif",
    accent: "orange",
    createHref: "/create-song?style=country",
    canonicalPath: "/playlists/styles/country",
    relatedSlugs: ["dad", "anniversary", "birthday", "mom"],
    tracks: countryTracks,
    demos: [demoTracks.dad, demoTracks.thankYou, demoTracks.anniversary],
    faqs: [
      {
        question: "When should I use a country playlist for a gift?",
        answer:
          "Country works well for family stories, parent gifts, anniversaries, weddings, graduations, and heartfelt milestone messages.",
      },
      {
        question: "Can I make a custom country song?",
        answer:
          "Yes. Add the recipient, occasion, story details, and country as the style when creating the song.",
      },
      {
        question: "What makes country good for personalized songs?",
        answer:
          "Country songwriting naturally supports names, places, small memories, and emotional storytelling.",
      },
    ],
  },
] satisfies GiftPlaylist[];

export const playlistDimensions: Record<
  PlaylistDimension,
  {
    title: string;
    description: string;
    path: string;
    keywords: string[];
  }
> = {
  occasion: {
    title: "Playlist Ideas by Occasion",
    description:
      "Find birthday, anniversary, wedding, Mother's Day, and Father's Day playlist ideas that can become personal song gifts.",
    path: "/playlists/occasions",
    keywords: [
      "birthday playlist",
      "anniversary playlist",
      "wedding playlist",
      "mother's day playlist",
    ],
  },
  recipient: {
    title: "Playlist Ideas by Recipient",
    description:
      "Browse song playlists for mom, dad, wife, husband, friends, kids, and the people who deserve something personal.",
    path: "/playlists/recipients",
    keywords: [
      "songs for mom playlist",
      "songs for dad playlist",
      "songs for wife playlist",
    ],
  },
  style: {
    title: "Playlist Ideas by Music Style",
    description:
      "Explore country, acoustic, romantic ballad, pop, and R&B playlist ideas for personalized song gifts.",
    path: "/playlists/styles",
    keywords: [
      "country love songs playlist",
      "acoustic love songs playlist",
      "romantic ballad playlist",
    ],
  },
};

export function getPlaylistsByDimension(
  dimension: PlaylistDimension,
): GiftPlaylist[] {
  return giftPlaylists.filter((playlist) => playlist.dimension === dimension);
}

export function getPlaylistByDimensionAndSlug(
  dimension: PlaylistDimension,
  slug: string,
): GiftPlaylist | undefined {
  return giftPlaylists.find(
    (playlist) => playlist.dimension === dimension && playlist.slug === slug,
  );
}

export function getPlaylistBySlug(slug: string): GiftPlaylist | undefined {
  return giftPlaylists.find((playlist) => playlist.slug === slug);
}

export function getRelatedPlaylists(playlist: GiftPlaylist): GiftPlaylist[] {
  return playlist.relatedSlugs
    .map((slug) => getPlaylistBySlug(slug))
    .filter((item): item is GiftPlaylist => Boolean(item));
}

export function getFeaturedPlaylists(): GiftPlaylist[] {
  return ["birthday", "anniversary", "mom", "wife", "dad", "country"]
    .map((slug) => getPlaylistBySlug(slug))
    .filter((item): item is GiftPlaylist => Boolean(item));
}

export function getAllPlaylistPaths(): string[] {
  return [
    "/playlists",
    "/playlists/occasions",
    "/playlists/recipients",
    "/playlists/styles",
    ...giftPlaylists.map((playlist) => playlist.canonicalPath),
  ];
}
