import type { GeneratorType } from "@/lib/types";

const PALETTES = [
  {
    bg: ["#efe3cf", "#f8f4ec"],
    skin: "#d8a06a",
    hair: "#202331",
    cloth: "#26324f",
    accent: "#6d5bd0",
    metal: "#b8a68c"
  },
  {
    bg: ["#e9ddcc", "#f7f2ea"],
    skin: "#e4b180",
    hair: "#d6c28a",
    cloth: "#315141",
    accent: "#b25363",
    metal: "#c6b79f"
  },
  {
    bg: ["#e1d5c4", "#f9f5ef"],
    skin: "#c89269",
    hair: "#795238",
    cloth: "#4b332d",
    accent: "#5179b8",
    metal: "#b8b0aa"
  },
  {
    bg: ["#e9e0d3", "#faf6ef"],
    skin: "#d2a17c",
    hair: "#abb6c1",
    cloth: "#28384d",
    accent: "#4f8f77",
    metal: "#c5c8c8"
  }
];

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function npcMarkup(seed: number, palette: (typeof PALETTES)[number]) {
  const hairLong = seed % 3 === 0;
  const hasArmor = seed % 2 === 0;
  const hair =
    hairLong
      ? `<path d="M357 185c-75 7-117 63-111 146 4 58 17 111 48 163 33-58 34-108 26-160 24 31 63 46 104 37-15 38-16 78 12 125 45-86 59-190 22-250-22-36-58-62-101-61Z" fill="${palette.hair}" opacity=".95"/>`
      : `<path d="M253 254c3-83 58-134 132-122 52 9 90 49 99 103-48-39-121-43-174-9-24 15-42 34-57 28Z" fill="${palette.hair}" opacity=".96"/>`;
  const armor =
    hasArmor
      ? `<path d="M202 610c31-111 91-166 160-166s133 55 166 166H202Z" fill="${palette.cloth}"/><path d="M244 598c18-57 51-92 96-105l22 82 22-82c48 13 81 48 101 105H244Z" fill="${palette.metal}" opacity=".72"/><path d="M256 524h212" stroke="#ffffff" stroke-opacity=".28" stroke-width="12" stroke-linecap="round"/>`
      : `<path d="M205 610c30-110 89-166 157-166s131 56 164 166H205Z" fill="${palette.cloth}"/><path d="M306 472c30 43 74 43 111 0l16 138H286l20-138Z" fill="${palette.accent}" opacity=".85"/>`;

  return `
    <g transform="translate(118 8)">
      <path d="M173 624c34-158 119-248 197-248s169 90 203 248H173Z" fill="#2c3142" opacity=".16"/>
      ${hair}
      <path d="M286 277c5-67 50-109 104-105 59 4 99 54 93 118-6 70-54 119-106 116-52-3-96-57-91-129Z" fill="${palette.skin}"/>
      <path d="M274 285c23-42 49-64 90-76 33 35 73 54 120 57-13-74-58-118-122-118-65 0-115 48-124 116 13 6 24 13 36 21Z" fill="${palette.hair}"/>
      <path d="M286 334c25 26 58 40 97 38 43-2 76-20 99-52-10 56-52 95-103 95-46 0-84-33-93-81Z" fill="#1d2637" opacity=".08"/>
      <circle cx="346" cy="304" r="8" fill="#202331"/>
      <circle cx="424" cy="304" r="8" fill="#202331"/>
      <path d="M356 357c22 15 45 15 68 0" fill="none" stroke="#6e4d3d" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      <path d="M337 413c28 25 72 25 104 0v55c-32 36-76 34-104 0v-55Z" fill="${palette.skin}"/>
      ${armor}
      <path d="M174 572c42-61 90-91 143-90l-27 128H174Z" fill="${palette.accent}" opacity=".72"/>
      <path d="M551 572c-43-61-92-91-145-90l28 128h117Z" fill="${palette.accent}" opacity=".72"/>
      <path d="M535 170 630 70" stroke="${palette.metal}" stroke-width="13" stroke-linecap="round"/>
      <path d="M615 62 652 38" stroke="#d9d1c2" stroke-width="9" stroke-linecap="round"/>
    </g>
  `;
}

