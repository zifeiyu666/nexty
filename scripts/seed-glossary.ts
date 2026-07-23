import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

const LANGUAGE = "en";
const POST_TYPE = "glossary";

type GlossaryEntry = {
  title: string;
  slug: string;
  description: string;
  tag: string;
  definition: string;
  overview: string;
  distinction: string;
  importance: string;
  example: string;
  tips: [string, string, string];
  related: [string, string, string];
  guide: { label: string; href: string };
  nextStep: { label: string; href: string };
};

const glossaryEntries: GlossaryEntry[] = [
  {
    title: "Custom Song",
    slug: "custom-song",
    description:
      "A custom song is written around a specific person, story, or occasion. Learn how its lyrics, style, and emotional direction are personalized.",
    tag: "Custom Song Basics",
    definition:
      "A custom song is an original piece of music created for a particular person, relationship, story, or occasion. Its lyrics and creative direction are shaped by details supplied by the person commissioning it, so the finished track can mention real names, memories, places, promises, or private jokes rather than relying on a general theme.",
    overview:
      "Custom songs can be made by a songwriter, produced with AI-assisted tools, or developed through a combination of human direction and generative technology. The process normally starts with a story brief: who the song is for, why it is being made, which memories matter, and how the listener should feel. Those details guide the lyrics before genre, mood, vocal character, and arrangement are chosen. The result is meant to sound emotionally specific even when the musical style is familiar.",
    distinction:
      "The defining feature is not simply that the track is new. An original song can still be written for a broad audience, while a custom song is intentionally built around one recipient or purpose. It also differs from a parody that replaces a few words in an existing hit. A genuine custom song uses original lyrics and music rather than borrowing a protected melody, and it should make sense as a complete song instead of a name inserted into a generic template.",
    importance:
      "For a music gift, specificity creates most of the emotional value. A lyric about a rainy first date, a family saying, or the street where two people met gives the listener evidence that the song belongs to their life. Clear details also help the creator make better decisions about tone. A wedding song may need warmth and commitment, while a birthday song might favor humor and celebration. The custom brief keeps those choices connected to the real occasion.",
    example:
      "Imagine an anniversary song for Maya and Daniel. A generic love song could say that their relationship has lasted through the years. A custom version could recall the missed train that led to their first conversation, Sunday coffee in a chipped blue mug, and the promise they made before moving across the country. Those details give the chorus an emotional center and make the final track useful as a private gift, a celebration video, or a keepsake.",
    tips: [
      "Start with three concrete memories instead of a long biography; specific images are easier to turn into natural lyrics.",
      "Choose one primary message, such as gratitude, celebration, reassurance, or commitment, so the song has a clear emotional arc.",
      "Describe the desired sound in ordinary language and use genre references only when they genuinely fit the recipient.",
    ],
    related: ["personalized-song", "ai-generated-song", "custom-song-gift"],
    guide: {
      label: "how to make a custom song for someone",
      href: "/blog/how-to-make-a-custom-song-for-someone",
    },
    nextStep: {
      label: "create a free custom song preview",
      href: "/create-song",
    },
  },
  {
    title: "Personalized Song",
    slug: "personalized-song",
    description:
      "A personalized song adapts original lyrics and musical choices to one recipient. See what makes personalization meaningful instead of generic.",
    tag: "Custom Song Basics",
    definition:
      "A personalized song is a song whose lyrics, message, and often musical direction are tailored to an individual or a specific relationship. It turns personal information into a coherent listening experience, using details such as a recipient's name, shared memories, personality, milestone, or words the giver wants to say but may find difficult to express directly.",
    overview:
      "Personalization can happen at several levels. Basic personalization may include a name and occasion, while deeper personalization builds the verses and chorus around real events and a recognizable emotional message. The musical choices can also be personal: country for someone who loves story-driven songs, gentle piano for a memorial, or upbeat pop for an energetic birthday. Strong personalization connects all of these decisions instead of treating each detail as an isolated field in a form.",
    distinction:
      "The terms personalized song and custom song are often used interchangeably, but personalized emphasizes the listener-facing result. A song feels personalized when the recipient recognizes their own life in it. Custom describes how the song was commissioned or created. A track can technically be customized with a name yet still feel impersonal if the surrounding lyrics are vague. Meaningful personalization depends on accurate, selective storytelling rather than the number of details included.",
    importance:
      "Recipients quickly notice whether a gift could have been made for anyone. Personalized lyrics reduce that distance by naming experiences that only the people involved would understand. They also give the creator a practical editing standard: every verse should support the central relationship or occasion. If a line sounds attractive but does not sound true to the recipient, it can be replaced with a detail that carries more emotional evidence.",
    example:
      "For a graduation gift, a parent might provide the student's habit of studying at the kitchen counter, the setback they overcame in their second year, and the phrase they always use before a difficult day. A personalized song can turn those moments into a verse about persistence and a chorus about stepping into the next chapter. The message becomes encouragement grounded in the student's actual journey rather than a generic statement about success.",
    tips: [
      "Prioritize details the recipient will recognize immediately, such as a place, ritual, phrase, or turning point.",
      "Protect privacy by leaving out information that would feel uncomfortable if the song were played for family or friends.",
      "Read the lyrics aloud before generating music to confirm that the voice sounds like the giver and not a greeting card.",
    ],
    related: ["custom-song", "custom-song-gift", "personalized-music-gift"],
    guide: {
      label: "custom song lyric examples and prompts",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "turn your story into a song preview",
      href: "/create-song",
    },
  },
  {
    title: "AI-Generated Song",
    slug: "ai-generated-song",
    description:
      "An AI-generated song uses generative models to create lyrics, vocals, or music from a prompt. Learn where human direction still shapes the result.",
    tag: "Custom Song Basics",
    definition:
      "An AI-generated song is music created with a generative system that produces some combination of lyrics, melody, arrangement, instrumentation, or synthetic vocals from written instructions. In a personalized song workflow, AI acts as the production engine while the user supplies the story, emotional goal, preferred style, and feedback that determine whether the result fits the intended recipient.",
    overview:
      "Different systems generate different parts of a song. One tool may focus on lyrics, another on full audio, and another on artwork or video. A complete workflow can therefore involve several stages: organize the story, draft and edit lyrics, choose genre and vocal direction, generate alternate tracks, and select the strongest version. The model can produce material quickly, but the user's choices still establish the creative brief and decide what is accurate, tasteful, and worth keeping.",
    distinction:
      "AI-generated does not mean the song appears without human input. A vague prompt usually produces a vague result, while a focused brief gives the system useful narrative boundaries. It is also different from simply applying an effect to an existing recording. Generative tools create new output from learned patterns; editing tools modify audio that already exists. Users should review provider terms for ownership, permitted uses, and restrictions before commercial distribution.",
    importance:
      "For custom gifts, AI can shorten production time and make experimentation affordable. A user can compare a warm acoustic version with an upbeat pop version before deciding which one matches the recipient. The speed is valuable only when paired with review. Names must be correct, sensitive memories should be handled carefully, and lyrics should not make claims the giver would not actually say. Human judgment supplies the emotional quality control.",
    example:
      "Someone creating a birthday song for a sister might describe childhood dance routines, a shared nickname, and her ability to make difficult days lighter. The system can draft lyrics and produce two musical versions. The giver may prefer the second vocal but notice that one verse exaggerates an event. Editing that line and regenerating the track is part of the creative process; the final song is shaped through selection and correction, not accepted blindly.",
    tips: [
      "Write prompts around a clear recipient, occasion, mood, and message instead of stacking unrelated style adjectives.",
      "Generate alternatives when the emotional direction is right but the vocal or arrangement does not suit the recipient.",
      "Review lyrics for factual accuracy, pronunciation, privacy, and tone before treating any generated version as final.",
    ],
    related: ["custom-song", "personalized-song", "personalized-music-gift"],
    guide: {
      label: "compare personalized song creation options",
      href: "/blog/best-personalized-song-company",
    },
    nextStep: {
      label: "try an AI song preview from your story",
      href: "/create-song",
    },
  },
  {
    title: "Custom Song Gift",
    slug: "custom-song-gift",
    description:
      "A custom song gift turns personal memories into an original track for a birthday, wedding, anniversary, memorial, or meaningful surprise.",
    tag: "Custom Song Basics",
    definition:
      "A custom song gift is an original song made for a recipient and presented as a meaningful keepsake rather than ordinary entertainment. The song is built from personal stories, messages, and musical preferences, then delivered in a form the recipient can hear, save, share, or revisit during an occasion such as a birthday, anniversary, wedding, graduation, memorial, or thank-you moment.",
    overview:
      "The gift normally has two layers: the song itself and the reveal. The audio carries the story, while a share page, lyric video, printed lyric design, QR code, or private listening moment shapes how the recipient first experiences it. Planning both layers matters. A deeply emotional song may work best in a quiet setting, whereas a celebratory birthday track can be played during a party. The delivery should support the intended feeling instead of distracting from it.",
    distinction:
      "A custom song gift differs from sending an existing favorite track. An existing song can express a shared taste or remind someone of a memory, but it was written for a broad audience. A custom song can include details unavailable in commercial music. It also differs from a playlist: a playlist curates several existing songs, while the custom track is usually the one-of-one centerpiece that explains why the gift was made.",
    importance:
      "The format is useful when the giver wants an experience rather than another object. It can say something difficult, preserve family history, or mark a transition in a form that remains replayable. Good custom song gifts are not measured by how many facts they contain. They succeed when the recipient understands the central message, recognizes the story, and feels that the musical tone belongs to the moment.",
    example:
      "For a couple's tenth anniversary, one partner could create a song about their first apartment, the dog they adopted, and the quiet routines that made a shared life. The track might be revealed through a short photo video after dinner, followed by a downloadable version they can keep. The same story could also become framed lyrics, but the song remains the emotional core connecting each gift format.",
    tips: [
      "Match the reveal to the recipient; private listeners and public celebrators often need different presentation styles.",
      "Keep the song's central message simple enough that it remains clear on the first listen.",
      "Test every link, audio file, QR code, and display device before the gift moment so technology does not interrupt it.",
    ],
    related: ["custom-song", "personalized-song", "personalized-music-gift"],
    guide: {
      label: "ways to send a song to someone",
      href: "/blog/how-to-send-a-song-to-someone",
    },
    nextStep: {
      label: "explore personalized music gift ideas",
      href: "/music/personalized-gift",
    },
  },
  {
    title: "Personalized Music Gift",
    slug: "personalized-music-gift",
    description:
      "A personalized music gift combines a recipient's story with custom audio, lyrics, video, artwork, or another keepsake made for their occasion.",
    tag: "Custom Song Basics",
    definition:
      "A personalized music gift is a music-centered present tailored to a specific recipient through their name, memories, favorite style, relationship, or occasion. It may be an original custom song, a lyric video, printable lyric art, a playlist with a personal message, or a physical item that links to meaningful audio through a QR code.",
    overview:
      "The category is broader than custom songs because the personalized element can live in the music, the packaging, or both. A giver might commission an original anniversary track, design a poster around lyrics from that track, and add a scannable link so the recipient can listen from the frame. Another gift might begin with a playlist and a recorded introduction. The strongest versions create a clear connection between the recipient's story and the chosen format.",
    distinction:
      "Personalized does not automatically mean original. Engraving a favorite lyric or assembling songs tied to shared memories can produce a personalized gift using existing music. A custom song goes further by creating new music for the recipient. This distinction helps set expectations around creative input, copyright, delivery time, and price. It also helps the giver decide whether the emotional goal requires a familiar song or a one-of-one story.",
    importance:
      "Music gifts work because they combine memory with repeated experience. The recipient can replay the audio, display the words, or revisit the video after the occasion has passed. Personalization makes that replay meaningful. Instead of choosing a product category first, the giver should decide what they want the recipient to feel and how they are most likely to enjoy music: listening privately, watching family photos, displaying artwork, or sharing a link.",
    example:
      "A family celebrating a parent's retirement might create a song from stories contributed by several relatives. They could pair the track with a photo-based music video for the party and give the parent a printed lyric poster afterward. The audio, video, and print are different objects, but all are personalized by the same memories and message of gratitude. That shared source material keeps the gift coherent rather than feeling like unrelated add-ons.",
    tips: [
      "Choose the emotional message before the product format so the gift is driven by meaning rather than novelty.",
      "Use only media and lyrics you have permission to share, especially when the gift will appear online or at a public event.",
      "Provide an easy listening option alongside decorative formats so the recipient can return to the actual song.",
    ],
    related: ["custom-song-gift", "personalized-song", "ai-generated-song"],
    guide: {
      label: "song lyric wall art gift ideas",
      href: "/blog/song-lyric-wall-art-ideas",
    },
    nextStep: {
      label: "browse personalized music gift options",
      href: "/music/personalized-gift",
    },
  },
  {
    title: "Personalized Song Lyrics",
    slug: "personalized-song-lyrics",
    description:
      "Personalized song lyrics turn real names, memories, and messages into verses and a chorus written for one person or relationship.",
    tag: "Songwriting & Structure",
    definition:
      "Personalized song lyrics are original words written around a specific person's story, relationship, occasion, and emotional message. They use selected details such as names, places, routines, promises, or turning points to make the listener recognize their own experience while still following the structure, rhythm, and repetition needed for a singable song.",
    overview:
      "Good personalized lyrics are selective rather than exhaustive. A life story may contain dozens of important events, but a song usually needs one central idea supported by a few vivid scenes. Verses can develop those scenes, the chorus can state the lasting message, and a bridge can introduce a change in perspective. The writer also considers line length, natural stress, rhyme, and pronunciation so personal facts sound musical instead of being forced into the track.",
    distinction:
      "Personalized lyrics differ from a written dedication or poem because they must work with music. Repetition is useful, phrases need room to breathe, and the most important line often returns in the chorus. They also differ from replacing a name in a stock song. True personalization shapes the narrative and emotional progression, not only one or two nouns. Original wording avoids the copyright and creative limitations of rewriting an existing commercial song.",
    importance:
      "Lyrics carry the evidence that a custom song belongs to its recipient. Production can make a track sound polished, but inaccurate or generic words weaken the gift immediately. Reviewing the lyric draft before final audio generation makes it easier to correct names, remove private information, soften exaggerated claims, and ensure the message sounds like the giver. This stage is often where emotional authenticity is won or lost.",
    example:
      "For a song from a mother to her adult son, the first verse might recall muddy shoes by the back door and late-night homework at the kitchen table. The chorus could shift from childhood scenes to a present-day message: she is proud of the person he became and will always be a place he can return to. The bridge might acknowledge his next chapter, giving the song movement instead of listing memories chronologically.",
    tips: [
      "Write the core message in one plain sentence before trying to rhyme; clarity should lead the lyric choices.",
      "Use concrete sensory details, but remove facts that require a long explanation for the listener to understand.",
      "Read every line aloud at a steady pace to catch awkward syllable counts, unnatural emphasis, and hard-to-pronounce names.",
    ],
    related: ["verse", "chorus", "bridge"],
    guide: {
      label: "personalized lyric examples and writing prompts",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "generate and edit personalized lyrics",
      href: "/free-custom-song-lyric-gifts",
    },
  },
  {
    title: "Verse",
    slug: "verse",
    description:
      "A verse is a song section that develops the story with changing lyrics. Learn how verses organize memories in a personalized song.",
    tag: "Songwriting & Structure",
    definition:
      "A verse is a section of a song that advances the story, introduces details, or develops an idea through lyrics that usually change each time it appears. In a personalized song, verses are the main place to include memories, names, locations, and events before the repeated chorus gathers those details into the song's central emotional message.",
    overview:
      "Most popular song forms use two or more verses. The first verse establishes the people, place, or beginning of the story. A second verse can show change, deepen the relationship, or move toward the present occasion. Verses often share the same melody and similar line lengths even though the words change. That repeated musical shape helps listeners follow new information without feeling that every section is unrelated.",
    distinction:
      "A verse differs from a chorus because its job is development rather than repetition. The chorus normally returns with the same core words, while each verse adds a new piece of evidence. It also differs from a bridge, which usually appears once and creates contrast. If every memory is forced into the chorus, the hook becomes crowded. If the verses repeat the same idea without new detail, the song can feel static.",
    importance:
      "Personal stories become easier to understand when each verse has one job. A birthday song might use verse one for childhood and verse two for the person they are today. An anniversary song might move from the first meeting to the life built together. Organizing details this way prevents a list-like lyric and gives the listener a sense of progression toward the main message.",
    example:
      "Consider a wedding song. Verse one could describe meeting at a crowded bookstore and talking until closing. Verse two could mention the apartment with mismatched furniture and the decision to build a future together. Both sections can use the same melody, but the changing lyrics move time forward. The chorus then repeats the promise that each ordinary place became home because they shared it.",
    tips: [
      "Give each verse one time period or theme instead of jumping between unrelated memories in every line.",
      "Keep corresponding verse lines similar in length so they can fit the same melody naturally.",
      "End a verse with a detail or thought that creates momentum into the chorus rather than closing the story too early.",
    ],
    related: ["chorus", "bridge", "hook"],
    guide: {
      label: "see complete custom lyric examples",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "draft lyrics from your memories",
      href: "/create-song?step=lyrics",
    },
  },
  {
    title: "Chorus",
    slug: "chorus",
    description:
      "A chorus is the repeated song section that carries the main message and memorable melody. See how it anchors a personalized song.",
    tag: "Songwriting & Structure",
    definition:
      "A chorus is the recurring section of a song that expresses its central idea through repeated lyrics and a memorable melody. In a personalized song, the chorus usually states what the giver most wants the recipient to remember, such as gratitude, commitment, pride, celebration, or reassurance, while the verses provide the personal evidence behind that message.",
    overview:
      "The chorus often appears after each verse and remains mostly unchanged, allowing the listener to recognize and anticipate it. It may contain the song title and usually includes the strongest melodic lift or emotional release. Repetition does not mean the section should be vague. A personalized chorus can use a name, a family phrase, or one defining image, provided the wording stays clear enough to carry the entire song more than once.",
    distinction:
      "A chorus differs from a hook even though the two can overlap. The chorus is a complete structural section; the hook is the most memorable phrase or musical idea and may appear inside it. A refrain is a shorter repeated line, sometimes placed at the end of each verse instead of forming a full chorus. Understanding the difference helps creators ask whether the song needs a broad emotional section or simply a recurring phrase.",
    importance:
      "Because recipients may remember the chorus before any verse detail, it should carry the emotional promise without requiring explanation. A crowded chorus full of dates and facts can be hard to sing and hard to retain. Moving supporting details into verses leaves the chorus room to be direct. This is especially useful for gift songs played only once during a reveal, when the main message must register immediately.",
    example:
      "In a graduation song, the verses might describe early doubts, long nights, and a mentor who helped. The chorus could return to a simple message: you kept choosing the next brave step, and the people who love you always saw what you could become. The wording can remain the same after both verses, but its meaning grows because the listener has heard more of the journey each time.",
    tips: [
      "Write one sentence that captures the entire emotional message, then shape the chorus around that sentence.",
      "Limit dense biographical details and favor words the recipient can understand during a first listen.",
      "Check that the title or hook feels natural when repeated; repetition magnifies awkward phrasing as well as strong phrasing.",
    ],
    related: ["verse", "hook", "bridge"],
    guide: {
      label: "learn how custom song lyrics are developed",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "create a chorus from your message",
      href: "/create-song?step=lyrics",
    },
  },
  {
    title: "Bridge",
    slug: "bridge",
    description:
      "A bridge is a contrasting song section that adds a new perspective before the final chorus. Learn when a personal story needs one.",
    tag: "Songwriting & Structure",
    definition:
      "A bridge is a contrasting section that usually appears once, often after the second chorus, to introduce a new thought, emotional turn, melody, or harmonic direction. In a personalized song, it can move the story from memory to promise, reveal what the giver has learned, or address the recipient more directly before the final chorus returns.",
    overview:
      "The bridge gives the listener a break from the verse-and-chorus pattern. It may be shorter than a verse and often changes the phrasing or intensity. A well-placed bridge does not add random information merely to make the song longer. It reframes what the listener already knows. After that contrast, the familiar chorus can return with greater emotional weight because its words are now heard from a changed perspective.",
    distinction:
      "Unlike a verse, the bridge normally does not use the same melody as earlier story sections. Unlike a chorus, it is not designed for repeated recognition. Some songs use a pre-chorus to build energy before every chorus; that recurring transition is different from a one-time bridge. Not every custom song needs one. Short, direct birthday tracks may be stronger without it, while wedding, memorial, and milestone songs often benefit from the emotional turn.",
    importance:
      "Personal stories frequently contain a natural shift: then and now, difficulty and recovery, distance and reunion, childhood and adulthood. The bridge is a useful place to express that shift without forcing it into the chorus. It can also prevent the final section from feeling like a simple repetition. When the bridge names a promise or realization, the last chorus sounds like a conclusion rather than another copy.",
    example:
      "A song for a daughter might use verses to recall school mornings and family road trips, with a chorus about always believing in her. The bridge could address the present: now she is leaving home, and love must become trust rather than protection. When the chorus returns, the phrase about believing in her carries a new meaning. The structure reflects the parent's emotional transition as well as the daughter's.",
    tips: [
      "Use the bridge for a genuine change in perspective, not a fourth list of memories that could belong in a verse.",
      "Keep the new idea connected to the core message so the contrast feels purposeful rather than surprising for its own sake.",
      "Read the bridge followed immediately by the final chorus and confirm that the return feels emotionally earned.",
    ],
    related: ["verse", "chorus", "hook"],
    guide: {
      label: "explore personalized song lyric structures",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "shape your story into song sections",
      href: "/create-song?step=lyrics",
    },
  },
  {
    title: "Hook",
    slug: "hook",
    description:
      "A hook is the lyric or musical idea listeners remember most. Learn how a strong hook makes a personalized song clear and memorable.",
    tag: "Songwriting & Structure",
    definition:
      "A hook is the most memorable lyrical, melodic, rhythmic, or instrumental idea in a song. It is the element listeners can recall after the track ends and often appears in the title or chorus. In a personalized song, the hook can turn the giver's central message, a meaningful phrase, or a distinctive image into a repeatable emotional signature.",
    overview:
      "Hooks are usually short. They may be a line such as 'home is wherever we choose each other,' a repeated name with a melodic pattern, or an instrumental figure that returns between sections. A song can contain more than one hook, but one should feel primary. The strongest personalized hooks are understandable without a long backstory and specific enough that the recipient senses the connection to their life.",
    distinction:
      "The hook is not automatically the entire chorus. A chorus contains several lines and performs a structural role, while the hook may be one phrase inside it. A title can also function as a hook when it is placed at a memorable point. Catchiness alone is not enough for a gift song. A clever phrase that sounds unlike the giver or makes light of a sensitive memory may be memorable for the wrong reason.",
    importance:
      "A clear hook helps a custom song survive the first listen. Recipients are processing lyrics, melody, and the surprise of hearing their story at the same time. A concise repeated idea gives them something to hold onto. It also helps align the rest of the writing: verses can build toward the hook, and the bridge can reveal a new reason the hook matters.",
    example:
      "For a long-distance relationship song, the couple may always say, 'same moon, different windows.' That phrase can become the hook at the end of each chorus. Verses can describe airport goodbyes and late-night calls, while the bridge looks toward living in the same place. The hook stays simple, but each section adds context that makes its repetition more meaningful.",
    tips: [
      "Look for language the giver already uses; a familiar phrase often feels more personal than a newly invented slogan.",
      "Keep the primary hook brief enough to sing comfortably and clear enough to understand without reading the lyrics.",
      "Repeat it consistently, but vary the surrounding lines or arrangement so the song still develops around it.",
    ],
    related: ["chorus", "verse", "bridge"],
    guide: {
      label: "find custom lyric prompts and examples",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "find the hook in your personal message",
      href: "/create-song?step=lyrics",
    },
  },
  {
    title: "Song Genre",
    slug: "song-genre",
    description:
      "Song genre describes a track's musical tradition, such as pop, country, R&B, or acoustic. Learn how genre shapes a custom song.",
    tag: "Style & Production",
    definition:
      "Song genre is a category used to describe shared musical conventions such as rhythm, instrumentation, vocal approach, harmony, arrangement, and cultural tradition. Pop, country, R&B, rock, folk, jazz, and electronic music are broad genres, each containing many styles. In a custom song, genre provides a practical starting point for how the personal story should sound.",
    overview:
      "A genre choice guides production but does not determine every detail. Two country songs can differ greatly in tempo, emotion, and instrumentation; two pop songs can feel intimate or celebratory. Useful creative direction combines genre with mood, energy, vocal style, and occasion. Describing 'warm acoustic country with gentle storytelling' gives more guidance than choosing country alone, while still leaving room for the song to develop naturally.",
    distinction:
      "Genre is different from mood. Genre describes musical language, while mood describes the feeling the song should create. It is also different from tempo, which concerns speed. A slow song is not automatically a ballad, and a happy song is not automatically pop. Separating these controls helps a creator change one quality without accidentally changing all of them at once.",
    importance:
      "The recipient's listening habits matter because familiarity can make personal lyrics easier to accept. A parent who loves classic country may connect with narrative verses and organic instruments, while someone who prefers modern R&B may respond to a smoother groove and layered vocals. The goal is not to imitate a specific copyrighted song or living artist. It is to choose broad musical traits that suit the person and message.",
    example:
      "A retirement song about decades of mentorship could work as upbeat pop, but a warm folk arrangement might better suit a recipient who values storytelling and acoustic music. The same facts would be used in either version. Genre changes how those facts are framed: conversational verses with guitar, or a brighter chorus with drums and synths. Selecting the recipient's preferred musical world makes the story feel more natural.",
    tips: [
      "Choose genre according to the recipient and occasion, not only the giver's current favorite music.",
      "Add two or three supporting traits such as acoustic, cinematic, danceable, intimate, or vintage instead of naming an artist to copy.",
      "Preview more than one genre when the story could support different moods, then judge which version makes the lyrics easiest to believe.",
    ],
    related: ["song-mood", "vocal-style", "tempo"],
    guide: {
      label: "compare country and other personalized song styles",
      href: "/playlists/styles",
    },
    nextStep: {
      label: "choose a genre for your custom song",
      href: "/create-song",
    },
  },
  {
    title: "Song Mood",
    slug: "song-mood",
    description:
      "Song mood is the emotional atmosphere created by lyrics, harmony, tempo, vocals, and production. Learn how to describe the right feeling.",
    tag: "Style & Production",
    definition:
      "Song mood is the emotional atmosphere a track creates for the listener. It can be joyful, nostalgic, tender, hopeful, playful, reflective, comforting, triumphant, or bittersweet. Mood emerges from several choices working together, including the lyrics, tempo, harmony, instruments, vocal delivery, dynamics, and the way the arrangement builds or remains restrained.",
    overview:
      "A useful mood direction describes both the main feeling and its intensity. 'Emotional' is broad, while 'warm and grateful without becoming overly sad' gives clearer boundaries. Some songs intentionally combine feelings. A memorial track may be sorrowful but reassuring; an anniversary song may be nostalgic and celebratory. Naming the balance helps the production support the occasion rather than relying on a single generic emotional label.",
    distinction:
      "Mood is not the same as genre. Country can sound joyful, lonely, humorous, or solemn, and piano music can feel peaceful or dramatic. Mood also differs from the message. A lyric may express pride, while the mood can be quiet and reflective or bold and triumphant. Treating these as separate decisions makes it easier to revise a song whose words are correct but whose emotional presentation feels wrong.",
    importance:
      "Custom songs are often played during emotionally loaded moments, so an inappropriate mood can undermine accurate lyrics. A playful vocal on a sincere memorial message may feel careless; an extremely sad arrangement for a birthday tribute may make the recipient uncomfortable. The right mood prepares the listener to receive the story. It should reflect the relationship and setting, not merely maximize dramatic intensity.",
    example:
      "For a thank-you song to a longtime teacher, the giver might choose 'uplifting, sincere, and gently nostalgic.' The verses can recall specific classroom moments, while a steady mid-tempo arrangement keeps the track warm rather than sentimental. If the initial version sounds too grand, reducing orchestral elements and using a more conversational vocal can preserve gratitude while making the mood feel closer to the relationship.",
    tips: [
      "Pair one primary mood with one qualifier, such as joyful and tender, instead of listing many emotions that compete.",
      "Describe what to avoid when necessary: heartfelt but not mournful, playful but not comedic, cinematic but not overpowering.",
      "Test the track in the setting where it will be shared and confirm that the emotional intensity clearly fits the actual moment.",
    ],
    related: ["song-genre", "tempo", "vocal-style"],
    guide: {
      label: "explore playlist ideas by occasion",
      href: "/playlists/occasions",
    },
    nextStep: {
      label: "set the mood for a song preview",
      href: "/create-song",
    },
  },
  {
    title: "Vocal Style",
    slug: "vocal-style",
    description:
      "Vocal style describes how a singer delivers a song through tone, phrasing, range, texture, and intensity. Learn how it affects personal lyrics.",
    tag: "Style & Production",
    definition:
      "Vocal style is the combination of tone, phrasing, range, texture, articulation, and emotional intensity used to deliver a song. A vocal may sound intimate, powerful, conversational, airy, soulful, bright, restrained, or theatrical. In a personalized song, the vocal style influences whether the lyrics feel like a private message, a celebration, a story, or a dramatic performance.",
    overview:
      "Choosing a vocal direction involves more than selecting a singer's gender or range. A soft close-miked performance can make simple words feel confidential, while a projected vocal with harmonies can turn the same chorus into a public celebration. Pronunciation also matters in custom songs because names and places may be unfamiliar. The best style supports clear storytelling and fits the musical arrangement without burying important personal details.",
    distinction:
      "Vocal style is not a request to copy a particular artist. Artist imitation can create legal, ethical, and quality problems, especially when a recognizable voice is involved. Safer direction describes musical characteristics: warm lower register, clear diction, gentle vibrato, energetic pop phrasing, or soulful but controlled delivery. These terms communicate the desired effect without asking for a deceptive replica of a real performer.",
    importance:
      "Recipients often respond to the voice before they process every lyric. If the delivery feels too aggressive, polished, youthful, or theatrical for the relationship, the story may feel less believable. A parent-to-child song may benefit from warmth and clarity, while a party reveal can support brighter energy. Vocal selection should therefore be evaluated against both the recipient's taste and the giver's intended emotional voice. That fit matters on repeated listens.",
    example:
      "A husband creating an anniversary song may want the lyrics to feel like words he could genuinely say. A restrained acoustic vocal with clear diction might fit better than a large power-ballad performance, even if the latter sounds technically impressive. If the chorus still needs lift, harmony and arrangement can add intensity without turning the lead vocal into a character that feels disconnected from him.",
    tips: [
      "Describe tone and delivery with neutral musical language instead of naming a celebrity voice to reproduce.",
      "Check every personal name and unusual place name for pronunciation before accepting the final version.",
      "Judge emotional credibility as well as vocal power; the most impressive performance is not always the most appropriate gift.",
    ],
    related: ["song-genre", "song-mood", "tempo"],
    guide: {
      label: "hear personalized song examples",
      href: "/samples",
    },
    nextStep: {
      label: "choose a vocal direction for your song",
      href: "/create-song",
    },
  },
  {
    title: "Tempo",
    slug: "tempo",
    description:
      "Tempo is the speed of a song, commonly measured in beats per minute. Learn how pacing changes lyrics, energy, and gift presentation.",
    tag: "Style & Production",
    definition:
      "Tempo is the speed at which a piece of music moves, commonly measured in beats per minute, or BPM. A lower tempo generally feels slower and gives lyrics more space, while a higher tempo creates greater forward motion. Tempo influences energy, danceability, phrasing, and how easily listeners can absorb the details in a personalized song.",
    overview:
      "Tempo works with rhythm and arrangement rather than acting alone. A track at the same BPM can feel relaxed with sparse drums or urgent with dense percussion and short vocal phrases. For custom songs, practical descriptions such as slow and intimate, steady mid-tempo, or upbeat and danceable are often more useful than an exact number. The producer can then balance musical energy with the amount of story the lyrics need to carry.",
    distinction:
      "Tempo is not identical to mood. Slow music can be romantic, sad, peaceful, or suspenseful, while fast music can be joyful or anxious. It is also separate from time signature and rhythmic feel. A waltz and a straight pop song may move at similar measured speeds but feel very different. Keeping these ideas separate prevents assumptions such as treating every sentimental story as a very slow ballad.",
    importance:
      "Personalized lyrics often contain names and narrative details that need clear space. If the tempo is too fast, lines may become crowded or pronunciation may suffer. If it is too slow, a light birthday message can feel heavier than intended. The reveal context matters as well: a mother-son dance needs a comfortable pulse, while a slideshow may need pacing that aligns with image changes and allows viewers to follow the words.",
    example:
      "A custom birthday song for an outgoing friend could begin as a slow piano track, but the giver may find that it sounds reflective rather than celebratory. Moving to a steady upbeat tempo with a clear groove can support humorous memories and make the chorus easier for a group to enjoy. The lyrics do not need to change completely; the new pacing changes how their personality is presented.",
    tips: [
      "Choose the desired energy and use case before specifying a BPM, especially if the song must support dancing or a video.",
      "Listen for rushed names and crowded lines; narrative clarity is a better guide than speed alone.",
      "Compare a slow and mid-tempo version when the story is emotional but the occasion is meant to remain uplifting.",
    ],
    related: ["song-mood", "song-genre", "vocal-style"],
    guide: {
      label: "browse music styles for different gifts",
      href: "/playlists/styles",
    },
    nextStep: {
      label: "preview your story at the right pace",
      href: "/create-song",
    },
  },
  {
    title: "Song Prompt",
    slug: "song-prompt",
    description:
      "A song prompt is the creative brief given to a songwriter or AI system. Learn which story, mood, and style details produce useful results.",
    tag: "Style & Production",
    definition:
      "A song prompt is a written creative brief that tells a songwriter or generative music system what kind of song to create. For a personalized track, it normally identifies the recipient, occasion, relationship, key memories, central message, preferred genre, mood, vocal direction, and any details that should be included or avoided.",
    overview:
      "An effective prompt provides boundaries without attempting to control every note. Story information answers what the song is about; musical direction answers how it should feel. Separating those parts makes revision easier. If the lyrics are generic, the story brief may need more concrete details. If the words are accurate but the track feels wrong, genre, mood, tempo, or vocal instructions may need adjustment instead.",
    distinction:
      "A prompt is not the final lyric and does not need to rhyme. Trying to write polished poetry inside the prompt can hide the facts the system actually needs. It is also not a pile of keywords. Contradictory directions such as 'minimal, orchestral, playful, solemn, fast, and relaxing' leave the creator without a clear priority. A strong prompt reads more like a concise note to a collaborator than a technical command.",
    importance:
      "The prompt is the main source of truth for a custom song. Missing relationships, incorrect spellings, or vague emotional language can propagate into every generated version. A structured brief reduces unnecessary regeneration and gives the user a standard for judging the result. The question becomes not simply whether the song sounds good, but whether it fulfills the story, message, and mood described in the prompt.",
    example:
      "A useful anniversary prompt might say: create a warm acoustic-pop song for my wife Elena for our fifteenth anniversary. Mention meeting during a rainstorm, our Sunday pancake tradition, and the courage she showed during a difficult move. The main message is that ordinary days with her became my favorite life. Keep it grateful and hopeful, not overly sad, with clear pronunciation of Elena.",
    tips: [
      "Include two or three vivid memories and one central message instead of sending an unedited life history.",
      "State the emotional direction in plain language and identify anything the song should avoid exaggerating or revealing.",
      "Verify names, relationships, dates, and pronouns before generation because small factual errors can change the entire meaning.",
    ],
    related: ["song-genre", "song-mood", "vocal-style"],
    guide: {
      label: "use custom song lyric prompts and examples",
      href: "/blog/custom-song-lyrics",
    },
    nextStep: {
      label: "build a song prompt from your story",
      href: "/create-song",
    },
  },
  {
    title: "Song Preview",
    slug: "song-preview",
    description:
      "A song preview is an early listen used to evaluate lyrics, vocals, style, and emotional fit before unlocking or finalizing a custom track.",
    tag: "Music Gift Formats",
    definition:
      "A song preview is an early or limited version of a track provided so a listener can evaluate its creative direction before final delivery or purchase. In a custom song workflow, the preview helps the giver assess the lyrics, pronunciation, vocal style, genre, mood, and overall emotional fit while changes are still practical.",
    overview:
      "Previews can take different forms: a shortened audio excerpt, a draft with temporary production, or one complete generated version that has not yet been unlocked for download. The important feature is decision support. A useful preview includes enough of the verse and chorus to reveal how the story is handled. A few seconds of instrumental introduction may demonstrate sound quality but cannot confirm whether the personal message works.",
    distinction:
      "A preview is not necessarily the final master and may have limits on length, download, or reuse. It also differs from a sample song made for another customer. Samples demonstrate the platform's general capabilities, while a preview tests the giver's own story and instructions. Users should understand which elements can be revised and what access becomes available after they approve or unlock the song.",
    importance:
      "Personalized gifts carry emotional risk because the giver cannot judge them using product photos alone. Previewing reduces that risk. It can reveal a mispronounced name, an inaccurate detail, a mood that feels too sad, or a chorus that does not state the intended message. Reviewing those points before the reveal protects both the recipient's experience and the time spent creating videos or printed keepsakes around the final track.",
    example:
      "A user creates a memorial song and hears that the first preview sounds dramatic rather than comforting. The lyrics are accurate, but the vocal intensity and heavy drums do not match the family. After changing the direction to gentle acoustic, restrained, and hopeful, the next version leaves more space for the words. The preview process identifies an emotional mismatch that would have been difficult to describe before hearing it.",
    tips: [
      "Listen once for overall feeling, then again with the lyrics visible to check facts, names, and the central message.",
      "Use headphones and an ordinary phone speaker because the gift may eventually be heard on both.",
      "Finalize the audio before building a lyric video, QR gift, or wall art so later assets do not preserve an outdated version.",
    ],
    related: ["lyric-video", "music-video-gift", "song-qr-code"],
    guide: {
      label: "learn how to make a custom song",
      href: "/blog/how-to-make-a-custom-song-for-someone",
    },
    nextStep: { label: "start a free song preview", href: "/create-song" },
  },
  {
    title: "Lyric Video",
    slug: "lyric-video",
    description:
      "A lyric video pairs a song with timed on-screen words and visual design, helping recipients follow personal lyrics while they listen.",
    tag: "Music Gift Formats",
    definition:
      "A lyric video is a video in which the words of a song appear on screen in time with the audio. It may use typography, animated backgrounds, album artwork, photos, or simple motion graphics. For a custom song, a lyric video helps the recipient understand personal names and story details while turning the track into an easy-to-share visual gift.",
    overview:
      "The visual treatment can be minimal or narrative. A simple version keeps the lyrics readable over a restrained background, while a gift-focused version may combine family photos with selected lines. Timing is central: words should appear early enough to read without racing the vocal, and line breaks should follow natural phrases. Typography, contrast, and safe margins matter because many recipients will watch on a phone rather than a large screen.",
    distinction:
      "A lyric video differs from a traditional music video that uses performances, actors, or visual storytelling without displaying every word. It also differs from a static audio visualizer, which may show artwork and movement but no synchronized text. A custom gift can combine these formats, but calling the result a lyric video sets the expectation that readable lyrics are a primary part of the experience.",
    importance:
      "Personalized songs often contain details the recipient wants to catch on the first listen. On-screen lyrics reduce missed names and make the message easier to follow in a noisy room or group reveal. They also add accessibility for viewers who benefit from text. Poorly timed or decorative typography can have the opposite effect, so clarity should take priority over elaborate animation.",
    example:
      "For a wedding anniversary, a lyric video might begin with a photo of the couple's first apartment, then transition through travel and family images while the verses describe those years. The chorus can use larger, consistent typography so its promise is immediately recognizable each time it returns. The final frame may show the song title and anniversary date, giving the video a natural ending without adding unrelated promotional text.",
    tips: [
      "Use high-contrast type at a size that remains readable on a mobile screen and avoid placing words over busy faces or photos.",
      "Confirm every lyric against the final audio version before timing scenes or exporting the video.",
      "Keep private photos and personal information within the sharing audience the recipient has agreed to.",
    ],
    related: ["music-video-gift", "song-preview", "lyric-wall-art"],
    guide: {
      label: "ways to share a custom song",
      href: "/blog/how-to-send-a-song-to-someone",
    },
    nextStep: {
      label: "open the personalized lyric video maker",
      href: "/music-video-gift-maker",
    },
  },
  {
    title: "Music Video Gift",
    slug: "music-video-gift",
    description:
      "A music video gift combines a meaningful song with photos, lyrics, and visual storytelling for a personal reveal or keepsake.",
    tag: "Music Gift Formats",
    definition:
      "A music video gift is a video created as a present by combining a meaningful song with photos, lyrics, messages, animation, or other visual memories. When the soundtrack is a custom song, the audio and images can tell the same personal story, producing a shareable keepsake for birthdays, anniversaries, weddings, memorials, graduations, and family milestones.",
    overview:
      "A strong music video gift has a beginning, development, and ending rather than displaying images in random order. The first scene can establish the recipient and occasion, verse scenes can follow memories chronologically or thematically, and the chorus can return to the most important photos or message. Visual pacing should follow the song's energy. Quiet sections need room, while faster sections can support more movement without making the images difficult to absorb.",
    distinction:
      "This format differs from an ordinary slideshow because the music and image sequence are intentionally coordinated. It also differs from a lyric video when photos and visual storytelling are the main focus rather than displaying every line. Many gift videos combine both approaches by showing selected lyrics over personal media. The choice should depend on whether the recipient most needs to read the words or relive the memories.",
    importance:
      "Visuals provide context that audio alone cannot show. A lyric about a family trip becomes more immediate when the relevant image appears, and relatives at a group reveal can understand stories they did not personally witness. The format is also easy to share remotely. However, adding more photos does not automatically increase emotional impact; careful selection and respectful privacy create a stronger result.",
    example:
      "For a parent's seventieth birthday, siblings could contribute photographs from childhood, work, holidays, and recent family gatherings. A custom song might describe the parent's reliability and humor. The video can organize images by life stage during the verses and return to current family portraits during the chorus. Ending on a short written thank-you gives the recipient time to absorb the message after the music resolves.",
    tips: [
      "Select images that support specific lyrics or emotional beats instead of trying to include every available photograph.",
      "Use landscape and portrait crops carefully so faces remain visible across phone, tablet, and desktop screens.",
      "Obtain permission before publishing a video that includes children, private events, or people outside the immediate gift exchange.",
    ],
    related: ["lyric-video", "song-preview", "song-qr-code"],
    guide: {
      label: "learn how to send a song as a gift",
      href: "/blog/how-to-send-a-song-to-someone",
    },
    nextStep: {
      label: "make a music video from your custom song",
      href: "/music-video-gift-maker",
    },
  },
  {
    title: "Lyric Wall Art",
    slug: "lyric-wall-art",
    description:
      "Lyric wall art turns meaningful song words into a printable visual keepsake using typography, photos, dates, and personal design details.",
    tag: "Music Gift Formats",
    definition:
      "Lyric wall art is a visual design that presents meaningful song lyrics as printable or displayable artwork. It can combine selected lines with typography, a song title, names, dates, photographs, waveform shapes, or record-inspired layouts. When based on a custom song, the artwork preserves words written specifically for the recipient rather than quoting a widely shared commercial track.",
    overview:
      "Design formats range from a minimal excerpt to a full lyric poster. The amount of text determines the layout: one chorus can use larger expressive typography, while a complete song needs smaller type and stronger hierarchy. Print size, viewing distance, margins, and image resolution must be considered before export. The most attractive screen preview may not remain readable when printed at a different aspect ratio.",
    distinction:
      "Lyric wall art differs from album artwork, which represents a song visually but may not display its words. It also differs from a lyric video because it is static and must communicate without timing or audio. Copyright is an important distinction: using lyrics from a commercial song may require permission, while artwork made from original custom lyrics can avoid that problem when the user has the necessary rights under the creation service's terms.",
    importance:
      "A song is experienced over time, but wall art lets one important message remain visible in daily life. It can extend a digital gift into a physical keepsake, especially for weddings, anniversaries, memorials, or family homes. Effective designs do not treat every lyric line equally. They highlight the phrase the recipient is most likely to remember and use supporting details without overwhelming it.",
    example:
      "An anniversary print might feature the custom song's chorus in the center, the couple's names and wedding date below, and a subtle photograph behind the text. A smaller section can include the first verse or a QR code leading to the audio. The composition connects the words, date, and listening experience while remaining simple enough to frame and read from a normal distance.",
    tips: [
      "Choose the lyric excerpt before selecting a template because text length determines which layouts will remain readable.",
      "Export at the intended print dimensions with sufficient resolution and leave safe margins for trimming and framing.",
      "Proofread names, dates, punctuation, and lyric line breaks against the final song before downloading the artwork.",
    ],
    related: ["lyric-video", "song-qr-code", "music-video-gift"],
    guide: {
      label: "compare printable lyric wall art formats",
      href: "/blog/song-lyric-wall-art-ideas",
    },
    nextStep: {
      label: "design printable lyric wall art",
      href: "/lyricwallart",
    },
  },
  {
    title: "Song QR Code",
    slug: "song-qr-code",
    description:
      "A song QR code opens a listening page when scanned, connecting cards, posters, frames, and physical gifts to personal audio.",
    tag: "Music Gift Formats",
    definition:
      "A song QR code is a scannable image that directs a phone or tablet to an online page where a song can be played. It connects a physical object, such as a card, framed lyric print, photo album, invitation, or gift box, to digital audio without requiring the recipient to type a long web address.",
    overview:
      "The QR code contains a URL rather than the audio file itself. When scanned, the device opens that destination, so the listening page must remain available and work without unnecessary friction. A custom song gift may use a private share page, a hosted audio page, or another stable link. The printed code needs sufficient size, contrast, and quiet space around its edges for reliable scanning.",
    distinction:
      "A song QR code is not the same as the branded scannable codes used by individual streaming platforms, which may require a particular app. Standard QR codes can be read by most phone cameras and can point to a broader range of destinations. The code also does not guarantee privacy. Anyone who can scan or photograph it may be able to open the linked page unless additional access controls are used.",
    importance:
      "Custom songs are digital, while many gift moments still involve physical objects. A QR code bridges those formats. It lets a recipient scan framed lyrics to hear the track or open a card during a surprise. Reliability is more important than novelty. A broken destination, tiny print, weak contrast, or login requirement can interrupt the reveal and leave the recipient unsure what the code is meant to do.",
    example:
      "A family creates a custom song for their grandparents' anniversary and prints the chorus as wall art. A QR code in the lower corner opens a mobile-friendly share page containing the full song and a short dedication. Before framing the print, the family tests the code from several phones and at the expected print size. The grandparents can display the words and replay the audio without managing files.",
    tips: [
      "Link to a stable, mobile-friendly listening page and avoid temporary file URLs that may expire after the gift is delivered.",
      "Print a test at actual size, then scan it in bright and dim light from more than one device.",
      "Place the code on a clear background with adequate surrounding space and include a short instruction such as 'Scan to listen.'",
    ],
    related: ["lyric-wall-art", "music-video-gift", "song-preview"],
    guide: {
      label: "learn how to share a song link or file",
      href: "/blog/how-to-send-a-song-to-someone",
    },
    nextStep: { label: "create a custom song to share", href: "/create-song" },
  },
];

