import type {
  OccasionLandingConfig,
  OccasionLandingSlug,
} from "./occasion-landing-pages";

type OccasionLocaleData = {
  name: string;
  keyword: string;
  heroTitle: string;
  heroDescription: string;
  story: string;
  styles: string;
  delivery: string;
  audience: string;
};

const spanish: Record<OccasionLandingSlug, OccasionLocaleData> = {
  anniversary: {
    name: "Aniversario",
    keyword: "canción de aniversario personalizada",
    heroTitle: "Una canción de aniversario hecha con vuestra historia",
    heroDescription:
      "Convierte vuestros nombres, recuerdos, pequeños rituales y años compartidos en una canción que solo podría hablar de vosotros. Escucha una muestra gratis antes de regalarla.",
    story:
      "Incluye cómo os conocisteis, una escena cotidiana, una frase que solo vosotros entendéis y lo que deseas para la siguiente etapa.",
    styles: "balada romántica, acústico, R&B, folk pop o jazz",
    delivery:
      "Ponla durante una cena, una renovación de votos o un vídeo de recuerdos, o envíala como sorpresa privada.",
    audience: "tu pareja, esposo, esposa, novio o novia",
  },
  birthday: {
    name: "Cumpleaños",
    keyword: "canción de cumpleaños personalizada",
    heroTitle: "Una canción de cumpleaños creada solo para esa persona",
    heroDescription:
      "Convierte su nombre, sus mejores recuerdos y tu mensaje en una canción de cumpleaños irrepetible. Escucha una muestra gratis y ajusta la letra antes de compartirla.",
    story:
      "Añade su nombre, la edad o el momento que celebra, una anécdota favorita, algo que le caracteriza y el deseo que quieres dejarle.",
    styles: "pop alegre, acústico, rock, country, R&B o música infantil",
    delivery:
      "Reprodúcela al soplar las velas, añádela a un vídeo de fotos o envíala justo al comenzar su cumpleaños.",
    audience: "un familiar, tu pareja, un amigo o un niño",
  },
  "mothers-day": {
    name: "Día de la Madre",
    keyword: "canción personalizada para el Día de la Madre",
    heroTitle: "Canción personalizada para el Día de la Madre",
    heroDescription:
      "Convierte su nombre, los recuerdos familiares y todo lo que agradeces en una canción creada para mamá. Escucha una muestra gratis y ajusta la letra antes de regalarla.",
    story:
      "Añade su nombre, sus frases, tradiciones familiares, la forma en que cuida a los demás y un recuerdo que solo vuestra familia reconocería.",
    styles:
      "acústico cálido, folk pop, country, R&B con alma o una balada suave",
    delivery:
      "Ponla durante el desayuno, añádela a un vídeo familiar o envíasela si no podéis celebrar juntos.",
    audience: "mamá, la abuela, tu esposa o una figura materna",
  },
  "fathers-day": {
    name: "Día del Padre",
    keyword: "canción personalizada para el Día del Padre",
    heroTitle: "Canción personalizada para el Día del Padre",
    heroDescription:
      "Haz una canción para papá con sus consejos, sus bromas, los recuerdos familiares y todo lo que nunca parece caber en una tarjeta.",
    story:
      "Incluye su nombre, una enseñanza, una costumbre, un recuerdo de infancia y la manera concreta en que te ha apoyado.",
    styles:
      "country, folk rock, rock clásico, acústico o pop",
    delivery:
      "Reprodúcela durante una comida familiar, acompáñala con fotografías o envíala como sorpresa privada.",
    audience: "papá, el abuelo, tu esposo o una figura paterna",
  },
  "valentines-day": {
    name: "San Valentín",
    keyword: "canción personalizada de San Valentín",
    heroTitle: "Canción personalizada de San Valentín",
    heroDescription:
      "Cuenta vuestra historia de amor con nombres, momentos cotidianos y una letra que suene como vosotros. Crea una muestra gratis antes de compartirla.",
    story:
      "Añade cómo os conocisteis, una frase privada, una rutina compartida y lo que todavía eliges de vuestra relación.",
    styles: "balada romántica, R&B, jazz, acústico o pop",
    delivery:
      "Envíala antes de la cita, úsala en un vídeo de recuerdos o acompáñala con una lámina de la letra.",
    audience: "tu pareja, esposo, esposa o la persona que amas",
  },
  congratulations: {
    name: "Felicitaciones",
    keyword: "canción personalizada de felicitación",
    heroTitle: "Canción personalizada de felicitación",
    heroDescription:
      "Celebra una graduación, un ascenso, un premio o un nuevo comienzo con una canción que recuerde el esfuerzo detrás del logro.",
    story:
      "Incluye el objetivo, las noches de trabajo, un obstáculo superado, las personas que ayudaron y el momento en que llegó la noticia.",
    styles: "pop enérgico, pop rock, música electrónica, country o hip hop",
    delivery:
      "Reprodúcela durante la celebración, añádela a un montaje o envíala justo antes del gran anuncio.",
    audience: "una persona graduada, un compañero, un amigo o un familiar",
  },
  wedding: {
    name: "Boda",
    keyword: "canción personalizada de boda",
    heroTitle: "Canción personalizada para una boda",
    heroDescription:
      "Convierte la historia de la pareja, sus votos y el futuro que imaginan en una canción original para la ceremonia o el primer baile.",
    story:
      "Añade cómo se conocieron, el momento en que supieron que era para siempre, una promesa y un detalle que los invitados reconocerán.",
    styles: "balada romántica, clásica, acústica, R&B o pop",
    delivery:
      "Úsala para la entrada, el primer baile, un vídeo sorpresa o un momento privado antes de la ceremonia.",
    audience: "tu pareja, los novios o una pareja a la que quieres homenajear",
  },
  "in-memoriam": {
    name: "En memoria",
    keyword: "canción personalizada en memoria",
    heroTitle: "Canción personalizada en memoria",
    heroDescription:
      "Honra una vida con recuerdos verdaderos, palabras serenas y una canción que la familia pueda conservar y volver a escuchar.",
    story:
      "Incluye su nombre, una escena luminosa, las cualidades que dejó en otros y una imagen que mantenga presente su recuerdo.",
    styles: "clásico, acústico, folk pop, jazz suave o canción de cuna",
    delivery:
      "Compártela en una ceremonia, un vídeo de homenaje o de forma privada con las personas más cercanas.",
    audience: "un familiar, un amigo, una pareja o una persona muy querida",
  },
  "thank-you": {
    name: "Agradecimiento",
    keyword: "canción personalizada de agradecimiento",
    heroTitle: "Canción personalizada para dar las gracias",
    heroDescription:
      "Di gracias con una historia que nombre lo que esa persona hizo, cuándo más importó y por qué nunca lo olvidarás.",
    story:
      "Añade la ayuda concreta que recibiste, el momento en que llegó, una cualidad de esa persona y lo que cambió gracias a ella.",
    styles: "acústico, folk pop, country, pop o una balada cálida",
    delivery:
      "Envíala en privado, úsala durante una despedida o acompáñala con una nota escrita a mano.",
    audience: "un amigo, profesor, mentor, compañero o familiar",
  },
  "get-well-soon": {
    name: "Que te mejores",
    keyword: "canción personalizada para desear una pronta recuperación",
    heroTitle: "Canción personalizada para desear que se mejore",
    heroDescription:
      "Envía compañía, ánimo y cariño con una canción respetuosa que se adapte a la personalidad y la situación de quien la recibe.",
    story:
      "Incluye su nombre, pequeños consuelos, recuerdos alegres, personas que están pendientes y planes para cuando se sienta mejor.",
    styles: "acústico suave, canción de cuna, folk pop, lo-fi o clásico",
    delivery:
      "Envíala con un mensaje breve, reúne voces de amigos o añádela a un vídeo tranquilo y positivo.",
    audience: "un amigo, compañero o familiar que necesita apoyo",
  },
};

