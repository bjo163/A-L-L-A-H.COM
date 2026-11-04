import * as React from 'react';
import { cn } from '../lib/utils';
import { getSkinStyle, resolveSkinId, skinRegistry, type SkinId } from '../skins/registry';

export interface WorldArtworkProps extends React.SVGProps<SVGSVGElement> {
  skin: SkinId;
}

export function WorldArtwork({ skin, className, ...props }: WorldArtworkProps) {
  const id = React.useId().replace(/:/g, '');
  const palette = artworkPalette[skin];

  return (
    <svg
      {...props}
      className={cn('mw-world-artwork', className)}
      data-world-artwork={skin}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-field`} x1="140" y1="30" x2="1450" y2="880" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.fieldStart} />
          <stop offset="1" stopColor={palette.fieldEnd} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0" cy="0" r="1" gradientTransform="matrix(0 440 -660 0 1090 310)" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.light} stopOpacity=".5" />
          <stop offset="1" stopColor={palette.light} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-reflect`} x1="800" y1="470" x2="800" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.light} stopOpacity=".52" />
          <stop offset="1" stopColor={palette.light} stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}-grid`} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke={palette.line} strokeOpacity=".22" />
        </pattern>
        <pattern id={`${id}-halftone`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" fill={palette.ink} fillOpacity=".45" />
        </pattern>
        <pattern id={`${id}-grain`} width="57" height="57" patternUnits="userSpaceOnUse">
          <path d="M7 12h1m27 6h1M16 43h1m31-9h1M31 51h1" stroke={palette.paper} strokeOpacity=".7" strokeWidth="2" />
        </pattern>
        <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <clipPath id={`${id}-frame`}>
          <path d="M0 0h1600v900H0z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-frame)`}>
        <rect width="1600" height="900" fill={`url(#${id}-field)`} />
        <rect width="1600" height="900" fill={`url(#${id}-light)`} />
        {artworkLayers[skin](id, palette)}
        <rect width="1600" height="900" fill={`url(#${id}-grain)`} opacity=".035" />
      </g>
    </svg>
  );
}

interface ArtworkPalette {
  fieldStart: string;
  fieldEnd: string;
  light: string;
  line: string;
  ink: string;
  accent: string;
  paper: string;
}

const artworkPalette: Record<SkinId, ArtworkPalette> = {
  'imperium-lumen': {
    fieldStart: '#171713',
    fieldEnd: '#080908',
    light: '#d3b77b',
    line: '#f4e5bb',
    ink: '#090a09',
    accent: '#e5cc93',
    paper: '#f4f1e8',
  },
  'lunar-chronicles': {
    fieldStart: '#202e49',
    fieldEnd: '#090f1b',
    light: '#aebcdd',
    line: '#dbe6f5',
    ink: '#080d18',
    accent: '#d0dced',
    paper: '#f1f5f8',
  },
  rocksoul: {
    fieldStart: '#27282a',
    fieldEnd: '#090a0b',
    light: '#bd4144',
    line: '#d3d0c9',
    ink: '#0a0a0b',
    accent: '#d44e52',
    paper: '#f1eee8',
  },
  'nexus-paradox': {
    fieldStart: '#12343a',
    fieldEnd: '#071316',
    light: '#55c4d2',
    line: '#b8f1ef',
    ink: '#071114',
    accent: '#70e0e5',
    paper: '#eff9fa',
  },
  'riot-anarchy': {
    fieldStart: '#f2ead8',
    fieldEnd: '#cfc4aa',
    light: '#a5282d',
    line: '#171715',
    ink: '#171715',
    accent: '#0759a8',
    paper: '#fff8ea',
  },
  mycelium: {
    fieldStart: '#254d3d',
    fieldEnd: '#081712',
    light: '#9dc8ad',
    line: '#dce8c5',
    ink: '#0a1712',
    accent: '#d5dfad',
    paper: '#f1f4e8',
  },
};