function buildRelatedLink(slug: string) {
  const entry = glossaryEntries.find((candidate) => candidate.slug === slug);

  if (!entry) {
    throw new Error(`Related glossary entry not found: ${slug}`);
  }

  return `- [${entry.title}](/glossary/${entry.slug}) explains a connected part of the custom song process.`;
}

function buildContent(entry: GlossaryEntry) {
  return `${entry.definition}

## What ${entry.title.toLowerCase()} means

${entry.overview}

${entry.distinction}

## Why it matters for a custom song

${entry.importance}

## Example

${entry.example}

## How to use this idea

1. ${entry.tips[0]}
2. ${entry.tips[1]}
3. ${entry.tips[2]}

For a broader walkthrough, read [${entry.guide.label}](${entry.guide.href}).

## Related terms

${entry.related.map(buildRelatedLink).join("\n")}

## Next step

When you are ready to apply the concept, [${entry.nextStep.label}](${entry.nextStep.href}).`;
}

function countWords(markdown: string) {
  return (
    markdown
      .replace(/\[[^\]]+\]\([^)]+\)/g, (link) =>
        link.replace(/\]\([^)]+\)/, ""),
      )
      .match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0
  );
}

function countInternalLinks(markdown: string) {
  return markdown.match(/\]\(\/[a-z0-9?=/_-]+\)/g)?.length ?? 0;
}

