export type OccasionCard = {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  cta: string;
  image: string;
  rotate: number;
  y: number;
  duration: string;
  sampleTrack: OccasionSampleTrack;
};

export type OccasionSampleTrackMatchType = "exact" | "related";

export type OccasionSampleSong = {
  id: string;
  title: string;
  sourcePrefix: string;
  audioUrl: string;
};

export type OccasionSampleTrack = OccasionSampleSong & {
  matchType: OccasionSampleTrackMatchType;
};

const occasionDemoSongs = {
  anniversary: {
    id: "occasion-demo-anniversary",
    title: "Ten Years, Ava",
    sourcePrefix: "anniversary",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/anniversary-ten-years-ava.mp3",
  },
  apology: {
    id: "occasion-demo-apology",
    title: "James I’m Sorry",
    sourcePrefix: "apology",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/apology-james-im-sorry.mp3",
  },
  christmas: {
    id: "occasion-demo-christmas",
    title: "Carter Family Christmas",
    sourcePrefix: "christmas",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/carter-family-christmas.mp3",
  },
  fathersDay: {
    id: "occasion-demo-fathers-day",
    title: "Seatbelt and Wrenches",
    sourcePrefix: "father’s day",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/fathers-day-seatbelt-and-wrenches.mp3",
  },
  getWellSoon: {
    id: "occasion-demo-get-well-soon",
    title: "Sky Photos for Lily",
    sourcePrefix: "get well soon",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/get-well-soon-sky-photos-for-lily.mp3",
  },
  mothersDay: {
    id: "occasion-demo-mothers-day",
    title: "Linda My Mom",
    sourcePrefix: "mother’s day",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/mothers-day-linda-my-mom.mp3",
  },
  proposal: {
    id: "occasion-demo-proposal",
    title: "Final Page Forever",
    sourcePrefix: "proposal",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/proposal-final-page-forever.mp3",
  },
  sweetestDay: {
    id: "occasion-demo-sweetest-day",
    title: "Cart and Umbrella",
    sourcePrefix: "sweetest day",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/sweetest-day-cart-and-umbrella.mp3",
  },
  thankYou: {
    id: "occasion-demo-thankyou",
    title: "Ms Country",
    sourcePrefix: "thankyou",
    audioUrl:
      "https://cdn.onecustomsong.com/audio/occasion-demos/thankyou-ms-country.mp3",
  },
} satisfies Record<string, OccasionSampleSong>;

function sampleTrack(
  song: OccasionSampleSong,
  matchType: OccasionSampleTrackMatchType,
): OccasionSampleTrack {
  return {
    ...song,
    matchType,
  };
}