const japanese: Record<OccasionLandingSlug, OccasionLocaleData> = {
  anniversary: {
    name: "記念日",
    keyword: "記念日のオリジナルソング",
    heroTitle: "ふたりの物語から作る記念日ソング",
    heroDescription:
      "名前、思い出、いつもの習慣、共に過ごした年月を、ふたりだけの一曲に。無料プレビューで歌詞を確認してから贈れます。",
    story:
      "出会い、何気ない日常、ふたりだけに通じる言葉、これから一緒に叶えたいことを入れます。",
    styles: "ロマンチックバラード、アコースティック、R&B、フォークポップ、ジャズ",
    delivery:
      "記念日の食事、誓いを新たにする場、思い出動画で流したり、個人的なサプライズとして送ったりできます。",
    audience: "恋人、夫、妻、大切なパートナー",
  },
  birthday: {
    name: "誕生日",
    keyword: "誕生日のオリジナルソング",
    heroTitle: "名前と思い出を込めた、その人だけの誕生日ソング",
    heroDescription:
      "名前、大切な思い出、伝えたい言葉を世界に一つの誕生日ソングに。無料プレビューで歌詞を整えてから贈れます。",
    story:
      "名前、年齢や節目、好きな思い出、その人らしい一面、これからへの願いを入れます。",
    styles: "明るいポップ、アコースティック、ロック、カントリー、R&B、キッズ音楽",
    delivery:
      "ろうそくを吹き消す瞬間に流したり、写真動画に加えたり、誕生日になった瞬間に送ったりできます。",
    audience: "家族、恋人、友人、子ども",
  },
  "mothers-day": {
    name: "母の日",
    keyword: "母の日のオリジナルソング",
    heroTitle: "母の日のオリジナルソング",
    heroDescription:
      "お母さんの名前、家族の思い出、感謝の気持ちを一曲に。無料プレビューを聴き、歌詞を整えてから贈れます。",
    story:
      "名前や愛称、家族の習慣、いつもの言葉、愛情の示し方、家族だけが分かる思い出を入れます。",
    styles:
      "温かいアコースティック、フォークポップ、カントリー、ソウルフルなR&B、優しいバラード",
    delivery:
      "朝食の時間に流したり、家族のスライドショーに加えたり、離れているお母さんへ送ったりできます。",
    audience: "お母さん、おばあちゃん、妻、母親のような存在",
  },
  "fathers-day": {
    name: "父の日",
    keyword: "父の日のオリジナルソング",
    heroTitle: "父の日のオリジナルソング",
    heroDescription:
      "お父さんの助言、冗談、家族の思い出、カードには収まらない感謝を、その人だけの曲にします。",
    story:
      "名前、教わったこと、いつもの習慣、子どもの頃の場面、支えてくれた具体的な出来事を入れます。",
    styles:
      "カントリー、フォークロック、クラシックロック、アコースティック、ポップ",
    delivery:
      "家族の食事で流したり、写真動画に加えたり、個人的なサプライズとして送ったりできます。",
    audience: "お父さん、おじいちゃん、夫、父親のような存在",
  },
  "valentines-day": {
    name: "バレンタインデー",
    keyword: "バレンタインのオリジナルソング",
    heroTitle: "バレンタインのオリジナルソング",
    heroDescription:
      "二人の出会い、何気ない日常、今伝えたい愛を歌詞に。無料プレビューで確認してから大切な人へ贈れます。",
    story:
      "出会ったきっかけ、二人だけの言葉、共通の習慣、今も相手を選び続ける理由を入れます。",
    styles: "ロマンチックバラード、R&B、ジャズ、アコースティック、ポップ",
    delivery:
      "デート前に送ったり、思い出動画に使ったり、印刷した歌詞と一緒に贈ったりできます。",
    audience: "恋人、夫、妻、愛する人",
  },
  congratulations: {
    name: "お祝い",
    keyword: "お祝いのオリジナルソング",
    heroTitle: "お祝いのオリジナルソング",
    heroDescription:
      "卒業、昇進、受賞、新しい出発を、結果だけでなく努力の過程まで伝わる曲で祝いましょう。",
    story:
      "目標、努力した夜、乗り越えた壁、支えた人、知らせを受けた瞬間を入れます。",
    styles: "明るいポップ、ポップロック、EDM、カントリー、ヒップホップ",
    delivery:
      "祝いの場で流したり、動画に加えたり、大きな発表の直前に送ったりできます。",
    audience: "卒業生、同僚、友人、家族",
  },
  wedding: {
    name: "結婚式",
    keyword: "結婚式のオリジナルソング",
    heroTitle: "結婚式のオリジナルソング",
    heroDescription:
      "二人の物語、誓い、思い描く未来を、式やファーストダンスで使える一曲にします。",
    story:
      "出会い、共に歩むと決めた瞬間、約束、ゲストにも伝わる二人らしい情報を入れます。",
    styles: "ロマンチックバラード、クラシック、アコースティック、R&B、ポップ",
    delivery:
      "入場、ファーストダンス、サプライズ動画、式前の二人だけの時間に使えます。",
    audience: "パートナー、新郎新婦、大切なカップル",
  },
  "in-memoriam": {
    name: "追悼",
    keyword: "追悼のオリジナルソング",
    heroTitle: "大切な人を偲ぶオリジナルソング",
    heroDescription:
      "本当の思い出と穏やかな言葉で、その人の人生を家族が残し、何度でも聴ける曲にします。",
    story:
      "名前、明るい一場面、周囲に残したもの、その人を思い出せる場所や物を入れます。",
    styles:
      "クラシック、アコースティック、フォークポップ、静かなジャズ、子守歌",
    delivery:
      "追悼式、思い出の動画、近しい人だけで共有する時間に使えます。",
    audience: "家族、友人、パートナー、かけがえのない人",
  },
  "thank-you": {
    name: "ありがとう",
    keyword: "感謝のオリジナルソング",
    heroTitle: "感謝を伝えるオリジナルソング",
    heroDescription:
      "その人がしてくれたこと、必要だった瞬間、忘れない理由を物語にして「ありがとう」を届けます。",
    story:
      "受けた助け、それが届いた時期、その人らしい長所、そこから変わったことを入れます。",
    styles:
      "アコースティック、フォークポップ、カントリー、ポップ、温かいバラード",
    delivery:
      "個人的に送ったり、送別の場で流したり、手書きのメッセージと一緒に渡したりできます。",
    audience: "友人、先生、恩師、同僚、家族",
  },
  "get-well-soon": {
    name: "お見舞い",
    keyword: "回復を願うオリジナルソング",
    heroTitle: "回復を願うオリジナルソング",
    heroDescription:
      "相手の性格や状況に合った穏やかな曲で、寄り添う気持ち、励まし、愛情を届けます。",
    story:
      "名前、小さな楽しみ、明るい思い出、気にかけている人、元気になったらしたいことを入れます。",
    styles:
      "優しいアコースティック、子守歌、フォークポップ、ローファイ、クラシック",
    delivery:
      "短いメッセージと送ったり、友人の声を集めたり、穏やかな動画に加えたりできます。",
    audience: "支えを必要としている友人、同僚、家族",
  },
};