const artworkLayers: Record<SkinId, (id: string, palette: ArtworkPalette) => React.ReactNode> = {
  'imperium-lumen': (id, p) => (
    <>
      <path d="M0 660h1600v240H0z" fill="#0b0c0a" />
      <path d="M90 660 800 115l710 545H90Z" fill="#d3b77b" fillOpacity=".07" />
      <path d="M236 660 800 236l564 424" stroke={p.accent} strokeOpacity=".62" strokeWidth="2" />
      <path d="M395 660 800 356l405 304" stroke={p.line} strokeOpacity=".38" strokeWidth="2" />
      <path d="M555 660 800 476l245 184" stroke={p.line} strokeOpacity=".24" strokeWidth="2" />
      <path d="M676 660V430l124-124 124 124v230" fill="#171814" stroke={p.accent} strokeWidth="3" />
      <path d="M716 660V446l84-82 84 82v214" fill="#090a09" stroke={p.paper} strokeOpacity=".66" strokeWidth="2" />
      <path d="M744 660V464l56-55 56 55v196" fill="#d3b77b" fillOpacity=".12" />
      <path d="M800 118v250m0 292v240M90 660h1420" stroke={p.line} strokeOpacity=".34" />
      <path d="M0 730h1600M0 804h1600M0 860h1600" stroke={p.line} strokeOpacity=".13" />
      <path d="M320 660 575 900m705-240-255 240M548 660 690 900m512-240-142 240" stroke={p.accent} strokeOpacity=".2" />
      <circle cx="800" cy="116" r="7" fill={p.paper} />
      <circle cx="800" cy="116" r="28" fill={p.light} fillOpacity=".45" filter={`url(#${id}-soft)`} />
      <path d="M0 520h300v380H0zm1300-70h300v450h-300z" fill="#090a09" fillOpacity=".62" />
      <path d="M300 520h64v380h-64m872-450h64v450h-64" stroke={p.accent} strokeOpacity=".3" />
    </>
  ),
  'lunar-chronicles': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-grid)`} opacity=".7" />
      <circle cx="1070" cy="416" r="285" fill="#b9c9e6" fillOpacity=".08" stroke={p.line} strokeOpacity=".32" />
      <circle cx="1070" cy="416" r="238" stroke={p.line} strokeOpacity=".46" strokeWidth="2" />
      <circle cx="1070" cy="416" r="190" stroke={p.line} strokeOpacity=".22" />
      <circle cx="1070" cy="416" r="144" fill="#c6d3e8" fillOpacity=".86" />
      <circle cx="1142" cy="374" r="144" fill="#101725" />
      <path d="M768 416h604M1070 114v604M856 202l428 428m0-428L856 630" stroke={p.line} strokeOpacity=".18" />
      <circle cx="1070" cy="416" r="260" stroke={p.accent} strokeOpacity=".7" strokeDasharray="2 12" strokeWidth="2" />
      <ellipse cx="1070" cy="416" rx="415" ry="170" transform="rotate(-23 1070 416)" stroke={p.accent} strokeOpacity=".52" strokeWidth="2" />
      <ellipse cx="1070" cy="416" rx="520" ry="220" transform="rotate(-23 1070 416)" stroke={p.line} strokeOpacity=".18" />
      <path d="M112 202 394 286l180-104 206 174-162 185-316 78" stroke={p.line} strokeOpacity=".55" strokeWidth="2" />
      <g fill={p.paper}>
        <circle cx="112" cy="202" r="7" /><circle cx="394" cy="286" r="6" /><circle cx="574" cy="182" r="7" />
        <circle cx="780" cy="356" r="8" /><circle cx="618" cy="541" r="6" /><circle cx="302" cy="619" r="7" />
      </g>
      <path d="M148 762h394M148 786h252M148 810h332" stroke={p.line} strokeOpacity=".38" strokeWidth="2" />
      <circle className="mw-world-artwork__orbit" cx="1482" cy="242" r="9" fill={p.paper} />
    </>
  ),
  rocksoul: (id, p) => (
    <>
      <path d="M0 580h1600v320H0z" fill="#090a0b" />
      <path d="M0 606 800 552l800 54v294H0z" fill="#191a1c" />
      <path d="M0 606 800 552l800 54v294H0z" fill={`url(#${id}-reflect)`} opacity=".38" />
      <path d="M0 606h1600M0 688h1600M0 798h1600" stroke={p.paper} strokeOpacity=".14" />
      <path d="M126 606V242h254v364m30 0V320h188v286m576 0V264h302v342m-640 0V384h180v222" fill="#111214" stroke="#424448" strokeOpacity=".68" strokeWidth="2" />
      <path d="M198 296h68v9h-68zm104 0h42v9h-42zm-110 96h96v8h-96zm102 54h48v8h-48zm936-174h110v9h-110zm-4 86h64v8h-64z" fill={p.accent} fillOpacity=".56" />
      <path d="M802 360v248m-18-248h36v74h-36z" stroke={p.paper} strokeOpacity=".72" strokeWidth="3" />
      <circle cx="800" cy="346" r="15" fill={p.accent} fillOpacity=".7" />
      <path d="M804 620c-22 0-38 24-38 56v78h76v-78c0-32-16-56-38-56Z" fill="#090a0b" />
      <path d="M774 628c8-26 20-40 30-40s22 14 30 40l-9 10h-42z" fill="#9e2931" />
      <path d="M774 754h60m-53 16h46m-40 16h34" stroke={p.accent} strokeOpacity=".56" strokeWidth="3" />
      <path d="m450 606 200 294m488-294-140 294m-678-294 452 294m620-294-440 294" stroke={p.accent} strokeOpacity=".18" strokeWidth="3" />
      <path className="mw-world-artwork__rain" d="M190 82 164 190m180-132-24 112m208-86-27 119m226-185-24 112m234-82-23 108m210-136-25 112m230-72-24 109M82 370 58 474m500-64-23 106m984-212-24 108" stroke={p.paper} strokeOpacity=".23" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 606h1600" stroke={p.paper} strokeOpacity=".42" strokeWidth="2" />
    </>
  ),
  'nexus-paradox': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-grid)`} />
      <path d="M242 154h1116l132 122v350l-132 122H242L110 626V276l132-122Z" fill="#0b1b1f" fillOpacity=".78" stroke={p.accent} strokeOpacity=".76" strokeWidth="3" />
      <path d="M318 220h964l86 80v286l-86 80H318l-86-80V300l86-80Z" stroke={p.line} strokeOpacity=".36" strokeWidth="2" />
      <path d="M800 290 938 450 800 610 662 450 800 290Z" fill="#55c4d2" fillOpacity=".08" stroke={p.accent} strokeWidth="3" />
      <circle cx="800" cy="450" r="92" stroke={p.line} strokeOpacity=".7" strokeWidth="2" />
      <circle cx="800" cy="450" r="36" fill={p.accent} fillOpacity=".78" />
      <circle className="mw-world-artwork__scan" cx="800" cy="450" r="174" stroke={p.accent} strokeOpacity=".44" strokeDasharray="18 10" strokeWidth="2" />
      <path d="M800 206v488m-244-244h488m-172-172 344 344m0-344L700 622" stroke={p.line} strokeOpacity=".22" />
      <path d="M168 340h270m-270 28h186m778 222h290m-290 28h220" stroke={p.line} strokeOpacity=".54" strokeWidth="3" />
      <path d="M128 664h350v106H128zm994-534h350v106h-350z" fill="#11272c" stroke={p.accent} strokeOpacity=".58" />
      <path d="M160 692h180m-180 22h260m-260 22h126m886-548h180m-180 22h260m-260 22h126" stroke={p.line} strokeOpacity=".4" strokeWidth="3" />
      <path d="M800 152v48m0 500v48m-586-298h48m1076 0h48" stroke={p.accent} strokeWidth="5" />
    </>
  ),
  'riot-anarchy': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-halftone)`} opacity=".62" />
      <path d="M84 110h810v510H84z" fill={p.ink} transform="rotate(-4 84 110)" />
      <path d="M720 138h704v600H720z" fill="#a5282d" transform="rotate(5 720 138)" />
      <path d="M150 166h654v382H150z" fill="#ede5d3" stroke={p.ink} strokeWidth="12" />
      <path d="M184 206h568v284H184z" fill="#161715" />
      <path d="m900 90 386 94-86 432-386-94z" fill={p.accent} />
      <path d="M111 670h468v148H111zm642-56h386v190H753zm489 42h258v204h-258z" fill={p.paper} stroke={p.ink} strokeWidth="10" />
      <path d="m110 686 170-18 134 28 154-14v100l-458 5z" fill="#c7bca4" />
      <path d="M786 632h318v20H786zm0 38h228v20H786zm0 38h278v20H786zm526-28h182v16h-182zm0 35h128v16h-128z" fill={p.ink} />
      <path d="m1170 154 44-86 43 90 92 2-69 56 26 86-92-51-74 55 21-96-67-58z" fill="#e7d8b8" stroke={p.ink} strokeWidth="8" />
      <path d="M1398 502 1514 470l35 95-120 44z" fill={p.ink} />
      <path d="M1274 260h205v18h-205zm-24 35h210v14h-210z" stroke={p.paper} strokeWidth="8" />
      <path d="M0 850h1600" stroke={p.ink} strokeWidth="14" />
    </>
  ),
  mycelium: (id, p) => (
    <>
      <ellipse cx="858" cy="472" rx="570" ry="330" fill={p.light} fillOpacity=".08" filter={`url(#${id}-blur)`} />
      <path d="M218 752C370 690 410 538 566 554c118 12 111 156 264 122 138-31 93-194 247-228 109-25 160 42 307-146" stroke={p.accent} strokeOpacity=".86" strokeWidth="7" strokeLinecap="round" />
      <path d="M566 554c-72-108-92-184-64-261 28-77 107-87 140-150m188 533c-12-114-7-203 52-257 65-60 144-35 206-99m-258 356c-82 89-92 173-69 250m-195-372c-95 34-167 80-223 178m664-174c108 73 191 87 285 38" stroke={p.line} strokeOpacity=".58" strokeWidth="4" strokeLinecap="round" />
      <path d="M360 664c-40-72-24-129 25-151 50-22 100 8 117 44m232-390c-35 61-28 109 26 138m179 534c28-54 72-79 128-61m170-394c22-66 70-89 126-75" stroke={p.accent} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
      <g fill={p.paper}>
        <circle cx="218" cy="752" r="13" /><circle cx="566" cy="554" r="12" /><circle cx="830" cy="676" r="14" />
        <circle cx="1077" cy="448" r="11" /><circle cx="1384" cy="302" r="13" /><circle cx="642" cy="143" r="9" />
        <circle cx="1274" cy="520" r="8" /><circle cx="418" cy="513" r="8" />
      </g>
      <g fill={p.accent}>
        <circle cx="360" cy="664" r="6" /><circle cx="734" cy="293" r="7" /><circle cx="950" cy="507" r="6" />
        <circle cx="1128" cy="316" r="7" /><circle cx="760" cy="818" r="6" />
      </g>
      <path d="M106 790c233-82 405-7 610 34 248 50 434-87 778-64" stroke={p.line} strokeOpacity=".12" strokeWidth="2" />
      <path className="mw-world-artwork__growth" d="M218 752C370 690 410 538 566 554c118 12 111 156 264 122 138-31 93-194 247-228 109-25 160 42 307-146" stroke={p.paper} strokeOpacity=".35" strokeWidth="2" strokeDasharray="1 18" />
    </>
  ),
};

export interface SkinScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  skin: SkinId;
}

export function SkinScope({ skin, className, children, ...props }: SkinScopeProps) {
  const skinId = resolveSkinId(skin);

  return (
    <div
      {...props}
      className={cn('mw-skin-root', 'mw-skin-scope', className)}
      data-moonframe-skin={skinId}
      style={getSkinStyle(skinRegistry[skinId])}
    >
      {children}
    </div>
  );
}