function monsterMarkup(seed: number, palette: (typeof PALETTES)[number]) {
  const winged = seed % 2 === 0;
  const serpentine = seed % 3 === 0;
  const wings = winged
    ? `<path d="M218 305 63 210l69 154-84 122 169-41" fill="${palette.cloth}" opacity=".78"/><path d="M742 305 897 210l-69 154 84 122-169-41" fill="${palette.cloth}" opacity=".78"/>`
    : `<path d="M250 400c-88 28-133 89-133 158 83-32 141-69 174-112" fill="${palette.cloth}" opacity=".75"/><path d="M710 400c88 28 133 89 133 158-83-32-141-69-174-112" fill="${palette.cloth}" opacity=".75"/>`;
  const body = serpentine
    ? `<path d="M398 563c-6-97 43-151 94-204 42-44 52-93 15-134 111 47 143 157 77 237-38 47-45 82-18 121" fill="${palette.accent}"/><path d="M339 581c62-37 129-40 204-3" fill="none" stroke="${palette.cloth}" stroke-width="34" stroke-linecap="round"/>`
    : `<path d="M480 210 612 374 565 594H395L348 374 480 210Z" fill="${palette.accent}"/><path d="M402 576h156l-30-189h-96l-30 189Z" fill="${palette.cloth}" opacity=".42"/>`;

  return `
    <g>
      ${wings}
      ${body}
      <path d="M404 243 342 117l113 62 25-104 25 104 113-62-62 126" fill="${palette.cloth}"/>
      <path d="M372 235c21-73 75-113 108-113s87 40 108 113c20 70-23 145-108 145s-128-75-108-145Z" fill="${palette.cloth}"/>
      <path d="M404 255c28-42 53-63 76-63s48 21 76 63c-29 38-54 58-76 58s-47-20-76-58Z" fill="${palette.accent}"/>
      <circle cx="442" cy="245" r="13" fill="#fff7d6"/>
      <circle cx="518" cy="245" r="13" fill="#fff7d6"/>
      <path d="M446 318c20 12 47 12 68 0" stroke="#fff7d6" stroke-width="8" stroke-linecap="round" opacity=".72"/>
      <path d="M353 430 266 535M607 430l87 105" stroke="${palette.cloth}" stroke-width="27" stroke-linecap="round"/>
      <path d="M330 589h89M541 589h89" stroke="${palette.cloth}" stroke-width="30" stroke-linecap="round"/>
      <path d="M296 512 247 575M664 512l49 63" stroke="${palette.metal}" stroke-width="11" stroke-linecap="round"/>
    </g>
  `;
}

export function createLocalFallbackImage({
  kind,
  label,
  seed = ""
}: {
  kind: GeneratorType;
  label: string;
  seed?: string;
}) {
  const hash = stableHash(`${kind}:${seed}:${label}`);
  const palette = PALETTES[hash % PALETTES.length];
  const subject =
    kind === "npc" ? npcMarkup(hash, palette) : monsterMarkup(hash, palette);
  const grainId = `grain${hash}`;
  const glowId = `glow${hash}`;
  const bgId = `bg${hash}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <defs>
        <linearGradient id="${bgId}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${palette.bg[0]}"/>
          <stop offset=".55" stop-color="${palette.bg[1]}"/>
          <stop offset="1" stop-color="#d8c9b4"/>
        </linearGradient>
        <radialGradient id="${glowId}" cx="50%" cy="38%" r="52%">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".7"/>
          <stop offset=".55" stop-color="${palette.accent}" stop-opacity=".16"/>
          <stop offset="1" stop-color="#6b4f33" stop-opacity=".18"/>
        </radialGradient>
        <filter id="${grainId}">
          <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .05"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="960" height="720" fill="url(#${bgId})"/>
      <rect width="960" height="720" fill="url(#${glowId})"/>
      <rect width="960" height="720" filter="url(#${grainId})" opacity=".5"/>
      <ellipse cx="480" cy="654" rx="255" ry="45" fill="#2b2118" opacity=".16"/>
      ${subject}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
