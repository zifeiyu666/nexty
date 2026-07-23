export const OCCASION_LANDING_SLUGS = [
  "mothers-day",
  "fathers-day",
  "valentines-day",
  "congratulations",
  "wedding",
  "in-memoriam",
  "thank-you",
  "get-well-soon",
] as const;

export type OccasionLandingSlug = (typeof OCCASION_LANDING_SLUGS)[number];

type IconName =
  | "award"
  | "celebration"
  | "clock"
  | "flower"
  | "gift"
  | "heart"
  | "message"
  | "music"
  | "rings"
  | "sparkles"
  | "star"
  | "sun";

export type OccasionContentItem = {
  title: string;
  description: string;
  icon: IconName;
};

export type OccasionTopic = OccasionContentItem & {
  keywords: string[];
  prompt: string;
};

export type OccasionExample = {
  label: string;
  title: string;
  text: string;
};

export type OccasionTestimonial = {
  quote: string;
  author: string;
  badge: string;
};

export type OccasionFaq = {
  question: string;
  answer: string;
};

export type OccasionLandingConfig = {
  slug: OccasionLandingSlug;
  occasion: string;
  shortName: string;
  primaryKeyword: string;
  keywords: string[];
  metadata: {
    title: string;
    description: string;
  };
  palette: {
    accent: string;
    accentDark: string;
    soft: string;
    muted: string;
    ink: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    cardTitle: string;
    cardDescription: string;
    cta: string;
  };
  why: {
    title: string;
    description: string;
    benefits: OccasionContentItem[];
  };
  how: {
    title: string;
    description: string;
    steps: Array<{ kicker: string; title: string; description: string }>;
  };
  moments: {
    title: string;
    description: string;
    items: OccasionContentItem[];
  };
  topics: {
    title: string;
    description: string;
    items: OccasionTopic[];
  };
  examples: {
    title: string;
    description: string;
    items: OccasionExample[];
  };
  testimonials: {
    title: string;
    description: string;
    items: OccasionTestimonial[];
  };
  faq: {
    title: string;
    description: string;
    ctaTitle: string;
    ctaDescription: string;
    items: OccasionFaq[];
  };
};

type ConfigInput = Omit<OccasionLandingConfig, "why" | "how"> & {
  storyDetails: string;
  styleOptions: string;
  deliveryIdeas: string;
};

function createConfig(input: ConfigInput): OccasionLandingConfig {
  return {
    ...input,
    hero: { ...input.hero, cta: input.hero.cta },
    why: {
      title: `Why a ${input.primaryKeyword} feels different`,
      description: `A ${input.primaryKeyword} turns details only you know into lyrics, vocals, and a replayable gift made for one person or one meaningful moment.`,
      benefits: [
        {
          title: "Real details in the lyrics",
          description: input.storyDetails,
          icon: "message",
        },
        {
          title: "A style that fits the moment",
          description: `Choose ${input.styleOptions}, or let the song maker match the arrangement to your story.`,
          icon: "music",
        },
        {
          title: "Free preview in minutes",
          description: `Hear a personalized ${input.shortName.toLowerCase()} song sample first, then refine the lyrics or music before unlocking the full track.`,
          icon: "clock",
        },
        {
          title: "More than an audio file",
          description: `Share the song privately, add a music video, or turn the lyrics into printable wall art. ${input.deliveryIdeas}`,
          icon: "gift",
        },
      ],
    },
    how: {
      title: `From real story to ${input.primaryKeyword}`,
      description: `You provide the names, memories, message, and mood. The AI song generator shapes them into original lyrics, music, and vocals you can preview before sharing.`,
      steps: [
        {
          kicker: "01",
          title: "Share the story",
          description: input.storyDetails,
        },
        {
          kicker: "02",
          title: "Choose the feeling",
          description: `Pick ${input.styleOptions}, or describe the reaction you want the song to create.`,
        },
        {
          kicker: "03",
          title: "Preview and refine",
          description:
            "Listen to the free sample, adjust the lyrics, and try another genre until the message sounds right.",
        },
        {
          kicker: "04",
          title: "Share the moment",
          description: `${input.deliveryIdeas} Keep the full track as a song they can return to after the occasion.`,
        },
      ],
    },
  };
}