const ui = {
  es: {
    excellent: "Excelente",
    seeExamples: "Ver ejemplos",
    whyItWorks: "Por qué funciona",
    howItWorks: "Cómo funciona",
    searchIdeas: "Ideas para tu historia",
    topicCluster: "Tema",
    promptDirection: "Dirección para la canción",
    createThisSong: "Crear esta canción",
    exampleBriefs: "Ejemplos de historias",
    tryYourBrief: "Probar mi propia historia",
    moreOccasions: "Más ocasiones",
    moreOccasionsTitle: "Crea una canción para el próximo momento importante",
    moreOccasionsDescription:
      "Explora otras ocasiones o empieza con cualquier historia y elige el estilo que mejor la acompañe.",
    birthdaySongs: "Canciones de cumpleaños",
    anniversarySongs: "Canciones de aniversario",
    songSuffix: "canciones",
  },
  ja: {
    excellent: "高評価",
    seeExamples: "例を見る",
    whyItWorks: "特別な理由",
    howItWorks: "作り方",
    searchIdeas: "物語のアイデア",
    topicCluster: "テーマ",
    promptDirection: "曲づくりの方向",
    createThisSong: "この曲を作る",
    exampleBriefs: "ストーリー例",
    tryYourBrief: "自分の物語で試す",
    moreOccasions: "ほかの用途",
    moreOccasionsTitle: "次の大切な瞬間にも、その人だけの曲を",
    moreOccasionsDescription:
      "ほかの用途を選ぶか、自由な物語から始めて合う音楽スタイルを選べます。",
    birthdaySongs: "誕生日ソング",
    anniversarySongs: "記念日ソング",
    songSuffix: "ソング",
  },
} as const;