export const occasionCards = [
  // 日常随手表达关心的真诚祝福
  {
    id: "just-because",
    index: "01",
    title: "Just Because",
    tagline: "Everyday Magic",
    description:
      'No date needed. Just a beautiful way to say, "I\'m thinking of you."',
    href: "/create-song?occasion=just-because",
    cta: "Create a just-because song",
    image: "/occasion-generated/avif/01-just-because.avif",
    rotate: -4.6,
    y: 10,
    duration: "1:28",
    sampleTrack: sampleTrack(occasionDemoSongs.thankYou, "related"),
  },
  // 用音乐记录爱情的里程碑
  {
    id: "anniversary",
    index: "02",
    title: "Anniversary",
    tagline: "Your Love Story, Set to Music",
    description: "Turn your years of shared laughter into a forever melody.",
    href: "/occasions/anniversary",
    cta: "Create an anniversary song",
    image: "/occasion-generated/avif/02-anniversary.avif",
    rotate: 2.8,
    y: 34,
    duration: "2:05",
    sampleTrack: sampleTrack(occasionDemoSongs.anniversary, "exact"),
  },
  // 为婚礼和永恒承诺留下回忆
  {
    id: "wedding",
    index: "03",
    title: "Wedding",
    tagline: "For the Big Day & Forever After",
    description:
      "Freeze the magic of your vows in a song you can relive forever.",
    href: "/music/personalized-gift",
    cta: "Explore wedding music gifts",
    image: "/occasion-generated/avif/03-wedding.avif",
    rotate: -1.8,
    y: 0,
    duration: "1:51",
    sampleTrack: sampleTrack(occasionDemoSongs.proposal, "related"),
  },
  // 生日礼物里融入童年和成长的温度
  {
    id: "birthday",
    index: "04",
    title: "Birthday",
    tagline: "A Gift That Sings",
    description:
      "Capture their fleeting childhood years in a melody they'll never outgrow.",
    href: "/occasions/custom-happy-birthday-song",
    cta: "Make a birthday song gift",
    image: "/occasion-generated/avif/04-birthday.avif",
    rotate: 3.6,
    y: 28,
    duration: "1:44",
    sampleTrack: sampleTrack(occasionDemoSongs.sweetestDay, "related"),
  },
  // 感谢母亲的养育与无私付出
  {
    id: "mothers-day-mom",
    index: "05",
    title: "Mother's Day (Mom)",
    tagline: "To the One Who Gave You Everything",
    description:
      "Wrap your gratitude in a song she will replay with tears of joy.",
    href: "/music/personalized-gift",
    cta: "Make a personalized music gift",
    image: "/occasion-generated/avif/05-mothers-day-mom.avif",
    rotate: -3.2,
    y: 12,
    duration: "2:12",
    sampleTrack: sampleTrack(occasionDemoSongs.mothersDay, "exact"),
  },
  // 向父亲表达沉默中的深厚爱意
  {
    id: "fathers-day",
    index: "06",
    title: "Father's Day",
    tagline: "For His Quiet Strength",
    description:
      "For the man of few words—tell him exactly what he means to you.",
    href: "/music/personalized-gift",
    cta: "Make a personalized music gift",
    image: "/occasion-generated/avif/06-fathers-day.avif",
    rotate: 4.4,
    y: 40,
    duration: "1:39",
    sampleTrack: sampleTrack(occasionDemoSongs.fathersDay, "exact"),
  },
  // 节日氛围下的温暖家人祝福
  {
    id: "christmas-holidays",
    index: "07",
    title: "Christmas & Holidays",
    tagline: "Warmth Under the Tree",
    description:
      "A cozy melody to bring the whole family closer around the fire.",
    href: "/music/personalized-gift",
    cta: "Explore music gift ideas",
    image: "/occasion-generated/avif/07-christmas-holidays.avif",
    rotate: -2.4,
    y: 4,
    duration: "1:57",
    sampleTrack: sampleTrack(occasionDemoSongs.christmas, "exact"),
  },
  // 让求婚瞬间有一首专属的誓言歌
  {
    id: "proposal",
    index: "08",
    title: "Proposal",
    tagline: "Pop the Question with a Verse",
    description:
      'Ensure the perfect "Yes!" with a track that explains why she\'s your forever.',
    href: "/music/personalized-gift",
    cta: "Create a proposal song",
    image: "/occasion-generated/avif/08-proposal.avif",
    rotate: 2.2,
    y: 26,
    duration: "2:18",
    sampleTrack: sampleTrack(occasionDemoSongs.proposal, "exact"),
  },
  // 记录成长里程碑与传统传承
  {
    id: "mitzvah-coming-of-age",
    index: "09",
    title: "Mitzvah / Coming of Age",
    tagline: "Celebrating Heritage & Growth",
    description:
      "Honor their big milestone with a song that keeps their roots close.",
    href: "/create-song?occasion=coming-of-age",
    cta: "Create a milestone song",
    image: "/occasion-generated/avif/09-mitzvah-coming-of-age.avif",
    rotate: -4,
    y: 18,
    duration: "1:46",
    sampleTrack: sampleTrack(occasionDemoSongs.mothersDay, "related"),
  },
  // 为毕业时刻配上一首勇敢向前的主题歌
  {
    id: "graduation",
    index: "10",
    title: "Graduation",
    tagline: "The Soundtrack to Their Next Chapter",
    description:
      "Celebrate the late nights and big dreams with an anthem for the road ahead.",
    href: "/create-song?occasion=graduation",
    cta: "Create a graduation song",
    image: "/occasion-generated/avif/10-graduation.avif",
    rotate: 3.2,
    y: 42,
    duration: "2:01",
    sampleTrack: sampleTrack(occasionDemoSongs.fathersDay, "related"),
  },
  // 用音乐感谢同事的专业与陪伴
  {
    id: "coworker-appreciation",
    index: "11",
    title: "Co-Worker Appreciation",
    tagline: "Beyond the Safe Office Thank-You",
    description:
      "Skip the generic card. Honor a legendary teammate with a song about their impact.",
    href: "/create-song?occasion=appreciation",
    cta: "Create an appreciation song",
    image: "/occasion-generated/avif/11-coworker-appreciation.avif",
    rotate: -2.8,
    y: 8,
    duration: "1:33",
    sampleTrack: sampleTrack(occasionDemoSongs.thankYou, "related"),
  },
  // 为离别和新开始送上温柔的告别歌
  {
    id: "moving-goodbye",
    index: "12",
    title: "Moving / Goodbye",
    tagline: "Distance Can't Erase the Sound",
    description:
      "Send them off to their next chapter with a melody that feels like home.",
    href: "/music/personalized-gift",
    cta: "Send a personalized music gift",
    image: "/occasion-generated/avif/12-moving-goodbye.avif",
    rotate: 4.8,
    y: 30,
    duration: "1:59",
    sampleTrack: sampleTrack(occasionDemoSongs.getWellSoon, "related"),
  },
  // 以温柔旋律帮助修复关系与和解
  {
    id: "reconciliation-healing",
    index: "13",
    title: "Reconciliation / Healing",
    tagline: "Mending Bridges with Harmony",
    description:
      "When words feel too heavy, let a gentle song soften the distance between you.",
    href: "/create-song?occasion=apology",
    cta: "Create a healing song",
    image: "/occasion-generated/avif/13-reconciliation-healing.avif",
    rotate: -3.8,
    y: 15,
    duration: "2:24",
    sampleTrack: sampleTrack(occasionDemoSongs.apology, "exact"),
  },
  // 让甜蜜日给爱情加一点意外惊喜
  {
    id: "sweetest-day",
    index: "14",
    title: "Sweetest Day",
    tagline: "A Little Extra Romance",
    description:
      "Make their heart skip a beat with a spontaneous, sweet track.",
    href: "/occasions/anniversary",
    cta: "Create a romantic song",
    image: "/occasion-generated/avif/14-sweetest-day.avif",
    rotate: 2.7,
    y: 37,
    duration: "1:42",
    sampleTrack: sampleTrack(occasionDemoSongs.sweetestDay, "exact"),
  },
  // 领养与家庭欢迎的特别时刻
  {
    id: "adoption",
    index: "15",
    title: "Baby on the Way",
    tagline: "A Little Song Before Hello",
    description:
      "Celebrate the joy of your soon-to-arrive baby with a heartfelt melody that welcomes them home before they even arrive.",
    href: "/music/personalized-gift",
    cta: "Create a song for baby",
    image: "/occasion-generated/avif/15-adoption-baby-on-the-way.avif",
    rotate: -1.5,
    y: 5,
    duration: "2:09",
    sampleTrack: sampleTrack(occasionDemoSongs.mothersDay, "related"),
  },
  // 为“妻子兼母亲”的角色致敬
  {
    id: "mothers-day-wife-mom",
    index: "17",
    title: "Mother's Day (Wife + Mom)",
    tagline: "To the Heart of Our Home",
    description:
      "Show her how beautiful she is as a mother with a soul-stirring ballad.",
    href: "/music/personalized-gift",
    cta: "Make a personalized music gift",
    image: "/occasion-generated/avif/17-mothers-day-wife-mom.avif",
    rotate: -4.4,
    y: 38,
    duration: "2:16",
    sampleTrack: sampleTrack(occasionDemoSongs.mothersDay, "exact"),
  },
  // 为异地恋带来近在咫尺的心意
  {
    id: "deployment-long-distance",
    index: "18",
    title: "Long Distance",
    tagline: "Keeping Love Close via Waves",
    description:
      "When miles separate you, give them a piece of your soul to hold onto.",
    href: "/music/personalized-gift",
    cta: "Send a personalized music gift",
    image: "/occasion-generated/avif/18-deployment-long-distance.avif",
    rotate: 2.4,
    y: 9,
    duration: "1:55",
    sampleTrack: sampleTrack(occasionDemoSongs.anniversary, "related"),
  },
  // 以纪念的方式留住逝去挚爱的光辉
  {
    id: "memorial",
    index: "19",
    title: "Memorial / In Loving Memory",
    tagline: "A Tribute That Lives On",
    description:
      "Keep their light alive with a gentle, comforting acoustic tribute.",
    href: "/create-song?occasion=memorial",
    cta: "Create a tribute song",
    image: "/occasion-generated/avif/19-memorial.avif",
    rotate: -2,
    y: 27,
    duration: "2:31",
    sampleTrack: sampleTrack(occasionDemoSongs.getWellSoon, "related"),
  },
  // 情人节里给爱人一首贴心的情歌
  {
    id: "valentines-day",
    index: "20",
    title: "Valentine's Day",
    tagline: "Better Than Flowers or Chocolate",
    description:
      "A song woven from your midnight talks—a romance that never fades.",
    href: "/occasions/anniversary",
    cta: "Create a romantic song",
    image: "/occasion-generated/avif/20-valentines-day.avif",
    rotate: 3.8,
    y: 14,
    duration: "1:49",
    sampleTrack: sampleTrack(occasionDemoSongs.sweetestDay, "related"),
  },
  // 重温誓言，续写关系中的承诺
  {
    id: "vow-renewal",
    index: "21",
    title: "Vow Renewal",
    tagline: "I Still Do, More Than Ever",
    description:
      "Reaffirm your commitment with a soulful track that honors the life you've built.",
    href: "/occasions/anniversary",
    cta: "Create an anniversary song",
    image: "/occasion-generated/avif/21-vow-renewal.avif",
    rotate: -3.5,
    y: 33,
    duration: "2:07",
    sampleTrack: sampleTrack(occasionDemoSongs.anniversary, "related"),
  },
  // 以真诚道歉换取心灵的柔和修复
  {
    id: "apology",
    index: "23",
    title: "Apology",
    tagline: "When Sorry Needs a Melody",
    description:
      "Speak straight from your soul with a melody that shows your true sincerity.",
    href: "/create-song?occasion=apology",
    cta: "Create an apology song",
    image: "/occasion-generated/avif/23-apology.avif",
    rotate: -2.9,
    y: 22,
    duration: "2:14",
    sampleTrack: sampleTrack(occasionDemoSongs.apology, "exact"),
  },
] satisfies OccasionCard[];