function validateEntries() {
  if (glossaryEntries.length !== 20) {
    throw new Error(
      `Expected 20 glossary entries, found ${glossaryEntries.length}`,
    );
  }

  const slugs = new Set<string>();
  const expectedTags = new Set([
    "Custom Song Basics",
    "Songwriting & Structure",
    "Style & Production",
    "Music Gift Formats",
  ]);

  for (const entry of glossaryEntries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`Duplicate glossary slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    if (!expectedTags.has(entry.tag)) {
      throw new Error(`Unexpected tag for ${entry.slug}: ${entry.tag}`);
    }

    const content = buildContent(entry);
    const wordCount = countWords(content);
    const internalLinkCount = countInternalLinks(content);

    if (wordCount < 450 || wordCount > 700) {
      throw new Error(`${entry.slug} has ${wordCount} words; expected 450-700`);
    }

    if (internalLinkCount < 3 || internalLinkCount > 5) {
      throw new Error(
        `${entry.slug} has ${internalLinkCount} internal links; expected 3-5`,
      );
    }

    if (entry.description.length < 120 || entry.description.length > 170) {
      throw new Error(
        `${entry.slug} description has ${entry.description.length} characters; expected 120-170`,
      );
    }
  }
}

async function seedGlossary() {
  validateEntries();

  const summary = glossaryEntries.map((entry) => ({
    slug: entry.slug,
    words: countWords(buildContent(entry)),
    links: countInternalLinks(buildContent(entry)),
    tag: entry.tag,
  }));

  if (!process.argv.includes("--apply")) {
    console.table(summary);
    console.log(
      "Dry run complete. Pass --apply to write these drafts to the database.",
    );
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    connect_timeout: 15,
    idle_timeout: 20,
  });
  try {
    const configuredAuthorEmail =
      process.env.GLOSSARY_AUTHOR_EMAIL?.trim() || null;
    const payload = glossaryEntries.map((entry) => ({
      title: entry.title,
      slug: entry.slug,
      content: buildContent(entry),
      description: entry.description,
      tag_name: entry.tag,
    }));

    console.log("Writing glossary drafts in one atomic statement...");
    const [result] = await client<
      Array<{
        author_count: number;
        author_email: string | null;
        input_count: number;
        inserted_count: number;
        updated_count: number;
        skipped_count: number;
        tag_count: number;
        association_count: number;
      }>
    >`
      with input as (
        select *
        from jsonb_to_recordset(${client.json(payload)}::jsonb) as entry(
          title text,
          slug text,
          content text,
          description text,
          tag_name text
        )
      ),
      author_candidates as (
        select id, email
        from "user"
        where role = 'admin'
          and (${configuredAuthorEmail}::text is null or email = ${configuredAuthorEmail})
      ),
      selected_author as (
        select id, email
        from author_candidates
        where (select count(*) from author_candidates) = 1
      ),
      tag_input as (
        select distinct input.tag_name as name
        from input
        cross join selected_author
      ),
      inserted_tags as (
        insert into tags (name, post_type)
        select name, 'glossary'::post_type
        from tag_input
        on conflict (name, post_type) do nothing
        returning id, name
      ),
      resolved_tags as (
        select id, name from inserted_tags
        union all
        select existing.id, existing.name
        from tags as existing
        join tag_input on tag_input.name = existing.name
        where existing.post_type = 'glossary'::post_type
          and not exists (
            select 1 from inserted_tags where inserted_tags.name = existing.name
          )
      ),
      existing_posts as (
        select existing.id, existing.slug, existing.status
        from posts as existing
        join input on input.slug = existing.slug
        where existing.language = 'en'
          and existing.post_type = 'glossary'::post_type
      ),
      upserted_posts as (
        insert into posts (
          language,
          post_type,
          author_id,
          title,
          slug,
          content,
          description,
          featured_image_url,
          is_pinned,
          status,
          visibility
        )
        select
          'en',
          'glossary'::post_type,
          selected_author.id,
          input.title,
          input.slug,
          input.content,
          input.description,
          null,
          false,
          'draft'::post_status,
          'public'::post_visibility
        from input
        cross join selected_author
        on conflict (language, slug, post_type) do update
        set
          author_id = excluded.author_id,
          title = excluded.title,
          content = excluded.content,
          description = excluded.description,
          featured_image_url = null,
          is_pinned = false,
          visibility = 'public'::post_visibility,
          updated_at = now()
        where posts.status = 'draft'::post_status
        returning id, slug
      ),
      inserted_associations as (
        insert into post_tags (post_id, tag_id)
        select upserted_posts.id, resolved_tags.id
        from upserted_posts
        join input on input.slug = upserted_posts.slug
        join resolved_tags on resolved_tags.name = input.tag_name
        on conflict (post_id, tag_id) do nothing
        returning post_id
      )
      select
        (select count(*)::int from author_candidates) as author_count,
        (select email from selected_author) as author_email,
        (select count(*)::int from input) as input_count,
        (
          select count(*)::int
          from input
          left join existing_posts on existing_posts.slug = input.slug
          where existing_posts.id is null
        ) as inserted_count,
        (
          select count(*)::int
          from existing_posts
          where status = 'draft'::post_status
        ) as updated_count,
        (
          select count(*)::int
          from existing_posts
          where status <> 'draft'::post_status
        ) as skipped_count,
        (select count(*)::int from resolved_tags) as tag_count,
        (select count(*)::int from inserted_associations) as association_count
    `;

    if (result.author_count !== 1) {
      throw new Error(
        configuredAuthorEmail
          ? `No unique admin found for GLOSSARY_AUTHOR_EMAIL=${configuredAuthorEmail}`
          : "Expected exactly one admin. Set GLOSSARY_AUTHOR_EMAIL to choose the author.",
      );
    }

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.end({ timeout: 1 });
  }
}

seedGlossary().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