const configs: Record<OccasionLandingSlug, OccasionLandingConfig> = {
  "mothers-day": createConfig({
    slug: "mothers-day",
    occasion: "mothers-day",
    shortName: "Mother's Day",
    primaryKeyword: "custom Mother's Day song",
    keywords: [
      "custom Mother's Day song",
      "Mother's Day song generator",
      "personalized song for mom",
      "Mother's Day song gift",
      "AI Mother's Day song",
      "song for mom",
      "personalized Mother's Day gift",
    ],
    metadata: {
      title: "Custom Mother's Day Song for Mom",
      description:
        "Create a custom Mother's Day song with her name, family memories, and a free preview. Make a personalized song for Mom she can replay anytime.",
    },
    palette: {
      accent: "#d1495b",
      accentDark: "#a83245",
      soft: "#fff1f3",
      muted: "#f4eee9",
      ink: "#2b171b",
    },
    hero: {
      badge: "Personalized Mother's Day song gifts",
      title: "Custom Mother's Day Song",
      description:
        "Turn her name, the stories she tells, and the love she gives into a custom Mother's Day song. Preview a personalized song for Mom, refine the lyrics, and give her a gift that sounds like your family.",
      image: "/images/occasions/mothers-day-song-hero.webp",
      imageAlt:
        "Mother and adult daughter sharing headphones while listening to a custom Mother's Day song",
      cardTitle: "Made for the woman who made home",
      cardDescription:
        "Include her sayings, recipes, strength, family rituals, and the small things everyone remembers.",
      cta: "Create a Mother's Day Song",
    },
    storyDetails:
      "Add her name, nickname, family traditions, favorite advice, the way she shows love, and one memory only your family would recognize.",
    styleOptions:
      "warm acoustic, folk pop, country, soulful R&B, or a gentle ballad",
    deliveryIdeas:
      "Play it over breakfast, add it to a family slideshow, or send it when you cannot celebrate in person.",
    moments: {
      title: "Personalized Mother's Day songs for every kind of mom",
      description:
        "Create a Mother's Day song for your own mom, a grandmother, your wife, or another mother figure whose care deserves more than a generic card.",
      items: [
        {
          title: "For Mom",
          description:
            "Build a song around childhood memories, her favorite phrase, and the values she passed on.",
          icon: "heart",
        },
        {
          title: "For Grandma",
          description:
            "Honor family history, recipes, traditions, grandchildren, and the stories that connect generations.",
          icon: "flower",
        },
        {
          title: "For your wife",
          description:
            "Thank the mother of your children for the patience, laughter, and everyday work that holds your family together.",
          icon: "sparkles",
        },
        {
          title: "For a new mom",
          description:
            "Celebrate her first Mother's Day with the baby's name, the first sleepless weeks, and the love already filling the home.",
          icon: "sun",
        },
        {
          title: "For a mother figure",
          description:
            "Create a gratitude song for the aunt, stepmom, mentor, or chosen family member who showed up like a mother.",
          icon: "star",
        },
        {
          title: "For a family tribute",
          description:
            "Collect short memories from siblings and turn many voices into one Mother's Day surprise.",
          icon: "music",
        },
      ],
    },
    topics: {
      title: "Mother's Day song ideas built around her real life",
      description:
        "These high-intent Mother's Day song searches work best when the lyrics move past generic praise and name the care, humor, and history that make her unique.",
      items: [
        {
          title: "Personalized song for Mom",
          description:
            "A direct, emotional gift centered on her name and the details that make her feel seen.",
          keywords: ["personalized song for mom", "song for mom"],
          prompt:
            "Mention Sunday pancakes, her garden, the advice you still repeat, and what home feels like because of her.",
          icon: "heart",
        },
        {
          title: "Mother's Day song from daughter",
          description:
            "A daughter-to-mother song can hold gratitude, inherited strength, and memories from growing up.",
          keywords: ["Mother's Day song from daughter", "mother daughter song"],
          prompt:
            "Include a childhood ritual, something you understand now that you are older, and one quality you hope to carry forward.",
          icon: "flower",
        },
        {
          title: "Mother's Day song from son",
          description:
            "A son-to-mother tribute can be warm, proud, funny, or quietly thankful without sounding formal.",
          keywords: ["Mother's Day song from son", "song for mother from son"],
          prompt:
            "Add her nickname, the meal you always ask for, the rule that shaped you, and the message you find hard to say aloud.",
          icon: "music",
        },
        {
          title: "First Mother's Day song",
          description:
            "Mark the first year of motherhood with newborn details and a message from a partner or child.",
          keywords: ["first Mother's Day song", "new mom song gift"],
          prompt:
            "Mention the baby's name, a tiny everyday moment, her strength, and the kind of mother you already see her becoming.",
          icon: "sparkles",
        },
      ],
    },
    examples: {
      title: "Start with a few true Mother's Day details",
      description:
        "A useful brief needs a name, relationship, memory, and mood. Plain language gives the song maker the strongest material.",
      items: [
        {
          label: "From daughter",
          title: "Sunday kitchen memories",
          text: "Write a warm acoustic Mother's Day song for Linda from her daughter Emma. Mention Sunday pancakes, her garden, the blue mixing bowl, and how she taught me to stay brave.",
        },
        {
          label: "For grandma",
          title: "Three generations",
          text: "Create a gentle folk song for Grandma Rosa. Include her tamales, the stories at the family table, all six grandchildren, and the phrase 'love always makes room'.",
        },
        {
          label: "First Mother's Day",
          title: "A new family",
          text: "Make a soft modern ballad for Maya's first Mother's Day from Alex and baby Leo. Mention midnight rocking, tiny socks, her patience, and how she made our apartment feel like home.",
        },
      ],
    },
    testimonials: {
      title: "Mother's Day songs that say the specific thank you",
      description:
        "The strongest reactions come from details a store-bought gift could never know.",
      items: [
        {
          quote:
            "The chorus used Mom's exact saying about always making room at the table. She laughed, then cried, then played it again.",
          author: "Nina P.",
          badge: "Song for Mom",
        },
        {
          quote:
            "My brothers each sent one memory. The finished song sounded like our whole childhood in three minutes.",
          author: "Carlos M.",
          badge: "Family tribute",
        },
        {
          quote:
            "We made it for my wife's first Mother's Day. The line about 3 a.m. rocking was the moment that got her.",
          author: "Jordan L.",
          badge: "First Mother's Day",
        },
      ],
    },
    faq: {
      title: "Custom Mother's Day song questions",
      description:
        "Everything you need to turn family memories into a personalized Mother's Day song gift.",
      ctaTitle: "Ready to make Mom's song?",
      ctaDescription:
        "Add her name, the memories, and what you want her to know. Start with a free personalized preview.",
      items: [
        {
          question:
            "Can I make a personalized Mother's Day song with her name?",
          answer:
            "Yes. Add her name or nickname, your relationship, family memories, and the message you want her to hear. Those details can appear naturally in the verses or chorus.",
        },
        {
          question: "Is this a Mother's Day song generator?",
          answer:
            "Yes. The AI Mother's Day song generator turns your written story into original lyrics, music, and vocals. You can preview the result and refine it before unlocking the full song.",
        },
        {
          question: "What should I include in a song for Mom?",
          answer:
            "Use specific details: a family ritual, advice she gave, a favorite recipe, an inside joke, a difficult season she helped you through, and the quality you admire most.",
        },
        {
          question: "Can siblings create one Mother's Day song together?",
          answer:
            "Yes. Gather one or two memories from each sibling and explain how you want the chorus to unite them. A shared family tribute often gives the lyrics more texture.",
        },
        {
          question: "Can I make a Mother's Day song for Grandma or my wife?",
          answer:
            "Absolutely. The same flow works for grandmothers, wives, stepmoms, aunts, mentors, and mother figures. State the relationship clearly so the lyrics use the right point of view.",
        },
        {
          question: "How can I give the song on Mother's Day?",
          answer:
            "Play it during breakfast, add it to a slideshow, send a private link, or combine the final track with a music video or printable lyric wall art.",
        },
      ],
    },
  }),

  "fathers-day": createConfig({
    slug: "fathers-day",
    occasion: "fathers-day",
    shortName: "Father's Day",
    primaryKeyword: "custom Father's Day song",
    keywords: [
      "custom Father's Day song",
      "Father's Day song generator",
      "personalized song for Dad",
      "Father's Day song gift",
      "AI Father's Day song",
      "song for dad",
      "personalized Father's Day gift",
    ],
    metadata: {
      title: "Custom Father's Day Song for Dad",
      description:
        "Create a custom Father's Day song with Dad's name, stories, and a free preview. Make a personalized song for Dad that sounds like your family.",
    },
    palette: {
      accent: "#287271",
      accentDark: "#185655",
      soft: "#edf8f6",
      muted: "#f3efe8",
      ink: "#142d2c",
    },
    hero: {
      badge: "Personalized Father's Day song gifts",
      title: "Custom Father's Day Song",
      description:
        "Turn Dad's jokes, advice, road trips, workshop stories, and quiet ways of showing up into a custom Father's Day song. Preview it free, shape the lyrics, and give him a personalized song he will actually replay.",
      image: "/images/occasions/fathers-day-song-hero.webp",
      imageAlt:
        "Father and adult son laughing together while listening to a custom Father's Day song",
      cardTitle: "Built from the stories he always tells",
      cardDescription:
        "Add the nickname, the lesson, the legendary joke, and the moment that explains what kind of dad he is.",
      cta: "Create a Father's Day Song",
    },
    storyDetails:
      "Add his name, nickname, favorite saying, a lesson he taught, a shared project or trip, and the small habit everyone recognizes.",
    styleOptions:
      "country, folk rock, classic rock, acoustic, soul, or upbeat pop",
    deliveryIdeas:
      "Play it at a barbecue, send it to a long-distance dad, or use it as the soundtrack for a family photo video.",
    moments: {
      title: "Personalized Father's Day songs for every dad story",
      description:
        "Make the tone proud, funny, grateful, or understated for dads, grandfathers, husbands, stepdads, and the people who stepped into the role.",
      items: [
        {
          title: "For Dad",
          description:
            "Use the advice, routines, projects, and jokes that shaped everyday family life.",
          icon: "heart",
        },
        {
          title: "For Grandpa",
          description:
            "Turn family history, old stories, grandchildren, and hard-earned wisdom into a lasting tribute.",
          icon: "star",
        },
        {
          title: "For your husband",
          description:
            "Celebrate the father your children know through bedtime rituals, weekend chaos, and steady care.",
          icon: "sparkles",
        },
        {
          title: "For a stepdad",
          description:
            "Thank the person who chose to show up, teach, listen, and build trust over time.",
          icon: "award",
        },
        {
          title: "For a new dad",
          description:
            "Mark his first Father's Day with the baby's name, first milestones, and the joy behind the tired eyes.",
          icon: "sun",
        },
        {
          title: "For a funny reveal",
          description:
            "Lead with the lawn obsession, terrible puns, road-trip rules, or signature dance before the heartfelt chorus lands.",
          icon: "celebration",
        },
      ],
    },
    topics: {
      title: "Father's Day song ideas for the dads people search for",
      description:
        "Dad-focused searches split across gratitude, humor, new parenthood, and family legacy. Each angle needs details that sound unmistakably like him.",
      items: [
        {
          title: "Personalized song for Dad",
          description:
            "The broadest gift intent: his name, his story, and a message that goes beyond a standard Father's Day card.",
          keywords: ["personalized song for dad", "song for dad"],
          prompt:
            "Mention his nickname, the advice he repeats, a shared project, and the way he helps without making a big deal of it.",
          icon: "heart",
        },
        {
          title: "Father's Day song from daughter",
          description:
            "Build around protection, encouragement, shared humor, and the ways a father helped his daughter grow.",
          keywords: ["Father's Day song from daughter", "dad daughter song"],
          prompt:
            "Include a childhood outing, the standard he set, one thing you inherited from him, and what you want him to know now.",
          icon: "star",
        },
        {
          title: "Father's Day song from son",
          description:
            "Use shared work, sports, music, travel, or life lessons without forcing the emotion.",
          keywords: ["Father's Day song from son", "father son song"],
          prompt:
            "Add a project you did together, the mistake he helped you fix, a phrase he uses, and the respect behind the story.",
          icon: "music",
        },
        {
          title: "First Father's Day song",
          description:
            "Celebrate a new dad through tiny routines, protective love, and the family identity taking shape.",
          keywords: ["first Father's Day song", "new dad song gift"],
          prompt:
            "Mention the baby's name, his first dad habit, a sleepless-night memory, and the future you can already picture.",
          icon: "sparkles",
        },
      ],
    },
    examples: {
      title: "Give the Father's Day song maker real material",
      description:
        "A few concrete memories create stronger lyrics than a long list of generic compliments.",
      items: [
        {
          label: "From son",
          title: "Garage lessons",
          text: "Write a warm folk-rock Father's Day song for Mike from his son Ben. Mention the red toolbox, learning to change a tire, his terrible puns, and the rule 'leave it better than you found it'.",
        },
        {
          label: "From daughter",
          title: "Always in the front row",
          text: "Create an acoustic song for Dad from Olivia. Include Saturday soccer games, airport pickups, the green raincoat, and how he always made me feel capable.",
        },
        {
          label: "New dad",
          title: "First Father's Day",
          text: "Make an upbeat soul song for Marcus from Jamie and baby Noah. Mention bottle duty, the made-up lullaby, stroller walks, and how naturally he became our safe place.",
        },
      ],
    },
    testimonials: {
      title: "Father's Day songs with his fingerprints all over them",
      description:
        "Specific details let the song feel proud and personal without becoming overly sentimental.",
      items: [
        {
          quote:
            "Dad recognized the toolbox story in the first verse and immediately called my brother to play it again.",
          author: "Ben R.",
          badge: "Song for Dad",
        },
        {
          quote:
            "The lyrics were funny enough for him and sincere enough for the rest of us. That balance was exactly right.",
          author: "Alyssa T.",
          badge: "Family barbecue",
        },
        {
          quote:
            "We used the song in a video for my husband's first Father's Day. The made-up lullaby line was perfect.",
          author: "Jamie C.",
          badge: "New dad",
        },
      ],
    },
    faq: {
      title: "Custom Father's Day song questions",
      description:
        "How to turn Dad's real stories into a personalized Father's Day music gift.",
      ctaTitle: "Ready to make Dad's song?",
      ctaDescription:
        "Share the joke, lesson, or memory that sounds like him and hear a free preview.",
      items: [
        {
          question:
            "Can I create a personalized Father's Day song with Dad's name?",
          answer:
            "Yes. Add his name or nickname, your relationship, a few memories, and the message you want the chorus to carry.",
        },
        {
          question: "Is this an AI Father's Day song generator?",
          answer:
            "Yes. It creates original lyrics, music, and vocals from your story. You can preview the song, revise the lyrics, and change the genre before finalizing.",
        },
        {
          question: "What details make a good song for Dad?",
          answer:
            "Use details only the family knows: a favorite saying, a shared hobby, the car or project you worked on, a trip, a lesson, and one quietly caring habit.",
        },
        {
          question: "Can the Father's Day song be funny?",
          answer:
            "Absolutely. Start with the puns, grilling rules, lawn routine, or family legend, then tell the song maker whether the chorus should stay playful or turn heartfelt.",
        },
        {
          question: "Can I make a song for Grandpa, my husband, or a stepdad?",
          answer:
            "Yes. State the exact relationship and point of view. The song can honor a grandfather's legacy, a partner's parenting, or a stepdad who chose to be present.",
        },
        {
          question: "How quickly can I hear a Father's Day song preview?",
          answer:
            "After you submit the story and style, the generator can create a preview in minutes. Listen before deciding whether to refine or unlock the full track.",
        },
      ],
    },
  }),

  "valentines-day": createConfig({
    slug: "valentines-day",
    occasion: "valentines-day",
    shortName: "Valentine's Day",
    primaryKeyword: "personalized Valentine's Day song",
    keywords: [
      "personalized Valentine's Day song",
      "custom Valentine's Day song",
      "Valentine's Day song generator",
      "personalized love song",
      "romantic song gift",
      "Valentine's Day gift for partner",
      "AI love song",
    ],
    metadata: {
      title: "Personalized Valentine's Day Song",
      description:
        "Create a personalized Valentine's Day song from your names, love story, and private memories. Preview a custom love song before sharing it.",
    },
    palette: {
      accent: "#b8325a",
      accentDark: "#84203f",
      soft: "#fff0f5",
      muted: "#f3edf0",
      ink: "#2d1420",
    },
    hero: {
      badge: "A custom love song for your Valentine",
      title: "Personalized Valentine's Day Song",
      description:
        "Turn the first date, the private nickname, the ordinary ritual, and the future you imagine into a personalized Valentine's Day song. Preview your custom love song, refine every line, and give them something no playlist can duplicate.",
      image: "/images/occasions/valentines-day-song-hero.webp",
      imageAlt:
        "Couple sharing headphones during a romantic evening while listening to a personalized Valentine's Day song",
      cardTitle: "Your relationship, not a generic love lyric",
      cardDescription:
        "Use the place you met, the joke no one else understands, and the small detail that makes the relationship feel like home.",
      cta: "Create a Valentine's Day Song",
    },
    storyDetails:
      "Add both names, where you met, a favorite date, a private nickname, an everyday ritual, and the promise or feeling you want in the chorus.",
    styleOptions:
      "romantic ballad, R&B, acoustic, jazz, indie pop, or cinematic soul",
    deliveryIdeas:
      "Play it over dinner, hide the link in a card, use it for a proposal, or add it to a private photo montage.",
    moments: {
      title: "Custom Valentine's Day songs for every love story",
      description:
        "Create a romantic song for a new relationship, a long-term partner, a spouse, a long-distance Valentine, or a proposal that needs its own soundtrack.",
      items: [
        {
          title: "For your girlfriend",
          description:
            "Name the moments that make her feel seen, from the first date to the tiny ritual you look forward to.",
          icon: "heart",
        },
        {
          title: "For your boyfriend",
          description:
            "Mix affection, humor, and the specific ways he makes ordinary days better.",
          icon: "music",
        },
        {
          title: "For your wife",
          description:
            "Write from shared history, family life, resilience, attraction, and the choice to keep growing together.",
          icon: "sparkles",
        },
        {
          title: "For your husband",
          description:
            "Turn the relationship's private language, adventures, and steady support into a replayable love note.",
          icon: "star",
        },
        {
          title: "For long-distance love",
          description:
            "Use time zones, travel days, voice notes, and the next reunion to make distance part of the story.",
          icon: "sun",
        },
        {
          title: "For a proposal",
          description:
            "Build toward the question with the first meeting, the turning point, and the future you want to choose together.",
          icon: "rings",
        },
      ],
    },
    topics: {
      title: "Valentine's Day song ideas for partners and proposals",
      description:
        "The highest-value searches combine the holiday with relationship, gift, and personalization intent. The lyrics should prove the song belongs to one couple.",
      items: [
        {
          title: "Personalized love song",
          description:
            "A year-round romantic song that becomes especially meaningful as a Valentine's Day gift.",
          keywords: ["personalized love song", "custom love song"],
          prompt:
            "Include where you met, a favorite ordinary moment, what you admire, and the central promise for the chorus.",
          icon: "heart",
        },
        {
          title: "Valentine's song for girlfriend",
          description:
            "Use emotional specificity and details that show attention rather than generic praise.",
          keywords: [
            "Valentine's song for girlfriend",
            "romantic song for her",
          ],
          prompt:
            "Mention the first date, her laugh, a small habit you love, and the future adventure you keep discussing.",
          icon: "flower",
        },
        {
          title: "Valentine's song for boyfriend",
          description:
            "Balance romance with shared humor, support, and the moments that built trust.",
          keywords: ["Valentine's song for boyfriend", "romantic song for him"],
          prompt:
            "Add a trip, an inside joke, how he supports you, and one line that sounds like something only you would say.",
          icon: "music",
        },
        {
          title: "Proposal song",
          description:
            "A custom proposal song can lead naturally from your origin story to the question.",
          keywords: ["custom proposal song", "personalized proposal song"],
          prompt:
            "Describe the first meeting, the moment you knew, the life you want together, and the exact emotional landing before you propose.",
          icon: "rings",
        },
      ],
    },
    examples: {
      title: "Start your Valentine's Day song with the real relationship",
      description:
        "Names, scenes, and private language create a stronger love song than broad romantic adjectives.",
      items: [
        {
          label: "For girlfriend",
          title: "Bookstore first date",
          text: "Write a warm indie-pop Valentine's Day song for Sophie from Daniel. Mention our bookstore first date, Sunday pancakes, her yellow scarf, and how she makes crowded places feel calm.",
        },
        {
          label: "For husband",
          title: "Ten years of ordinary magic",
          text: "Create a soulful R&B song for my husband Andre. Include our tiny first apartment, school-run coffee, dancing in the kitchen, and the line 'I would choose this life again'.",
        },
        {
          label: "Proposal",
          title: "The next chapter",
          text: "Make a cinematic love song for Priya from Sam. Mention meeting on the delayed train, the Lisbon trip, our dog Milo, and build the final chorus toward asking her to marry me.",
        },
      ],
    },
    testimonials: {
      title: "Valentine's Day songs that sound like one couple",
      description:
        "Private details make the romantic gesture feel sincere instead of borrowed.",
      items: [
        {
          quote:
            "The song mentioned the exact train platform where we met. She knew in seconds it could only be ours.",
          author: "Sam D.",
          badge: "Proposal song",
        },
        {
          quote:
            "It was romantic without being generic. The kitchen-dancing line sounded like us on a normal Tuesday.",
          author: "Maya R.",
          badge: "For my husband",
        },
        {
          quote:
            "We are long distance, so I sent the preview link at midnight in her time zone. She played it on our call three times.",
          author: "Eli W.",
          badge: "Long-distance Valentine",
        },
      ],
    },
    faq: {
      title: "Personalized Valentine's Day song questions",
      description:
        "Plan a custom romantic song using your names, memories, mood, and relationship point of view.",
      ctaTitle: "Ready to turn your love story into a song?",
      ctaDescription:
        "Share the first date, the private joke, and the feeling you want them to remember.",
      items: [
        {
          question: "Can I create a Valentine's Day song with our names?",
          answer:
            "Yes. Add both names, nicknames, relationship details, and the moments you want included. The generator can weave them naturally into the verses or chorus.",
        },
        {
          question: "What makes a good personalized love song?",
          answer:
            "The best custom love songs use concrete scenes: where you met, an ordinary ritual, a challenge you handled together, a private phrase, and a clear emotional promise.",
        },
        {
          question: "Can I use the song for a proposal?",
          answer:
            "Yes. Explain the relationship arc and tell the song maker where the proposal should land emotionally. You can preview the song before planning the final reveal.",
        },
        {
          question: "Can the song be playful instead of a slow ballad?",
          answer:
            "Absolutely. Choose indie pop, upbeat funk, playful acoustic, jazz, R&B, or another style that feels more like your relationship.",
        },
        {
          question: "Is this an AI Valentine's Day song generator?",
          answer:
            "Yes. It turns your written love story into original lyrics, music, and vocals, with a preview and options to refine the result.",
        },
        {
          question: "How should I give a custom Valentine's Day song?",
          answer:
            "Play it during dinner, share it in a digital card, add it to a photo video, use it before a proposal, or turn a favorite lyric into wall art.",
        },
      ],
    },
  }),

  congratulations: createConfig({
    slug: "congratulations",
    occasion: "congratulations",
    shortName: "Congratulations",
    primaryKeyword: "custom congratulations song",
    keywords: [
      "custom congratulations song",
      "personalized celebration song",
      "congratulations song",
      "graduation song",
      "achievement song",
      "promotion gift",
      "AI celebration song",
    ],
    metadata: {
      title: "Custom Congratulations Song",
      description:
        "Create a custom congratulations song for a graduation, promotion, new job, award, or big win. Add their story and preview it free.",
    },
    palette: {
      accent: "#146cc2",
      accentDark: "#0b4e91",
      soft: "#edf6ff",
      muted: "#f4f1e9",
      ink: "#14263a",
    },
    hero: {
      badge: "Personalized songs for hard-earned wins",
      title: "Custom Congratulations Song",
      description:
        "Celebrate the work behind the win with a custom congratulations song. Add the late nights, setbacks, inside jokes, and proud moment, then preview a personalized celebration song for a graduation, promotion, award, or new chapter.",
      image: "/images/occasions/congratulations-song-hero.webp",
      imageAlt:
        "Graduate smiling with family while listening to a custom congratulations song",
      cardTitle: "Celebrate the work, not only the result",
      cardDescription:
        "Name the challenge, the breakthrough, the people who helped, and the future opening up next.",
      cta: "Create a Congratulations Song",
    },
    storyDetails:
      "Add the person's name, the achievement, what it took to get there, a setback they overcame, and the proud message you want them to carry forward.",
    styleOptions:
      "anthemic pop, hip-hop, upbeat rock, cinematic, gospel-inspired soul, or celebratory dance",
    deliveryIdeas:
      "Play it at the party, graduation dinner, team call, office reveal, or inside a highlight video.",
    moments: {
      title: "A personalized celebration song for every kind of win",
      description:
        "Use one song flow for academic milestones, career moves, personal breakthroughs, awards, and the brave first step into something new.",
      items: [
        {
          title: "Graduation",
          description:
            "Celebrate the exams, late nights, friendships, and future behind the cap and gown.",
          icon: "award",
        },
        {
          title: "Promotion",
          description:
            "Recognize the leadership, persistence, and hard work that made the next role possible.",
          icon: "star",
        },
        {
          title: "New job",
          description:
            "Turn the interview journey, career change, and excitement of a fresh start into an upbeat reveal.",
          icon: "sun",
        },
        {
          title: "Award or competition",
          description:
            "Name the training, practice, teamwork, and decisive moment behind the result.",
          icon: "celebration",
        },
        {
          title: "New home or business",
          description:
            "Celebrate the risk, planning, keys, opening day, and future being built.",
          icon: "sparkles",
        },
        {
          title: "Recovery or personal goal",
          description:
            "Honor the discipline behind a marathon, certification, sobriety milestone, or another deeply personal achievement.",
          icon: "heart",
        },
      ],
    },
    topics: {
      title: "Congratulations songs for the milestones people search most",
      description:
        "Searchers often want a familiar celebration playlist. A custom song offers a stronger alternative by naming the achievement and the effort behind it.",
      items: [
        {
          title: "Custom graduation song",
          description:
            "Turn school memories and future hopes into a graduation soundtrack made for one student.",
          keywords: ["custom graduation song", "personalized graduation song"],
          prompt:
            "Include the school chapter, late-night study habit, closest supporters, proudest moment, and dream for what comes next.",
          icon: "award",
        },
        {
          title: "Promotion congratulations song",
          description:
            "Celebrate the work and leadership behind a new title without sounding like a generic office message.",
          keywords: ["promotion congratulations song", "promotion gift song"],
          prompt:
            "Mention the first role, a challenge they solved, the team they helped, and why the promotion fits who they have become.",
          icon: "star",
        },
        {
          title: "Achievement song",
          description:
            "A flexible angle for awards, races, certifications, creative launches, and personal milestones.",
          keywords: ["achievement song", "song to celebrate an accomplishment"],
          prompt:
            "Name the goal, the obstacle, the moment it finally clicked, and the person or habit that kept them moving.",
          icon: "celebration",
        },
        {
          title: "New job celebration song",
          description:
            "Mark a career change or first job with confidence, humor, and forward motion.",
          keywords: ["new job congratulations song", "new career gift"],
          prompt:
            "Add the interview story, the old role they outgrew, the strength they bring, and the future the new job opens.",
          icon: "sun",
        },
      ],
    },
    examples: {
      title: "Describe the road to the achievement",
      description:
        "The result matters, but the work, setback, and turning point make the congratulations song personal.",
      items: [
        {
          label: "Graduation",
          title: "Nursing school finish line",
          text: "Write an uplifting pop song for Maya's nursing graduation. Mention night shifts, color-coded flashcards, her study group, and how she kept choosing care even when she was exhausted.",
        },
        {
          label: "Promotion",
          title: "From intern to director",
          text: "Create a confident soul anthem for Marcus. Include starting as an intern, the impossible launch, mentoring the new team, and the phrase 'you earned the room'.",
        },
        {
          label: "Personal goal",
          title: "First marathon",
          text: "Make an energetic indie-rock song for Leah. Mention rainy training runs, mile 18, her sister at the finish line, and how she proved she can keep going when it gets hard.",
        },
      ],
    },
    testimonials: {
      title: "Congratulations songs that remember the climb",
      description:
        "A personalized song makes the achievement feel witnessed, not merely announced.",
      items: [
        {
          quote:
            "Her nursing school friends recognized every detail. It felt like a three-minute highlight reel of the last four years.",
          author: "Tara S.",
          badge: "Graduation",
        },
        {
          quote:
            "We played it on the team call after his promotion. The intern-to-director line got the biggest reaction.",
          author: "Priya N.",
          badge: "Promotion",
        },
        {
          quote:
            "The song did not just say congrats. It named the rainy runs and the injury comeback, which made the finish feel real.",
          author: "Owen J.",
          badge: "Marathon",
        },
      ],
    },
    faq: {
      title: "Custom congratulations song questions",
      description:
        "Choose the achievement, tone, and details that turn a generic celebration into a personal anthem.",
      ctaTitle: "Ready to celebrate their win?",
      ctaDescription:
        "Add the achievement, the hard part, and the proud message. Hear a free preview in minutes.",
      items: [
        {
          question: "What is a good song for congratulations?",
          answer:
            "A good congratulations song matches the achievement and the person. A custom song can go further by naming the work, setbacks, supporters, and future behind the win.",
        },
        {
          question: "Can I make a custom graduation song?",
          answer:
            "Yes. Include the graduate's name, school chapter, favorite memories, challenges, and what you hope comes next.",
        },
        {
          question: "Can the song celebrate a promotion or new job?",
          answer:
            "Yes. Explain the career story, the accomplishment that led to the opportunity, and whether the tone should feel polished, funny, triumphant, or emotional.",
        },
        {
          question: "Is this an AI congratulations song generator?",
          answer:
            "Yes. It creates original lyrics, music, and vocals from your story. You can preview and refine the song before sharing it.",
        },
        {
          question: "What should I include in an achievement song?",
          answer:
            "Name the goal, the toughest obstacle, the turning point, the people who helped, and the quality that made the accomplishment possible.",
        },
        {
          question: "How can I use the song at a celebration?",
          answer:
            "Play it during a party entrance, graduation slideshow, office call, award dinner, team video, or private message from the people who are proudest.",
        },
      ],
    },
  }),

  wedding: createConfig({
    slug: "wedding",
    occasion: "wedding",
    shortName: "Wedding",
    primaryKeyword: "custom wedding song",
    keywords: [
      "custom wedding song",
      "personalized wedding song",
      "wedding song for couple",
      "first dance song",
      "wedding gift song",
      "song from wedding vows",
      "AI wedding song generator",
    ],
    metadata: {
      title: "Custom Wedding Song for First Dances",
      description:
        "Create a custom wedding song from your love story, vows, and names. Preview personalized first dance music or a one-of-a-kind wedding gift.",
    },
    palette: {
      accent: "#2f6b57",
      accentDark: "#204c3d",
      soft: "#eff8f3",
      muted: "#f5f0e8",
      ink: "#173027",
    },
    hero: {
      badge: "Personalized music for the wedding day",
      title: "Custom Wedding Song",
      description:
        "Turn the first meeting, proposal, vows, and future promises into a custom wedding song. Create a personalized first dance, ceremony soundtrack, or wedding gift that belongs to one couple and one story.",
      image: "/images/occasions/wedding-song-hero.webp",
      imageAlt:
        "Newlyweds sharing headphones while listening to their custom wedding song at sunset",
      cardTitle: "A first dance no other couple has",
      cardDescription:
        "Build the lyrics from your timeline, private language, vows, and the future you are promising together.",
      cta: "Create a Wedding Song",
    },
    storyDetails:
      "Add both names, where you met, the proposal, a favorite shared memory, lines from the vows, and the promise you want the chorus to hold.",
    styleOptions:
      "romantic ballad, acoustic, classical crossover, R&B, country, jazz, or cinematic pop",
    deliveryIdeas:
      "Use it for the first dance, ceremony entrance, reception video, parent gift, vow renewal, or a surprise from the wedding party.",
    moments: {
      title: "Personalized wedding songs for every part of the day",
      description:
        "Create original music for the ceremony, first dance, couple gift, parent tribute, wedding party surprise, or a video that tells the relationship story.",
      items: [
        {
          title: "First dance",
          description:
            "Set the tempo, mood, and relationship story for a dance that no other couple can repeat.",
          icon: "rings",
        },
        {
          title: "Ceremony entrance",
          description:
            "Create a lyrical or instrumental-feeling song that carries the emotion of walking toward each other.",
          icon: "flower",
        },
        {
          title: "Gift for the couple",
          description:
            "Turn memories from friends and family into a wedding song the newlyweds can keep.",
          icon: "gift",
        },
        {
          title: "Song from vows",
          description:
            "Shape promises and meaningful vow lines into a chorus designed to outlive the ceremony.",
          icon: "message",
        },
        {
          title: "Parent tribute",
          description:
            "Thank parents or caregivers with a song built from childhood, guidance, and the transition into a new family.",
          icon: "heart",
        },
        {
          title: "Reception or video",
          description:
            "Use an upbeat custom track for the entrance, slideshow, same-day edit, or final dance.",
          icon: "celebration",
        },
      ],
    },
    topics: {
      title: "Custom wedding song ideas for dances, vows, and gifts",
      description:
        "Wedding searches split by moment. The page answers each one while keeping the couple's story at the center.",
      items: [
        {
          title: "Personalized first dance song",
          description:
            "Choose a danceable style and tell the relationship story through verses that lead to a memorable chorus.",
          keywords: [
            "personalized first dance song",
            "custom first dance song",
          ],
          prompt:
            "Include where you met, the proposal, an everyday ritual, and a chorus line that feels natural to dance to together.",
          icon: "rings",
        },
        {
          title: "Song from wedding vows",
          description:
            "Use the strongest promise, image, or repeated phrase from the vows as the emotional anchor.",
          keywords: ["song from wedding vows", "wedding vow song"],
          prompt:
            "Share the vow lines you want echoed, the story behind them, and whether the song should feel intimate, cinematic, or timeless.",
          icon: "message",
        },
        {
          title: "Personalized wedding gift song",
          description:
            "Friends, siblings, and parents can create a story-rich gift for the couple.",
          keywords: [
            "personalized wedding gift song",
            "wedding song for couple",
          ],
          prompt:
            "Add how the couple met, what makes them work, a favorite group memory, and what everyone wishes for their marriage.",
          icon: "gift",
        },
        {
          title: "Country wedding song",
          description:
            "Use plainspoken storytelling, acoustic warmth, and place-based memories for a grounded first dance or gift.",
          keywords: ["custom country wedding song", "country first dance song"],
          prompt:
            "Mention the hometown, backroad drive, porch or family setting, and the steady kind of love at the center of the marriage.",
          icon: "music",
        },
      ],
    },
    examples: {
      title: "Start the wedding song with your timeline and vows",
      description:
        "A few precise scenes give the lyrics an emotional arc from first meeting to the future.",
      items: [
        {
          label: "First dance",
          title: "Rainy bookstore beginning",
          text: "Write a warm acoustic first dance song for Nora and Eli. Mention our rainy bookstore meeting, the tiny first apartment, Sunday coffee, and the vow 'I will keep choosing the life we build'.",
        },
        {
          label: "Gift for couple",
          title: "From the wedding party",
          text: "Create an upbeat soul wedding song for Maya and Chris from their friends. Include the lake-house weekend, their rescue dog, how they host everyone, and the phrase 'the room gets warmer when you arrive'.",
        },
        {
          label: "Country style",
          title: "Backroad first dance",
          text: "Make a country wedding song for Jess and Cole. Mention the high-school parking lot, his old truck, her grandfather's porch, and a love that grew slowly and stayed steady.",
        },
      ],
    },
    testimonials: {
      title: "Wedding songs made for one dance and a lifetime",
      description:
        "When the lyrics contain the couple's real timeline, the room hears the difference.",
      items: [
        {
          quote:
            "Our first dance song mentioned the bookstore and the yellow kitchen light. Guests assumed a songwriter had known us for years.",
          author: "Nora E.",
          badge: "First dance",
        },
        {
          quote:
            "The wedding party surprised us with a song built from everyone's memories. It became the soundtrack to our video.",
          author: "Maya C.",
          badge: "Couple gift",
        },
        {
          quote:
            "We turned two lines from our vows into the chorus. Hearing them again at the reception was unforgettable.",
          author: "Dylan K.",
          badge: "Vow song",
        },
      ],
    },
    faq: {
      title: "Custom wedding song questions",
      description:
        "Plan personalized music for a first dance, ceremony, couple gift, or wedding video.",
      ctaTitle: "Ready to give the wedding its own song?",
      ctaDescription:
        "Share the timeline, vows, and mood, then preview a song created for this couple alone.",
      items: [
        {
          question: "Can I create a custom first dance song?",
          answer:
            "Yes. Choose the style and tempo, then add your names, story, key memories, and the feeling you want for the dance.",
        },
        {
          question: "Can the lyrics use our wedding vows?",
          answer:
            "Yes. Share the vow lines you want included and explain their meaning. The song can echo them in the chorus while using the verses for your relationship story.",
        },
        {
          question: "Can family or friends make a wedding song for the couple?",
          answer:
            "Absolutely. Gather memories from the people closest to them and describe the couple's personality, origin story, and the wish you want the song to carry.",
        },
        {
          question: "What styles work for a personalized wedding song?",
          answer:
            "Popular choices include acoustic ballad, R&B, country, cinematic pop, jazz, classical crossover, and upbeat soul. Pick the style that fits the event and the couple.",
        },
        {
          question: "Is this an AI wedding song generator?",
          answer:
            "Yes. It creates original lyrics, music, and vocals from your details. Preview the result and refine it before the wedding day.",
        },
        {
          question: "How can we use the final wedding song?",
          answer:
            "Use it for the first dance, ceremony entrance, reception reveal, wedding video, private gift, vow renewal, or printable lyric keepsake.",
        },
      ],
    },
  }),

  "in-memoriam": createConfig({
    slug: "in-memoriam",
    occasion: "in-memoriam",
    shortName: "Memorial",
    primaryKeyword: "custom memorial song",
    keywords: [
      "custom memorial song",
      "personalized tribute song",
      "memorial song for loved one",
      "funeral tribute song",
      "celebration of life song",
      "in loving memory song",
      "remembrance song",
    ],
    metadata: {
      title: "Custom Memorial Song for a Loved One",
      description:
        "Create a custom memorial song from the memories, sayings, and love that remain. Preview a personalized tribute for a funeral or celebration of life.",
    },
    palette: {
      accent: "#54758a",
      accentDark: "#385568",
      soft: "#eef4f7",
      muted: "#f1f0ec",
      ink: "#21313a",
    },
    hero: {
      badge: "A gentle tribute built from real memories",
      title: "Custom Memorial Song",
      description:
        "Honor a loved one with a custom memorial song built from their voice in your memory: the stories, sayings, values, and moments that still feel close. Create a personalized tribute for a funeral, celebration of life, or private remembrance.",
      image: "/images/occasions/in-memoriam-song-hero.webp",
      imageAlt:
        "Woman listening peacefully to a custom memorial song while holding a framed family photograph",
      cardTitle: "Remember the person, not only the loss",
      cardDescription:
        "Share the laugh, the ritual, the favorite place, and the values people still carry because of them.",
      cta: "Create a Memorial Song",
    },
    storyDetails:
      "Add their name, relationship, favorite sayings, meaningful places, qualities, family memories, and the legacy or message you want the song to preserve.",
    styleOptions:
      "gentle acoustic, piano ballad, classical, folk, gospel-inspired, jazz, or a quiet lullaby",
    deliveryIdeas:
      "Play it at a funeral or celebration of life, add it to a photo tribute, share it privately with family, or keep it for anniversaries of remembrance.",
    moments: {
      title:
        "Personalized tribute songs for remembrance and celebration of life",
      description:
        "A memorial song can hold grief and gratitude together, whether it is shared publicly at a service or kept as a private family keepsake.",
      items: [
        {
          title: "Funeral tribute",
          description:
            "Create a respectful song that can accompany photos, reflection, or a meaningful moment in the service.",
          icon: "flower",
        },
        {
          title: "Celebration of life",
          description:
            "Center personality, stories, humor, and the ways the person's life continues through others.",
          icon: "sun",
        },
        {
          title: "In loving memory video",
          description:
            "Give a slideshow or family film an original soundtrack built around the person being remembered.",
          icon: "music",
        },
        {
          title: "Private family remembrance",
          description:
            "Create something siblings, children, or a partner can listen to when they want to feel close.",
          icon: "heart",
        },
        {
          title: "Anniversary of loss",
          description:
            "Mark a birthday, holiday, or yearly remembrance with a song that makes room for love and memory.",
          icon: "star",
        },
        {
          title: "Legacy for children",
          description:
            "Preserve stories, values, sayings, and family history for younger generations who will keep listening.",
          icon: "message",
        },
      ],
    },
    topics: {
      title: "Memorial song ideas for honoring a loved one's life",
      description:
        "Search intent ranges from funeral music to personal remembrance. The strongest page language stays compassionate, specific, and centered on the life being honored.",
      items: [
        {
          title: "Personalized tribute song",
          description:
            "A broad memorial keepsake built from the person's character, relationships, and lasting influence.",
          keywords: ["personalized tribute song", "tribute song for loved one"],
          prompt:
            "Describe their laugh, a favorite saying, the place everyone associates with them, and the value they passed on.",
          icon: "heart",
        },
        {
          title: "Funeral memorial song",
          description:
            "Create a calm, service-appropriate tribute that can sit alongside spoken memories and photographs.",
          keywords: ["funeral memorial song", "custom funeral song"],
          prompt:
            "Include the person's name, key relationships, a gentle memory, and the message the family wants guests to carry home.",
          icon: "flower",
        },
        {
          title: "Celebration of life song",
          description:
            "Use warmth, personality, and meaningful stories when the gathering is focused on a life fully lived.",
          keywords: [
            "celebration of life song",
            "personalized celebration of life music",
          ],
          prompt:
            "Add their signature joke, favorite gathering, music or hobby, and the way they made people feel welcome.",
          icon: "sun",
        },
        {
          title: "In loving memory song",
          description:
            "A private or shareable remembrance for birthdays, anniversaries, and moments when absence feels close.",
          keywords: ["in loving memory song", "remembrance song"],
          prompt:
            "Mention the moment you return to most, what you still hear them saying, and how their love continues in daily life.",
          icon: "star",
        },
      ],
    },
    examples: {
      title: "Share the memories that keep their presence specific",
      description:
        "You do not need polished words. Names, scenes, sayings, and values give the tribute its emotional truth.",
      items: [
        {
          label: "For a father",
          title: "The porch light",
          text: "Write a gentle acoustic memorial song for my dad, Robert. Mention the porch light he always left on, Sunday baseball, his quiet advice, and how every grandchild knew his whistle.",
        },
        {
          label: "For a grandmother",
          title: "The family table",
          text: "Create a warm piano tribute for Grandma Elena. Include her red recipe book, crowded holiday table, morning prayers, and the phrase 'there is always enough love'.",
        },
        {
          label: "Celebration of life",
          title: "A room full of laughter",
          text: "Make a hopeful folk song for Daniel's celebration of life. Mention his terrible impressions, mountain hikes, open-door dinners, and how he made newcomers feel like old friends.",
        },
      ],
    },
    testimonials: {
      title: "Memorial songs that hold a life in real detail",
      description:
        "Specific memories help a tribute feel loving and recognizable rather than generic.",
      items: [
        {
          quote:
            "The porch-light line captured Dad better than a long speech could. We played it under the family photos at his service.",
          author: "Claire R.",
          badge: "For Dad",
        },
        {
          quote:
            "It made room for Grandma's humor as well as our grief. Everyone smiled when the red recipe book appeared in the verse.",
          author: "Elena M.",
          badge: "Family tribute",
        },
        {
          quote:
            "We keep the song in our family chat. It has become something we share on his birthday when words are difficult.",
          author: "Jon P.",
          badge: "Private remembrance",
        },
      ],
    },
    faq: {
      title: "Custom memorial song questions",
      description:
        "Create a respectful tribute from the memories, values, and stories that best represent your loved one.",
      ctaTitle: "Ready to preserve their story in a song?",
      ctaDescription:
        "Share the name, memories, and legacy you want the music to carry. Begin gently with a preview.",
      items: [
        {
          question:
            "What is a good remembrance song for someone who passed away?",
          answer:
            "A good remembrance song reflects the person, the relationship, and the setting. A custom memorial song can include their name, sayings, stories, and the legacy family members still carry.",
        },
        {
          question: "Can I create a song for a funeral or celebration of life?",
          answer:
            "Yes. Explain how the song will be used and whether the tone should be quiet, spiritual, hopeful, warm, or focused on celebrating personality and life.",
        },
        {
          question: "What should I include in a personalized tribute song?",
          answer:
            "Include a few clear memories, a favorite saying, meaningful places, important relationships, qualities people loved, and the message you want listeners to remember.",
        },
        {
          question: "Can the memorial song include happy or funny memories?",
          answer:
            "Yes. Humor, family rituals, and joyful details can make a tribute feel more faithful to the person, especially for a celebration of life.",
        },
        {
          question: "Can I preview the memorial song before sharing it?",
          answer:
            "Yes. Listen to the preview privately, then refine wording, tone, or musical style before deciding whether it is right for the family or service.",
        },
        {
          question: "How can a family use the final tribute song?",
          answer:
            "Play it during a service, photo slideshow, private gathering, birthday remembrance, or anniversary of loss. You can also create a video or lyric keepsake.",
        },
      ],
    },
  }),

  "thank-you": createConfig({
    slug: "thank-you",
    occasion: "thank-you",
    shortName: "Thank You",
    primaryKeyword: "personalized thank you song",
    keywords: [
      "personalized thank you song",
      "custom thank you song",
      "gratitude song",
      "appreciation song",
      "thank you gift song",
      "song for teacher",
      "song for mentor",
    ],
    metadata: {
      title: "Personalized Thank You Song",
      description:
        "Create a personalized thank you song for a teacher, parent, mentor, friend, caregiver, or team. Add real memories and preview it free.",
    },
    palette: {
      accent: "#17827c",
      accentDark: "#0e5f5b",
      soft: "#edf9f7",
      muted: "#f5f0e7",
      ink: "#153230",
    },
    hero: {
      badge: "Say thank you with the story behind it",
      title: "Personalized Thank You Song",
      description:
        "Turn the help, patience, lesson, or kindness you never forgot into a personalized thank you song. Add their name and the moment they made a difference, then preview a custom gratitude song that says more than a card can hold.",
      image: "/images/occasions/thank-you-song-hero.webp",
      imageAlt:
        "Student giving headphones to a mentor to share a personalized thank you song",
      cardTitle: "Name the difference they made",
      cardDescription:
        "Include what they did, when it mattered, what changed because of them, and the quality you hope they know you noticed.",
      cta: "Create a Thank You Song",
    },
    storyDetails:
      "Add their name, your relationship, the specific help or kindness, the moment it mattered most, and what changed because they showed up.",
    styleOptions:
      "warm acoustic, folk pop, soul, country, upbeat pop, or a sincere ballad",
    deliveryIdeas:
      "Send it privately, play it at a farewell or appreciation event, add it to a class or team video, or pair it with a handwritten note.",
    moments: {
      title: "Custom thank you songs for the people who showed up",
      description:
        "Create an appreciation song for teachers, mentors, parents, caregivers, friends, colleagues, volunteers, and teams.",
      items: [
        {
          title: "For a teacher",
          description:
            "Thank them for patience, encouragement, classroom rituals, and the moment learning finally clicked.",
          icon: "award",
        },
        {
          title: "For a mentor",
          description:
            "Name the advice, opportunity, honest feedback, and confidence that changed your direction.",
          icon: "star",
        },
        {
          title: "For a parent or caregiver",
          description:
            "Recognize practical help, steady care, and the sacrifices that are easy to overlook.",
          icon: "heart",
        },
        {
          title: "For a friend",
          description:
            "Celebrate the call they answered, the difficult season they stayed through, and the humor that kept you moving.",
          icon: "sun",
        },
        {
          title: "For a team or colleague",
          description:
            "Turn a launch, farewell, retirement, or shared challenge into a group appreciation gift.",
          icon: "celebration",
        },
        {
          title: "For volunteers or supporters",
          description:
            "Thank donors, coaches, neighbors, or community members with a song built from visible impact.",
          icon: "gift",
        },
      ],
    },
    topics: {
      title: "Thank you song ideas for teachers, mentors, and everyday heroes",
      description:
        "Gratitude searches become more actionable when the page addresses the relationship and the specific reason for thanks.",
      items: [
        {
          title: "Thank you song for teacher",
          description:
            "Create a class, student, or parent gift around classroom memories and lasting encouragement.",
          keywords: ["thank you song for teacher", "teacher appreciation song"],
          prompt:
            "Mention the subject or class, a phrase the teacher used, a breakthrough moment, and how they made students feel capable.",
          icon: "award",
        },
        {
          title: "Thank you song for mentor",
          description:
            "Turn guidance, opportunity, and honest support into a professional but personal tribute.",
          keywords: ["thank you song for mentor", "mentor appreciation gift"],
          prompt:
            "Include the advice that changed your direction, the opportunity they opened, and the confidence you gained.",
          icon: "star",
        },
        {
          title: "Gratitude song for parents",
          description:
            "Name the daily support and sacrifices that broad thank-you language often misses.",
          keywords: [
            "gratitude song for parents",
            "thank you song for mom and dad",
          ],
          prompt:
            "Add a family routine, a difficult period they carried you through, and the value you now understand because of them.",
          icon: "heart",
        },
        {
          title: "Employee or team appreciation song",
          description:
            "Celebrate shared work, culture, and a specific result without relying on corporate slogans.",
          keywords: ["employee appreciation song", "team thank you song"],
          prompt:
            "Mention the project, the impossible deadline, the team's signature habit, and what each person made possible together.",
          icon: "celebration",
        },
      ],
    },
    examples: {
      title: "Explain what their help changed",
      description:
        "The strongest thank-you song connects an act of kindness to its lasting effect.",
      items: [
        {
          label: "Teacher",
          title: "The classroom that felt safe",
          text: "Write a warm folk-pop thank you song for Ms. Carter from her graduating class. Mention the reading corner, her phrase 'try the brave answer', and how she made every student feel worth hearing.",
        },
        {
          label: "Mentor",
          title: "A career-changing yes",
          text: "Create a soulful appreciation song for Daniel from Priya. Include the first internship, his honest feedback, the conference introduction, and how he taught me to take up space in the room.",
        },
        {
          label: "Friend",
          title: "The call they always answered",
          text: "Make an acoustic thank you song for my friend Leah. Mention midnight phone calls, the moving-day rain, bad takeout, and how she stayed close during the year I felt most lost.",
        },
      ],
    },
    testimonials: {
      title: "Thank you songs that make appreciation concrete",
      description:
        "People feel seen when the song names the action, moment, and impact behind the gratitude.",
      items: [
        {
          quote:
            "Our teacher recognized every classroom detail. The whole class sang the last chorus with her.",
          author: "Mia F.",
          badge: "Teacher appreciation",
        },
        {
          quote:
            "I had thanked my mentor before, but the song finally explained what his support changed in my career.",
          author: "Priya A.",
          badge: "Mentor gift",
        },
        {
          quote:
            "The moving-day rain line made my best friend laugh immediately. It felt like a thank-you only I could give.",
          author: "Jonah B.",
          badge: "For a friend",
        },
      ],
    },
    faq: {
      title: "Personalized thank you song questions",
      description:
        "Turn gratitude into a clear story with the right relationship, details, and tone.",
      ctaTitle: "Ready to say the thank you they deserve?",
      ctaDescription:
        "Share what they did and why it mattered. Start with a personalized song preview.",
      items: [
        {
          question: "What is a good song for saying thank you?",
          answer:
            "A good thank-you song names the person, the specific help, and the impact it had. A personalized song can turn those details into lyrics that feel more direct than a generic gratitude playlist.",
        },
        {
          question: "Can I create a thank you song for a teacher?",
          answer:
            "Yes. Add the teacher's name, class memories, phrases, lessons, and the way they helped students grow. A class can also combine several memories in one song.",
        },
        {
          question:
            "Can I make an appreciation song for a mentor or colleague?",
          answer:
            "Yes. Use professional milestones, advice, opportunities, shared projects, and the quality you most respect. Choose a polished or playful tone to fit the relationship.",
        },
        {
          question: "Is this a personalized thank you song generator?",
          answer:
            "Yes. It creates original lyrics, music, and vocals from your gratitude story, with a preview and options to refine the result.",
        },
        {
          question: "What details should I include in a gratitude song?",
          answer:
            "Explain what the person did, when it mattered, what changed afterward, a memory that represents the relationship, and the exact feeling you want the chorus to express.",
        },
        {
          question: "How can I deliver the thank you song?",
          answer:
            "Send a private link, play it at a teacher or employee appreciation event, include it in a farewell video, or pair it with a note and printable lyric keepsake.",
        },
      ],
    },
  }),

  "get-well-soon": createConfig({
    slug: "get-well-soon",
    occasion: "get-well-soon",
    shortName: "Get Well Soon",
    primaryKeyword: "personalized get well soon song",
    keywords: [
      "personalized get well soon song",
      "get well soon song",
      "recovery song",
      "song to cheer someone up",
      "encouragement song",
      "custom healing song",
      "get well gift",
    ],
    metadata: {
      title: "Personalized Get Well Soon Song",
      description:
        "Create a personalized get well soon song with their name, humor, and messages of support. Preview a custom recovery gift in minutes.",
    },
    palette: {
      accent: "#2a8c72",
      accentDark: "#196650",
      soft: "#eefaf5",
      muted: "#f2f4ec",
      ink: "#16342b",
    },
    hero: {
      badge: "A brighter way to send support",
      title: "Personalized Get Well Soon Song",
      description:
        "Send strength, laughter, and familiar voices through a personalized get well soon song. Add their name, favorite things, inside jokes, and messages from friends, then preview a custom encouragement song made to lift the day.",
      image: "/images/occasions/get-well-soon-song-hero.webp",
      imageAlt:
        "Recovering woman smiling during a video call while listening to a personalized get well soon song",
      cardTitle: "Support that sounds like their people",
      cardDescription:
        "Include the joke, pet, favorite show, future plan, and words of encouragement that feel natural for this person.",
      cta: "Create a Get Well Soon Song",
    },
    storyDetails:
      "Add their name, what they enjoy, an inside joke, the people sending love, a future plan to look forward to, and the kind of support that fits their personality.",
    styleOptions:
      "upbeat pop, acoustic, gentle soul, playful funk, country, or a calm hopeful ballad",
    deliveryIdeas:
      "Send it by text, play it on a video call, include messages from a group, or add it to a photo montage for a longer recovery period.",
    moments: {
      title:
        "Get well soon songs for support, smiles, and steady encouragement",
      description:
        "Match the song to the person and situation, from a playful pick-me-up to a gentle message during a longer recovery.",
      items: [
        {
          title: "After surgery",
          description:
            "Send a light, encouraging song with familiar humor and something enjoyable to anticipate.",
          icon: "sun",
        },
        {
          title: "During a long recovery",
          description:
            "Create a steady message from family or friends that can be replayed on difficult days.",
          icon: "heart",
        },
        {
          title: "For a child or teen",
          description:
            "Use favorite games, pets, superheroes, music, and a playful chorus that feels age-appropriate.",
          icon: "star",
        },
        {
          title: "From a group",
          description:
            "Collect one line from coworkers, classmates, teammates, or family and bring the support together.",
          icon: "celebration",
        },
        {
          title: "For a long-distance friend",
          description:
            "Turn voice-note energy, shared jokes, and the next visit into a more personal remote gift.",
          icon: "message",
        },
        {
          title: "For a caregiver to share",
          description:
            "Create a gentle song that offers companionship without making promises or giving medical advice.",
          icon: "music",
        },
      ],
    },
    topics: {
      title: "Get well song ideas for recovery and encouragement",
      description:
        "The search results mix playlists, ecards, and video messages. A personalized song stands out by using the recipient's name, personality, and support network.",
      items: [
        {
          title: "Song to cheer someone up",
          description:
            "Use humor, favorite things, and a future plan for a person who needs a lift more than a formal message.",
          keywords: ["song to cheer someone up", "cheer up song gift"],
          prompt:
            "Mention their comfort show, pet, favorite snack, a ridiculous shared memory, and the plan everyone wants to do together next.",
          icon: "sun",
        },
        {
          title: "Recovery encouragement song",
          description:
            "A calmer song can recognize that recovery takes time while offering steady support.",
          keywords: ["recovery song", "encouragement song"],
          prompt:
            "Include their strength, one small daily win, the people beside them, and a hopeful future image without making medical claims.",
          icon: "heart",
        },
        {
          title: "Get well soon song from friends",
          description:
            "Combine messages and memories from a group into one warm, replayable surprise.",
          keywords: [
            "get well soon song from friends",
            "group recovery message",
          ],
          prompt:
            "Collect one joke or memory from each person, name the group, and end with the activity everyone is saving for their return.",
          icon: "celebration",
        },
        {
          title: "Get well song for a child",
          description:
            "Keep the language playful, concrete, and focused on favorite characters, hobbies, and home comforts.",
          keywords: ["get well song for child", "kids get well soon song"],
          prompt:
            "Add the child's name, pet, favorite game, brave moment, and a silly chorus phrase the family can sing along with.",
          icon: "star",
        },
      ],
    },
    examples: {
      title: "Write support in the language they actually enjoy",
      description:
        "A get well song can be funny, gentle, energetic, or calm. The right brief starts with personality, not diagnosis.",
      items: [
        {
          label: "From friends",
          title: "Back to trivia night",
          text: "Write an upbeat pop get well soon song for Lily from the Thursday trivia team. Mention her impossible geography answers, spicy chips, her cat Pixel, and that we are saving her seat.",
        },
        {
          label: "Gentle support",
          title: "One day at a time",
          text: "Create a soft acoustic encouragement song for Daniel from his family. Mention morning tea, balcony sunlight, small daily wins, and how nobody expects him to rush.",
        },
        {
          label: "For a child",
          title: "Captain Leo's comeback",
          text: "Make a playful funk song for eight-year-old Leo. Include his dinosaur blanket, dog Rocket, drawing superheroes, and the chorus phrase 'Captain Leo powers up'.",
        },
      ],
    },
    testimonials: {
      title: "Get well songs that bring familiar energy into the room",
      description:
        "Names, jokes, and future plans can make support feel close even when people cannot visit.",
      items: [
        {
          quote:
            "The trivia-team references made Lily laugh on a day when every normal message felt repetitive.",
          author: "Megan V.",
          badge: "From friends",
        },
        {
          quote:
            "We wanted encouragement without pressure. The line about nobody expecting him to rush was exactly right.",
          author: "Aisha K.",
          badge: "Family support",
        },
        {
          quote:
            "My nephew sang the Captain Leo chorus all afternoon. It felt playful instead of clinical.",
          author: "Rosa D.",
          badge: "For a child",
        },
      ],
    },
    faq: {
      title: "Personalized get well soon song questions",
      description:
        "Create supportive music that fits the recipient's personality without making medical promises.",
      ctaTitle: "Ready to send a brighter kind of support?",
      ctaDescription:
        "Add their name, favorite things, and the words they would actually want to hear.",
      items: [
        {
          question: "What is a good song to wish someone get well soon?",
          answer:
            "A good get well song fits the person's personality and situation. It can be upbeat and funny or calm and reassuring. A personalized song adds their name, familiar details, and messages from the people who care.",
        },
        {
          question:
            "Can I make a recovery song without mentioning the illness?",
          answer:
            "Yes. Focus on favorite things, shared memories, small daily comforts, future plans, and steady support. You decide how direct or private the lyrics should be.",
        },
        {
          question: "Can friends or coworkers create one song together?",
          answer:
            "Yes. Collect a short memory, joke, or message from each person and explain the group relationship. The song can unite those voices in one chorus.",
        },
        {
          question: "Can the get well soon song be funny?",
          answer:
            "Absolutely, when humor fits the recipient. Use inside jokes, pets, hobbies, favorite snacks, or a playful phrase, while avoiding anything that minimizes what they are experiencing.",
        },
        {
          question: "Is this an AI get well soon song generator?",
          answer:
            "Yes. It creates original lyrics, music, and vocals from your supportive message. Preview and refine the result before sending it.",
        },
        {
          question: "Does a personalized recovery song give medical advice?",
          answer:
            "No. The song is an emotional gift, not medical guidance. Keep the lyrics focused on care, companionship, encouragement, and the recipient's own story.",
        },
      ],
    },
  }),
};

export function getOccasionLandingConfig(
  slug: string,
): OccasionLandingConfig | undefined {
  return configs[slug as OccasionLandingSlug];
}

export function getAllOccasionLandingConfigs(): OccasionLandingConfig[] {
  return OCCASION_LANDING_SLUGS.map((slug) => configs[slug]);
}

export function getOccasionCreateHref(config: OccasionLandingConfig): string {
  return `/create-song?occasion=${config.occasion}`;
}