export function localizeOccasionLandingConfig(
  base: OccasionLandingConfig,
  locale: string,
): OccasionLandingConfig {
  const language = locale === "ja" ? "ja" : "es";
  const data = language === "ja" ? japanese[base.slug] : spanish[base.slug];
  const copy = ui[language];
  const isJa = language === "ja";
  const previewText = isJa
    ? "物語から無料プレビューを作り、歌詞や音楽を確認してから完成版を選べます。"
    : "Crea una muestra gratis a partir de tu historia y revisa la letra y la música antes de elegir la versión completa.";

  return {
    ...base,
    locale: language,
    shortName: data.name,
    primaryKeyword: data.keyword,
    keywords: isJa
      ? [
          data.keyword,
          `${data.name} 曲`,
          `${data.name} プレゼント`,
          "AI オリジナルソング",
        ]
      : [
          data.keyword,
          `canción para ${data.name.toLowerCase()}`,
          `regalo de ${data.name.toLowerCase()}`,
          "generador de canciones con IA",
        ],
    metadata: {
      title: data.heroTitle,
      description: data.heroDescription,
    },
    hero: {
      ...base.hero,
      badge: isJa
        ? `${data.name}のパーソナライズ音楽ギフト`
        : `Regalo musical personalizado para ${data.name}`,
      title: data.heroTitle,
      description: data.heroDescription,
      imageAlt: isJa
        ? `${data.heroTitle}を聴く${data.audience}`
        : `${data.audience} escuchando una ${data.keyword}`,
      cardTitle: isJa
        ? `${data.audience}のためだけに作る一曲`
        : `Una canción creada para ${data.audience}`,
      cardDescription: data.story,
      cta: isJa ? `${data.name}の曲を作る` : `Crear canción para ${data.name}`,
    },
    why: {
      title: isJa
        ? `${data.keyword}が心に残る理由`
        : `Por qué una ${data.keyword} se siente diferente`,
      description: isJa
        ? "名前や思い出を歌詞と歌声に変え、特定の人と瞬間のために何度でも聴ける贈り物を作ります。"
        : "Convierte nombres y recuerdos en letra, voz y música para crear un regalo que pertenece a una persona y un momento concretos.",
      benefits: [
        {
          title: isJa ? "本当の思い出を歌詞に" : "Detalles reales en la letra",
          description: data.story,
          icon: "message",
        },
        {
          title: isJa ? "瞬間に合う音楽" : "Un estilo adecuado",
          description: isJa
            ? `${data.styles}から選ぶか、物語に合うアレンジを任せられます。`
            : `Elige entre ${data.styles} o deja que la herramienta adapte el arreglo a la historia.`,
          icon: "music",
        },
        {
          title: isJa ? "数分で無料プレビュー" : "Muestra gratis en minutos",
          description: previewText,
          icon: "clock",
        },
        {
          title: isJa ? "音源以上のギフト" : "Más que un archivo de audio",
          description: data.delivery,
          icon: "gift",
        },
      ],
    },
    how: {
      title: isJa
        ? `本当の物語から${data.keyword}へ`
        : `De una historia real a una ${data.keyword}`,
      description: isJa
        ? "名前、思い出、伝えたい言葉、雰囲気を入力すると、AIがオリジナルの歌詞、音楽、歌声に整えます。"
        : "Aporta nombres, recuerdos, mensaje y emoción. La IA los transforma en letra, música y voz originales que puedes revisar.",
      steps: [
        {
          kicker: "01",
          title: isJa ? "物語を伝える" : "Cuenta la historia",
          description: data.story,
        },
        {
          kicker: "02",
          title: isJa ? "感情と音楽を選ぶ" : "Elige la emoción",
          description: isJa
            ? `${data.styles}から選び、相手に感じてほしいことを伝えます。`
            : `Escoge entre ${data.styles} y describe la reacción que quieres provocar.`,
        },
        {
          kicker: "03",
          title: isJa ? "試聴して整える" : "Escucha y ajusta",
          description: previewText,
        },
        {
          kicker: "04",
          title: isJa ? "大切な瞬間に届ける" : "Comparte el momento",
          description: data.delivery,
        },
      ],
    },
    moments: {
      title: isJa
        ? `${data.audience}へ贈る${data.name}の曲`
        : `Canciones de ${data.name} para ${data.audience}`,
      description: isJa
        ? "相手との関係や渡す場面に合わせて、物語と曲の雰囲気を変えられます。"
        : "Adapta la historia y la emoción a vuestra relación y a la forma en que quieres entregar el regalo.",
      items: [
        {
          title: isJa ? "一人から贈る" : "De una persona",
          description: data.story,
          icon: "heart",
        },
        {
          title: isJa ? "家族や友人みんなから" : "De toda la familia o el grupo",
          description: isJa
            ? "複数の人から短い思い出や言葉を集め、一つのサビにまとめます。"
            : "Reúne recuerdos y mensajes breves de varias personas y únelos en un mismo estribillo.",
          icon: "celebration",
        },
        {
          title: isJa ? "離れていても届ける" : "Para enviar a distancia",
          description: data.delivery,
          icon: "gift",
        },
      ],
    },
    topics: {
      title: isJa
        ? `${data.keyword}に入れたい内容`
        : `Ideas para una ${data.keyword}`,
      description: isJa
        ? "曲の中心を一つ選び、具体的な場面と言葉を加えると自然な歌詞になります。"
        : "Elige un centro emocional y añade escenas concretas para obtener una letra natural.",
      items: [
        {
          title: isJa ? "一番大切な思い出" : "El recuerdo principal",
          description: data.story,
          icon: "heart",
          keywords: isJa
            ? ["思い出", "名前", "場所"]
            : ["recuerdo", "nombre", "lugar"],
          prompt: isJa
            ? "最初に浮かぶ一場面と、それが今も大切な理由を伝えます。"
            : "Describe una escena clara y explica por qué sigue siendo importante.",
        },
        {
          title: isJa ? "感謝とメッセージ" : "Gratitud y mensaje",
          description: isJa
            ? "普段は言えない気持ちを、簡単で自分らしい言葉にします。"
            : "Expresa con palabras sencillas lo que no sueles decir en voz alta.",
          icon: "message",
          keywords: isJa
            ? ["感謝", "メッセージ", "約束"]
            : ["gratitud", "mensaje", "promesa"],
          prompt: isJa
            ? "曲を聴き終えた相手に残したい一文をサビにします。"
            : "Convierte en estribillo la frase que quieres que recuerde.",
        },
        {
          title: isJa ? "その人らしい日常" : "Los detalles cotidianos",
          description: isJa
            ? "愛称、習慣、冗談など、小さな情報が歌を特別にします。"
            : "Un apodo, una costumbre o una broma hacen que la canción sea irrepetible.",
          icon: "sparkles",
          keywords: isJa
            ? ["愛称", "習慣", "二人だけの言葉"]
            : ["apodo", "costumbre", "frase privada"],
          prompt: isJa
            ? "相手がすぐ自分のことだと分かる情報を二つ選びます。"
            : "Elige dos detalles que la persona reconocerá inmediatamente.",
        },
        {
          title: isJa ? "渡す瞬間" : "La forma de entregarla",
          description: data.delivery,
          icon: "gift",
          keywords: isJa
            ? ["動画", "共有", "歌詞アート"]
            : ["vídeo", "enlace", "arte con letras"],
          prompt: isJa
            ? "一人で聴くか、みんなで祝うかに合わせて曲の雰囲気を決めます。"
            : "Ajusta el tono según vaya a escucharla en privado o durante una celebración.",
        },
      ],
    },
    examples: {
      title: isJa ? `${data.name}のストーリー例` : `Ejemplos para ${data.name}`,
      description: isJa
        ? "以下の型を、自分の名前、思い出、言葉に置き換えて使えます。"
        : "Usa estas estructuras como punto de partida y sustitúyelas por tus propios nombres y recuerdos.",
      items: [
        {
          label: isJa ? "温かい曲" : "Emotiva",
          title: isJa ? "一つの思い出から始める" : "Una escena que lo explica todo",
          text: data.story,
        },
        {
          label: isJa ? "みんなから" : "De un grupo",
          title: isJa ? "家族や友人の声を一つに" : "Varias voces, un solo mensaje",
          text: isJa
            ? "一人ずつ短い思い出を集め、共通の感謝や願いをサビにします。"
            : "Cada persona aporta un recuerdo breve y el estribillo reúne el mensaje compartido.",
        },
        {
          label: isJa ? "サプライズ" : "Sorpresa",
          title: isJa ? "渡す瞬間まで秘密にする" : "Una entrega inesperada",
          text: data.delivery,
        },
      ],
    },
    testimonials: {
      title: isJa ? "曲を贈った人の声" : "Historias de quienes regalaron una canción",
      description: isJa
        ? "本当の思い出を使うと、短い曲でも相手に深く伝わります。"
        : "Cuando la canción utiliza recuerdos reales, incluso un detalle pequeño puede emocionar.",
      items: [
        {
          quote: isJa
            ? "最初の一行で自分のことだと分かり、最後まで何度も聴いてくれました。"
            : "Reconoció la historia desde la primera línea y volvió a escucharla varias veces.",
          author: isJa ? "確認済みユーザー" : "Usuario verificado",
          badge: data.name,
        },
        {
          quote: isJa
            ? "遠く離れていても、きちんと気持ちを届けられる贈り物になりました。"
            : "Aunque estábamos lejos, fue una forma muy cercana de acompañar el momento.",
          author: isJa ? "確認済みユーザー" : "Usuario verificado",
          badge: data.name,
        },
        {
          quote: isJa
            ? "プレビューで歌詞を直せたので、私たちらしい言葉にできました。"
            : "Poder revisar la muestra hizo que las palabras sonaran realmente nuestras.",
          author: isJa ? "確認済みユーザー" : "Usuario verificado",
          badge: data.name,
        },
      ],
    },
    faq: {
      title: isJa
        ? `${data.name}のオリジナル曲について`
        : `Preguntas sobre canciones de ${data.name}`,
      description: isJa
        ? "作り始める前に、内容、試聴、修正、渡し方を確認できます。"
        : "Resuelve dudas sobre la historia, la muestra, los ajustes y la entrega.",
      ctaTitle: isJa ? "大切な人の物語を曲にしませんか？" : "¿Quieres convertir su historia en canción?",
      ctaDescription: isJa
        ? "無料プレビューを作り、歌詞と音楽を確認してから完成版を選べます。"
        : "Crea una muestra gratis y revisa la letra y la música antes de elegir la versión completa.",
      items: [
        {
          question: isJa
            ? `${data.keyword}とは何ですか？`
            : `¿Qué es una ${data.keyword}?`,
          answer: isJa
            ? `特定の${data.audience}の名前、思い出、伝えたい言葉から作るオリジナル曲です。`
            : `Es una canción original creada con nombres, recuerdos y mensajes para ${data.audience}.`,
        },
        {
          question: isJa ? "音楽経験がなくても作れますか？" : "¿Necesito saber música?",
          answer: isJa
            ? "必要ありません。普段の言葉で物語を書き、雰囲気を選ぶだけで始められます。"
            : "No. Cuenta la historia con palabras normales y elige la emoción y el estilo.",
        },
        {
          question: isJa ? "無料で試聴できますか？" : "¿Puedo escucharla gratis?",
          answer: previewText,
        },
        {
          question: isJa ? "歌詞を修正できますか？" : "¿Puedo cambiar la letra?",
          answer: isJa
            ? "はい。名前、表現、雰囲気を確認し、完成版を選ぶ前に調整できます。"
            : "Sí. Revisa nombres, expresiones y tono antes de elegir la versión final.",
        },
        {
          question: isJa ? "どんな情報を入れるべきですか？" : "¿Qué detalles debo incluir?",
          answer: data.story,
        },
        {
          question: isJa ? "どのように贈れますか？" : "¿Cómo puedo entregarla?",
          answer: data.delivery,
        },
      ],
    },
    ui: {
      ...copy,
      moments: isJa ? `${data.name}の場面` : `Momentos de ${data.name}`,
    },
  };
}