type OccasionCardCopy = Pick<
  OccasionCard,
  "title" | "tagline" | "description" | "cta"
>;

export const occasionCardTranslations: Record<
  "es" | "ja",
  Record<string, OccasionCardCopy>
> = {
  es: {
    "just-because": {
      title: "Porque sí",
      tagline: "Magia cotidiana",
      description:
        "No hace falta una fecha especial. Una forma bonita de decir: pienso en ti.",
      cta: "Crear una canción porque sí",
    },
    anniversary: {
      title: "Aniversario",
      tagline: "Vuestra historia convertida en música",
      description:
        "Convierte los años de risas compartidas en una melodía para siempre.",
      cta: "Crear una canción de aniversario",
    },
    wedding: {
      title: "Boda",
      tagline: "Para ese gran día y todo lo que viene",
      description:
        "Guarda la emoción de vuestros votos en una canción para volver a vivirla siempre.",
      cta: "Ver regalos musicales para bodas",
    },
    birthday: {
      title: "Cumpleaños",
      tagline: "Un regalo que canta",
      description:
        "Convierte los recuerdos de su infancia en una melodía que siempre querrá escuchar.",
      cta: "Crear una canción de cumpleaños",
    },
    "mothers-day-mom": {
      title: "Día de la Madre",
      tagline: "Para quien te lo dio todo",
      description:
        "Envuelve tu gratitud en una canción que escuchará con una sonrisa y alguna lágrima.",
      cta: "Crear un regalo musical personalizado",
    },
    "fathers-day": {
      title: "Día del Padre",
      tagline: "Para su fuerza silenciosa",
      description:
        "Dile a ese hombre de pocas palabras todo lo que significa para ti.",
      cta: "Crear un regalo musical personalizado",
    },
    "christmas-holidays": {
      title: "Navidad y fiestas",
      tagline: "Calidez junto al árbol",
      description:
        "Una melodía acogedora para reunir a toda la familia alrededor del fuego.",
      cta: "Ver ideas de regalos musicales",
    },
    proposal: {
      title: "Propuesta",
      tagline: "Haz la pregunta con una canción",
      description:
        "Acompaña ese sí con una canción que explique por qué quieres compartir la vida con esa persona.",
      cta: "Crear una canción para una propuesta",
    },
    "mitzvah-coming-of-age": {
      title: "Mayoría de edad",
      tagline: "Celebrar raíces y crecimiento",
      description:
        "Honra un gran paso con una canción que mantenga cerca sus raíces.",
      cta: "Crear una canción para un gran momento",
    },
    graduation: {
      title: "Graduación",
      tagline: "La banda sonora de su próximo capítulo",
      description:
        "Celebra las noches de esfuerzo y los grandes sueños con un himno para el camino que empieza.",
      cta: "Crear una canción de graduación",
    },
    "coworker-appreciation": {
      title: "Agradecimiento a un compañero",
      tagline: "Más que un gracias de oficina",
      description:
        "Deja la tarjeta genérica. Celebra a un compañero inolvidable con una canción sobre su impacto.",
      cta: "Crear una canción de agradecimiento",
    },
    "moving-goodbye": {
      title: "Mudanza y despedida",
      tagline: "La distancia no borra lo que se escucha",
      description:
        "Despídele hacia su nuevo capítulo con una melodía que se sienta como hogar.",
      cta: "Enviar un regalo musical personalizado",
    },
    "reconciliation-healing": {
      title: "Reconciliación y sanación",
      tagline: "Tender puentes con armonía",
      description:
        "Cuando las palabras pesan demasiado, una canción suave puede acortar la distancia.",
      cta: "Crear una canción para sanar",
    },
    "sweetest-day": {
      title: "Un día para consentir",
      tagline: "Un poco más de romance",
      description:
        "Haz que el corazón se acelere con una canción dulce e inesperada.",
      cta: "Crear una canción romántica",
    },
    adoption: {
      title: "Un bebé en camino",
      tagline: "Una canción antes del primer hola",
      description:
        "Celebra la llegada de un bebé con una melodía que le dé la bienvenida incluso antes de conocerlo.",
      cta: "Crear una canción para el bebé",
    },
    "mothers-day-wife-mom": {
      title: "Día de la Madre para esposa y mamá",
      tagline: "El corazón de nuestro hogar",
      description:
        "Dile lo hermosa que es como madre con una balada que hable de ella.",
      cta: "Crear un regalo musical personalizado",
    },
    "deployment-long-distance": {
      title: "Relación a distancia",
      tagline: "Mantener el amor cerca",
      description:
        "Cuando los kilómetros os separan, regálale un pedazo de ti al que pueda aferrarse.",
      cta: "Enviar un regalo musical personalizado",
    },
    memorial: {
      title: "Homenaje y recuerdo",
      tagline: "Un tributo que permanece",
      description:
        "Mantén viva su luz con un tributo acústico, sereno y reconfortante.",
      cta: "Crear una canción homenaje",
    },
    "valentines-day": {
      title: "San Valentín",
      tagline: "Mejor que flores o chocolate",
      description:
        "Una canción nacida de vuestras conversaciones nocturnas: un romance que no se apaga.",
      cta: "Crear una canción romántica",
    },
    "vow-renewal": {
      title: "Renovación de votos",
      tagline: "Te elijo, más que nunca",
      description:
        "Renueva vuestro compromiso con una canción que honre la vida que habéis construido.",
      cta: "Crear una canción de aniversario",
    },
    apology: {
      title: "Disculpas",
      tagline: "Cuando un perdón necesita melodía",
      description:
        "Habla desde el corazón con una canción que muestre lo sincero que eres.",
      cta: "Crear una canción de disculpa",
    },
  },
  ja: {
    "just-because": {
      title: "なんでもない日の贈り物",
      tagline: "日常に小さな魔法を",
      description:
        "特別な日でなくても大丈夫。ふと思い出した気持ちを歌で届けられます。",
      cta: "なんでもない日の歌を作る",
    },
    anniversary: {
      title: "記念日",
      tagline: "ふたりの物語を音楽に",
      description: "一緒に笑ってきた年月を、いつまでも聴けるメロディにします。",
      cta: "記念日ソングを作る",
    },
    wedding: {
      title: "結婚式",
      tagline: "特別な一日と、その先の毎日に",
      description: "誓いの瞬間を、何度でも思い出せる一曲に残します。",
      cta: "結婚式の音楽ギフトを見る",
    },
    birthday: {
      title: "誕生日",
      tagline: "歌で贈るプレゼント",
      description: "成長の思い出を、いつまでも心に残るメロディにします。",
      cta: "誕生日ソングを作る",
    },
    "mothers-day-mom": {
      title: "母の日",
      tagline: "すべてを与えてくれた人へ",
      description: "感謝の気持ちを、思わず笑顔と涙がこぼれる一曲に込めます。",
      cta: "パーソナル音楽ギフトを作る",
    },
    "fathers-day": {
      title: "父の日",
      tagline: "静かな強さを持つ父へ",
      description: "口数の少ない父に、どれほど大切な存在かを歌で伝えます。",
      cta: "パーソナル音楽ギフトを作る",
    },
    "christmas-holidays": {
      title: "クリスマスとホリデー",
      tagline: "ツリーの下のぬくもり",
      description: "家族の距離をそっと近づける、あたたかなメロディです。",
      cta: "音楽ギフトのアイデアを見る",
    },
    proposal: {
      title: "プロポーズ",
      tagline: "歌で伝える大切な質問",
      description:
        "なぜずっと一緒にいたいのかを、一曲に込めて最高の「はい」を迎えます。",
      cta: "プロポーズソングを作る",
    },
    "mitzvah-coming-of-age": {
      title: "成人・成長の節目",
      tagline: "ルーツと成長を祝う",
      description: "大きな節目を、家族のルーツを感じられる歌で祝います。",
      cta: "節目のための歌を作る",
    },
    graduation: {
      title: "卒業",
      tagline: "次の章へ進むためのサウンドトラック",
      description: "努力した夜と大きな夢を、新しい道へ向かう応援歌にします。",
      cta: "卒業ソングを作る",
    },
    "coworker-appreciation": {
      title: "同僚への感謝",
      tagline: "ありきたりな感謝状を超えて",
      description:
        "定型文のカードではなく、忘れられない仲間の存在を歌で讃えます。",
      cta: "感謝の歌を作る",
    },
    "moving-goodbye": {
      title: "引っ越し・別れ",
      tagline: "距離があっても消えない音",
      description:
        "新しい章へ進む人に、故郷のように感じられるメロディを贈ります。",
      cta: "パーソナル音楽ギフトを送る",
    },
    "reconciliation-healing": {
      title: "仲直り・癒やし",
      tagline: "ハーモニーで心の橋をかける",
      description:
        "言葉にするのが難しいとき、優しい歌がふたりの距離を縮めます。",
      cta: "癒やしの歌を作る",
    },
    "sweetest-day": {
      title: "とびきり甘い一日",
      tagline: "いつもより少しロマンチックに",
      description: "ふいに心が高鳴るような、甘くてやさしい一曲を贈ります。",
      cta: "ロマンチックな歌を作る",
    },
    adoption: {
      title: "赤ちゃんを迎える日",
      tagline: "最初の「こんにちは」の前に",
      description:
        "もうすぐ家族になる赤ちゃんへ、出会う前から歓迎の気持ちを歌にします。",
      cta: "赤ちゃんのための歌を作る",
    },
    "mothers-day-wife-mom": {
      title: "妻であり母でもある人へ",
      tagline: "わが家の中心にいる人へ",
      description:
        "母としての美しさと日々の愛に、心を動かすバラードを贈ります。",
      cta: "パーソナル音楽ギフトを作る",
    },
    "deployment-long-distance": {
      title: "遠距離恋愛",
      tagline: "離れていても愛を近くに",
      description:
        "会えない距離があっても、そばに感じられる気持ちを歌に込めます。",
      cta: "パーソナル音楽ギフトを送る",
    },
    memorial: {
      title: "追悼・メモリアル",
      tagline: "想いが生き続けるための歌",
      description:
        "大切な人の灯りを、静かで心を支えるアコースティックな一曲に残します。",
      cta: "追悼の歌を作る",
    },
    "valentines-day": {
      title: "バレンタインデー",
      tagline: "花やチョコレートより特別に",
      description:
        "夜更けの会話から生まれたような、色あせないロマンスを歌にします。",
      cta: "ロマンチックな歌を作る",
    },
    "vow-renewal": {
      title: "誓いの更新",
      tagline: "今まで以上に、これからも",
      description: "ふたりで築いた日々を讃える歌で、もう一度約束を交わします。",
      cta: "記念日ソングを作る",
    },
    apology: {
      title: "謝罪",
      tagline: "「ごめん」が歌を必要とするとき",
      description: "心からの誠実さを、まっすぐに伝えるメロディにします。",
      cta: "謝罪の歌を作る",
    },
  },
};
