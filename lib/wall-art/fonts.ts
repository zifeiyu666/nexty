export type WallArtFont = {
  label: string;
  value: string;
  previewFamily: string;
};

export type WallArtFontFile = readonly [
  family: string,
  src: string,
  weight: string,
];

export const userRequestedWallArtFontLabels = [
  "Lakki Reddy",
  "Cherry Swash",
  "Emilys Candy",
  "Fredericka the Great",
  "Gravitas One",
  "Bodoni Moda SC",
  "Oranienbaum",
  "Bodoni Moda",
  "DM Serif Text",
  "Caveat",
] as const;

export const wallArtFonts: WallArtFont[] = [
  {
    label: "Lakki Reddy",
    value: '"Lakki Reddy", serif',
    previewFamily: "Lakki Reddy",
  },
  {
    label: "Cherry Swash",
    value: '"Cherry Swash", serif',
    previewFamily: "Cherry Swash",
  },
  {
    label: "Emilys Candy",
    value: '"Emilys Candy", serif',
    previewFamily: "Emilys Candy",
  },
  {
    label: "Fredericka the Great",
    value: '"Fredericka the Great", serif',
    previewFamily: "Fredericka the Great",
  },
  {
    label: "Gravitas One",
    value: '"Gravitas One", serif',
    previewFamily: "Gravitas One",
  },
  {
    label: "Bodoni Moda SC",
    value: '"Bodoni Moda SC", serif',
    previewFamily: "Bodoni Moda SC",
  },
  {
    label: "Oranienbaum",
    value: "Oranienbaum, serif",
    previewFamily: "Oranienbaum",
  },
  {
    label: "Bodoni Moda",
    value: '"Bodoni Moda", serif',
    previewFamily: "Bodoni Moda",
  },
  {
    label: "DM Serif Text",
    value: '"DM Serif Text", serif',
    previewFamily: "DM Serif Text",
  },
  { label: "Caveat", value: "Caveat, cursive", previewFamily: "Caveat" },
  {
    label: "Parisienne",
    value: "Parisienne, cursive",
    previewFamily: "Parisienne",
  },
  {
    label: "Great Vibes",
    value: '"Great Vibes", cursive',
    previewFamily: "Great Vibes",
  },
  { label: "Savate", value: "Savate, serif", previewFamily: "Savate" },
  { label: "Limelight", value: "Limelight, serif", previewFamily: "Limelight" },
  {
    label: "Sigmar One",
    value: '"Sigmar One", cursive',
    previewFamily: "Sigmar One",
  },
  {
    label: "Mountains of Christmas",
    value: '"Mountains of Christmas", cursive',
    previewFamily: "Mountains of Christmas",
  },
  {
    label: "Berkshire Swash",
    value: '"Berkshire Swash", cursive',
    previewFamily: "Berkshire Swash",
  },
  {
    label: "Shadows Into Light",
    value: '"Shadows Into Light", cursive',
    previewFamily: "Shadows Into Light",
  },
  {
    label: "UnifrakturMaguntia",
    value: "UnifrakturMaguntia, fantasy",
    previewFamily: "UnifrakturMaguntia",
  },
  {
    label: "Montserrat",
    value: "Montserrat, ui-sans-serif, system-ui",
    previewFamily: "Montserrat",
  },
  { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia" },
  {
    label: "Courier Prime",
    value: '"Courier New", monospace',
    previewFamily: "Courier New",
  },
  {
    label: "Trebuchet",
    value: '"Trebuchet MS", ui-sans-serif, system-ui',
    previewFamily: "Trebuchet MS",
  },
  { label: "Impact", value: "Impact, fantasy", previewFamily: "Impact" },
];

export const wallArtFontFiles = [
  ["Lakki Reddy", "/fonts/wallart/lakki-reddy-400.ttf", "400"],
  ["Cherry Swash", "/fonts/wallart/cherry-swash-400.ttf", "400"],
  ["Cherry Swash", "/fonts/wallart/cherry-swash-700.ttf", "700"],
  ["Emilys Candy", "/fonts/wallart/emilys-candy-400.ttf", "400"],
  [
    "Fredericka the Great",
    "/fonts/wallart/fredericka-the-great-400.ttf",
    "400",
  ],
  ["Gravitas One", "/fonts/wallart/gravitas-one-400.ttf", "400"],
  ["Bodoni Moda SC", "/fonts/wallart/bodoni-moda-sc-variable.ttf", "400 900"],
  ["Oranienbaum", "/fonts/wallart/oranienbaum-400.ttf", "400"],
  ["Bodoni Moda", "/fonts/wallart/bodoni-moda-variable.ttf", "400 900"],
  ["DM Serif Text", "/fonts/wallart/dm-serif-text-400.ttf", "400"],
  ["Caveat", "/fonts/wallart/caveat-variable.ttf", "400 700"],
  ["Parisienne", "/fonts/wallart/parisienne-400.ttf", "400"],
  ["Great Vibes", "/fonts/wallart/great-vibes-400.ttf", "400"],
  ["Savate", "/fonts/wallart/savate-400.ttf", "400"],
  ["Limelight", "/fonts/wallart/limelight-400.ttf", "400"],
  ["Sigmar One", "/fonts/wallart/sigmar-one-400.ttf", "400"],
  [
    "Mountains of Christmas",
    "/fonts/wallart/mountains-of-christmas-400.ttf",
    "400",
  ],
  [
    "Mountains of Christmas",
    "/fonts/wallart/mountains-of-christmas-700.ttf",
    "700",
  ],
  ["Berkshire Swash", "/fonts/wallart/berkshire-swash-400.ttf", "400"],
  ["Shadows Into Light", "/fonts/wallart/shadows-into-light-400.ttf", "400"],
  ["UnifrakturMaguntia", "/fonts/wallart/unifraktur-maguntia-400.ttf", "400"],
] as const satisfies readonly WallArtFontFile[];
