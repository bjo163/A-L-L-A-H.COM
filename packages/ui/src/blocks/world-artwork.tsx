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
      data-artwork-signature={artworkSignatures[skin]}
      width={1600}
      height={900}
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
          <path d="M7 12h1m27 6h1M16 43h1m31-9h1M31 51h1" stroke={palette.paper} strokeOpacity=".7" strokeWidth="2" fill="none" />
        </pattern>
        <pattern id={`${id}-engraving`} width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M-12 48 48-12M0 60 60 0M24 72 72 24" stroke={palette.line} strokeOpacity=".18" fill="none" />
          <path d="M0 0h48v48H0z" fill="none" stroke={palette.line} strokeOpacity=".08" />
        </pattern>
        <pattern id={`${id}-print-hatch`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M0 2h26M0 8h26M0 20h26" stroke={palette.ink} strokeOpacity=".3" strokeWidth="2" fill="none" />
          <circle cx="7" cy="15" r="1.5" fill={palette.ink} fillOpacity=".42" />
        </pattern>
        <radialGradient id={`${id}-moon-surface`} cx="0" cy="0" r="1" gradientTransform="matrix(164 0 0 164 1010 366)" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.paper} />
          <stop offset=".72" stopColor={palette.accent} />
          <stop offset="1" stopColor={palette.line} stopOpacity=".6" />
        </radialGradient>
        <linearGradient id={`${id}-wet-road`} x1="800" y1="550" x2="800" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.light} stopOpacity=".16" />
          <stop offset=".45" stopColor={palette.ink} stopOpacity=".18" />
          <stop offset="1" stopColor={palette.fieldEnd} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <clipPath id={`${id}-frame`}>
          <path d="M0 0h1600v900H0z" />
        </clipPath>
        <clipPath id={`${id}-moon`}>
          <circle cx="1070" cy="416" r="144" />
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

const artworkSignatures: Record<SkinId, string> = {
  'imperium-lumen': 'axial-light-chamber',
  'lunar-chronicles': 'eclipse-atlas',
  rocksoul: 'rain-noir-chapter',
  'nexus-paradox': 'diegetic-instrument',
  'riot-anarchy': 'xerox-cutup-wall',
  mycelium: 'connected-living-network',
};

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
      <path d="M0 520h320l90 112h-96L0 590zm1600 0h-320l-90 112h96l314-42z" fill="#20211d" />
      <path d="M0 520h320l90 112h-96L0 590zm1600 0h-320l-90 112h96l314-42z" fill={`url(#${id}-engraving)`} opacity=".26" />
      <path d="M0 660h1600v240H0z" fill="#0b0c0a" />
      <path d="M90 660 800 115l710 545H90Z" fill="#d3b77b" fillOpacity=".07" />
      <path d="M148 660 800 174l652 486" fill="none" stroke={p.paper} strokeOpacity=".12" strokeWidth="14" />
      <path d="M236 660 800 236l564 424" stroke={p.accent} strokeOpacity=".62" strokeWidth="2" fill="none" />
      <path d="M395 660 800 356l405 304" stroke={p.line} strokeOpacity=".38" strokeWidth="2" fill="none" />
      <path d="M555 660 800 476l245 184" stroke={p.line} strokeOpacity=".24" strokeWidth="2" fill="none" />
      <path d="M485 660V400l315-292 315 292v260" fill="#11120f" fillOpacity=".72" stroke={p.accent} strokeOpacity=".4" strokeWidth="3" />
      <path d="M520 660V414l280-260 280 260v246" fill="none" stroke={p.line} strokeOpacity=".24" strokeWidth="2" />
      <path d="M462 400h76m524 0h76M462 410h50m548 0h78" stroke={p.paper} strokeOpacity=".4" strokeWidth="4" fill="none" />
      <path d="M468 426v225m34-238v238m594-238v238m34-225v225" stroke={p.accent} strokeOpacity=".32" strokeWidth="5" fill="none" />
      <path d="M452 458h50m646 0h50M452 614h50m646 0h50" stroke={p.line} strokeOpacity=".28" strokeWidth="2" fill="none" />
      <path d="M676 660V430l124-124 124 124v230" fill="#171814" stroke={p.accent} strokeWidth="3" />
      <path d="M716 660V446l84-82 84 82v214" fill="#090a09" stroke={p.paper} strokeOpacity=".66" strokeWidth="2" />
      <path d="M744 660V464l56-55 56 55v196" fill="#d3b77b" fillOpacity=".12" />
      <path d="M764 660V477l36-35 36 35v183" fill="none" stroke={p.paper} strokeOpacity=".22" strokeWidth="2" />
      <path d="M800 118v250m0 292v240M90 660h1420" stroke={p.line} strokeOpacity=".34" fill="none" />
      <path d="M0 730h1600M0 804h1600M0 860h1600" stroke={p.line} strokeOpacity=".13" fill="none" />
      <path d="M320 660 575 900m705-240-255 240M548 660 690 900m512-240-142 240" stroke={p.accent} strokeOpacity=".2" fill="none" />
      <path d="M170 660 430 900m1000-240-260 240M700 660 755 900m200-240-55 240" stroke={p.paper} strokeOpacity=".12" fill="none" />
      <path d="M0 684h1600M0 760h1600M0 832h1600" stroke={p.accent} strokeOpacity=".08" fill="none" />
      <path d="M92 648 800 96l708 552" fill="none" stroke={p.paper} strokeOpacity=".16" strokeWidth="2" />
      <path d="M246 660 800 226l554 434" fill={`url(#${id}-engraving)`} opacity=".12" />
      <circle cx="800" cy="116" r="7" fill={p.paper} />
      <circle cx="800" cy="116" r="28" fill={p.light} fillOpacity=".45" filter={`url(#${id}-soft)`} />
      <path d="M0 520h300v380H0zm1300-70h300v450h-300z" fill="#090a09" fillOpacity=".62" />
      <path d="M300 520h64v380h-64m872-450h64v450h-64" stroke={p.accent} strokeOpacity=".3" fill="none" />
    </>
  ),
  'lunar-chronicles': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-grid)`} opacity=".7" />
      <g fill={p.paper}>
        <circle cx="176" cy="126" r="2" /><circle cx="286" cy="88" r="3" /><circle cx="422" cy="148" r="2" />
        <circle cx="552" cy="86" r="2" /><circle cx="694" cy="162" r="3" /><circle cx="1372" cy="96" r="2" />
        <circle cx="1482" cy="154" r="3" /><circle cx="1542" cy="322" r="2" /><circle cx="1448" cy="560" r="2" />
        <circle cx="136" cy="484" r="2" /><circle cx="248" cy="394" r="3" /><circle cx="432" cy="730" r="2" />
        <circle cx="1268" cy="782" r="3" /><circle cx="1450" cy="716" r="2" /><circle cx="94" cy="824" r="2" />
      </g>
      <circle cx="1070" cy="416" r="285" fill="#b9c9e6" fillOpacity=".08" stroke={p.line} strokeOpacity=".32" />
      <circle cx="1070" cy="416" r="238" stroke={p.line} strokeOpacity=".46" strokeWidth="2" fill="none" />
      <circle cx="1070" cy="416" r="190" stroke={p.line} strokeOpacity=".22" fill="none" />
      <circle cx="1070" cy="416" r="144" fill={`url(#${id}-moon-surface)`} />
      <g clipPath={`url(#${id}-moon)`} fill="none" stroke={p.ink}>
        <circle cx="1004" cy="364" r="26" strokeOpacity=".12" strokeWidth="7" />
        <circle cx="1004" cy="364" r="12" strokeOpacity=".15" strokeWidth="2" />
        <circle cx="1052" cy="468" r="39" strokeOpacity=".1" strokeWidth="10" />
        <circle cx="1052" cy="468" r="17" strokeOpacity=".17" strokeWidth="2" />
        <circle cx="972" cy="482" r="13" strokeOpacity=".14" strokeWidth="4" />
        <circle cx="1087" cy="318" r="18" strokeOpacity=".12" strokeWidth="5" />
        <path d="M932 398c48-56 103-82 166-76M938 528c76 22 141 17 198-16" stroke={p.paper} strokeOpacity=".19" strokeWidth="2" fill="none" />
      </g>
      <circle cx="1142" cy="374" r="144" fill="#101725" />
      <path d="M768 416h604M1070 114v604M856 202l428 428m0-428L856 630" stroke={p.line} strokeOpacity=".18" fill="none" />
      <circle cx="1070" cy="416" r="260" stroke={p.accent} strokeOpacity=".7" strokeDasharray="2 12" strokeWidth="2" fill="none" />
      <g stroke={p.paper} strokeOpacity=".42" strokeWidth="2">
        <path d="M1070 108v18m0 580v18M762 416h18m580 0h18M852 198l13 13m410 410 13 13m0-436-13 13m-410 410-13 13" />
        <path d="M920 160v18m300 476v18m-300 0v-18m300-476v-18M780 266l14 8m522 284 14 8m0-300-14 8m-522 284-14 8" />
      </g>
      <ellipse cx="1070" cy="416" rx="415" ry="170" transform="rotate(-23 1070 416)" stroke={p.accent} strokeOpacity=".52" strokeWidth="2" fill="none" />
      <ellipse cx="1070" cy="416" rx="520" ry="220" transform="rotate(-23 1070 416)" stroke={p.line} strokeOpacity=".18" fill="none" />
      <path d="M112 202 394 286l180-104 206 174-162 185-316 78" fill="none" stroke={p.accent} strokeOpacity=".24" strokeWidth="12" />
      <path d="M112 202 394 286l180-104 206 174-162 185-316 78" stroke={p.line} strokeOpacity=".55" strokeWidth="2" fill="none" />
      <g fill={p.paper}>
        <circle cx="112" cy="202" r="7" /><circle cx="394" cy="286" r="6" /><circle cx="574" cy="182" r="7" />
        <circle cx="780" cy="356" r="8" /><circle cx="618" cy="541" r="6" /><circle cx="302" cy="619" r="7" />
      </g>
      <path d="M148 762h394M148 786h252M148 810h332" stroke={p.line} strokeOpacity=".38" strokeWidth="2" fill="none" />
      <path d="M148 738h188m-188 96h316M148 856h228" stroke={p.accent} strokeOpacity=".34" strokeWidth="2" fill="none" />
      <path d="M1320 748h164m-164 18h108m-108 18h138" stroke={p.line} strokeOpacity=".3" strokeWidth="2" fill="none" />
      <circle className="mw-world-artwork__orbit" cx="1482" cy="242" r="9" fill={p.paper} />
    </>
  ),
  rocksoul: (id, p) => (
    <>
      <path d="M0 0h1600v606H0z" fill="#0e1012" />
      <path d="M0 466c230-92 420-64 648-28 292 47 590-34 952-118v286H0z" fill={p.light} fillOpacity=".055" filter={`url(#${id}-blur)`} />
      <path d="M0 580h1600v320H0z" fill="#090a0b" />
      <path d="M0 606 800 552l800 54v294H0z" fill="#191a1c" />
      <path d="M0 606 800 552l800 54v294H0z" fill={`url(#${id}-wet-road)`} />
      <path d="M0 606 800 552l800 54v294H0z" fill={`url(#${id}-reflect)`} opacity=".38" />
      <path d="M0 606h1600M0 688h1600M0 798h1600" stroke={p.paper} strokeOpacity=".14" fill="none" />
      <path d="M126 606V242h254v364m30 0V320h188v286m576 0V264h302v342m-640 0V384h180v222" fill="#111214" stroke="#424448" strokeOpacity=".68" strokeWidth="2" />
      <path d="M126 302h254m-254 13h254M410 364h188m-188 14h188M1174 326h302m-302 15h302M772 424h180m-180 14h180" stroke={p.paper} strokeOpacity=".08" fill="none" />
      <path d="M148 362h210m-210 62h210m-210 62h210m-210 62h210m312-176h152m-152 46h152m-152 46h152m444-160h258m-258 58h258m-258 58h258m-258 58h258" stroke={p.paper} strokeOpacity=".09" strokeWidth="2" fill="none" />
      <path d="M198 296h68v9h-68zm104 0h42v9h-42zm-110 96h96v8h-96zm102 54h48v8h-48zm936-174h110v9h-110zm-4 86h64v8h-64z" fill={p.accent} fillOpacity=".56" />
      <path d="M88 604V382m28 222V270m1416 336V350m28 256V244" stroke={p.paper} strokeOpacity=".2" strokeWidth="3" fill="none" />
      <path d="M72 386h32m-32 10h32m1380-44h32m-32 10h32" stroke={p.accent} strokeOpacity=".5" strokeWidth="3" fill="none" />
      <path d="M118 607c210-6 362-20 518-50m354 0c140 34 306 48 510 50" fill="none" stroke={p.paper} strokeOpacity=".26" strokeWidth="2" />
      <path d="M0 560c218 28 386 14 604-18m392 5c204 31 406 29 604-6" fill="none" stroke={p.paper} strokeOpacity=".08" strokeWidth="22" filter={`url(#${id}-soft)`} />
      <path d="M802 360v248m-18-248h36v74h-36z" stroke={p.paper} strokeOpacity=".72" strokeWidth="3" fill="none" />
      <circle cx="800" cy="346" r="15" fill={p.accent} fillOpacity=".7" />
      <path d="M804 620c-22 0-38 24-38 56v78l-22 86h36l27-70 25 70h38l-23-86v-78c0-32-16-56-43-56Z" fill="#08090a" />
      <path d="M774 628c8-26 20-40 30-40s22 14 30 40l-9 10h-42z" fill="#9e2931" />
      <path d="M776 640c-19 7-30 20-36 40l-26 54 24 11 38-42m57-63c19 7 30 20 36 40l26 54-24 11-38-42" fill="#111214" stroke="#424448" strokeWidth="2" />
      <path d="M780 642h48l12 107-36 23-36-23z" fill="#8f252b" />
      <path d="M789 652v82m27-82v82m-32-56h38m-38 30h38" stroke={p.paper} strokeOpacity=".28" strokeWidth="2" fill="none" />
      <path d="M786 774h30m-50 67h36m22 0h37M724 612h160" stroke={p.accent} strokeOpacity=".64" strokeWidth="3" fill="none" />
      <path d="m450 606 200 294m488-294-140 294m-678-294 452 294m620-294-440 294" stroke={p.accent} strokeOpacity=".18" strokeWidth="3" fill="none" />
      <path d="M82 656h312m684 0h388M206 720h172m718 0h304M350 782h176m570 0h242M516 842h148m356 0h216" stroke={p.paper} strokeOpacity=".25" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path className="mw-world-artwork__rain" d="M190 82 164 190m180-132-24 112m208-86-27 119m226-185-24 112m234-82-23 108m210-136-25 112m230-72-24 109M82 370 58 474m500-64-23 106m984-212-24 108M304 250l-18 80m392-40-18 80m504-210-20 88m202 200-17 74m-836 52-16 66m-188-302-14 58m1094-72-16 70" stroke={p.paper} strokeOpacity=".23" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M0 606h1600" stroke={p.paper} strokeOpacity=".42" strokeWidth="2" fill="none" />
    </>
  ),
  'nexus-paradox': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-grid)`} />
      <path d="M0 450 178 322h246v256H178L0 450Zm1600 0-178-128h-246v256h246l178-128Z" fill="#071114" fillOpacity=".72" stroke={p.line} strokeOpacity=".14" />
      <path d="M242 154h1116l132 122v350l-132 122H242L110 626V276l132-122Z" fill="#0b1b1f" fillOpacity=".78" stroke={p.accent} strokeOpacity=".76" strokeWidth="3" />
      <path d="M260 170h1080l122 112v308l-122 112H260L138 590V310l122-140Z" fill="none" stroke={p.paper} strokeOpacity=".08" strokeWidth="10" />
      <path d="M318 220h964l86 80v286l-86 80H318l-86-80V300l86-80Z" stroke={p.line} strokeOpacity=".36" strokeWidth="2" fill="none" />
      <path d="M342 244h916l62 58v254l-62 58H342l-62-58V302l62-58Z" fill={`url(#${id}-engraving)`} opacity=".15" />
      <path d="M800 290 938 450 800 610 662 450 800 290Z" fill="#55c4d2" fillOpacity=".08" stroke={p.accent} strokeWidth="3" />
      <circle cx="800" cy="450" r="92" stroke={p.line} strokeOpacity=".7" strokeWidth="2" fill="none" />
      <circle cx="800" cy="450" r="36" fill={p.accent} fillOpacity=".78" />
      <circle cx="800" cy="450" r="62" stroke={p.paper} strokeOpacity=".5" strokeDasharray="2 8" strokeWidth="2" fill="none" />
      <path d="M800 322v38m0 180v38m-128-128h38m180 0h38m-218-90 27 27m126 126 27 27m0-180-27 27m-126 126-27 27" stroke={p.paper} strokeOpacity=".52" strokeWidth="2" fill="none" />
      <circle className="mw-world-artwork__scan" cx="800" cy="450" r="174" stroke={p.accent} strokeOpacity=".44" strokeDasharray="18 10" strokeWidth="2" fill="none" />
      <path d="M800 206v488m-244-244h488m-172-172 344 344m0-344L700 622" stroke={p.line} strokeOpacity=".22" fill="none" />
      <path d="m800 210 10 30h-20l10-30Zm244 240-30 10v-20l30 10Zm-244 244-10-30h20l-10 30Zm-244-244 30-10v20l-30-10Z" fill={p.accent} fillOpacity=".66" />
      <path d="M168 340h270m-270 28h186m778 222h290m-290 28h220" stroke={p.line} strokeOpacity=".54" strokeWidth="3" fill="none" />
      <path d="M166 392h92m-92 12h142m816 142h206m-206 12h118M166 454h154m760-232h146m-146 12h96" stroke={p.accent} strokeOpacity=".28" strokeWidth="2" fill="none" />
      <path d="M128 664h350v106H128zm994-534h350v106h-350z" fill="#11272c" stroke={p.accent} strokeOpacity=".58" />
      <path d="M160 692h180m-180 22h260m-260 22h126m886-548h180m-180 22h260m-260 22h126" stroke={p.line} strokeOpacity=".4" strokeWidth="3" fill="none" />
      <path d="M128 642h350v12H128zm994-534h350v12h-350z" fill={p.accent} fillOpacity=".22" />
      <path d="M474 692h38m-38 14h58m592-576h38m-38 14h58" stroke={p.paper} strokeOpacity=".35" strokeWidth="4" fill="none" />
      <circle cx="242" cy="154" r="6" fill={p.paper} /><circle cx="1358" cy="154" r="6" fill={p.paper} />
      <circle cx="242" cy="748" r="6" fill={p.paper} /><circle cx="1358" cy="748" r="6" fill={p.paper} />
      <path d="M800 152v48m0 500v48m-586-298h48m1076 0h48" stroke={p.accent} strokeWidth="5" fill="none" />
    </>
  ),
  'riot-anarchy': (id, p) => (
    <>
      <rect width="1600" height="900" fill={`url(#${id}-halftone)`} opacity=".62" />
      <path d="m0 0 440 0-52 36 68 26-40 34H0zm1600 900h-398l58-33-76-28 46-37h370z" fill={p.ink} />
      <path d="M84 110h810v510H84z" fill={p.ink} transform="rotate(-4 84 110)" />
      <path d="M720 138h704v600H720z" fill="#a5282d" transform="rotate(5 720 138)" />
      <path d="M150 166h654v382H150z" fill="#ede5d3" stroke={p.ink} strokeWidth="12" />
      <path d="M184 206h568v284H184z" fill="#161715" />
      <path d="M192 214h552v268H192z" fill={`url(#${id}-print-hatch)`} opacity=".42" />
      <path d="m242 467 92-116 74 40 77-126 108 148 72-66 63 120H242Z" fill="#bd4144" fillOpacity=".7" />
      <path d="m242 467 92-116 74 40 77-126 108 148 72-66 63 120H242Z" fill="none" stroke={p.paper} strokeOpacity=".54" strokeWidth="5" />
      <path d="m374 392 27-48 18 42m90-121 26-42 30 53m71 115 24-42 19 49" stroke={p.paper} strokeOpacity=".54" strokeWidth="4" fill="none" />
      <path d="M206 222h12v10h-12zm524 0h12v10h-12zM206 462h12v10h-12zm524 0h12v10h-12z" fill={p.paper} />
      <path className="mw-world-artwork__print" d="m900 90 386 94-86 432-386-94z" fill={p.accent} />
      <path d="m868 116 385 94m-404 284 386 94m-356-431-99 409m176-390-99 409m176-390-99 409m176-390-99 409" stroke={p.paper} strokeOpacity=".2" strokeWidth="3" fill="none" />
      <path d="M111 670h468v148H111zm642-56h386v190H753zm489 42h258v204h-258z" fill={p.paper} stroke={p.ink} strokeWidth="10" />
      <path d="m111 670 36 18-21 25 40 19-28 21 31 20-58 45zm468 0-31 16 24 24-37 18 25 22-33 20 52 48" fill="#d9cfba" />
      <path d="m753 614 28 14-18 21 31 17-21 20 27 17-22 21 30 18-24 20 27 21-24 21 26 19m302-209-25 16 22 20-31 19 25 20-29 17 24 22-27 18 26 20-21 21 24 17" fill="#d9cfba" />
      <path d="m110 686 170-18 134 28 154-14v100l-458 5z" fill="#c7bca4" />
      <path d="M132 706h38m-45 16h64m-48 18h43m-22 18h56m690-112h284m-284 28h212m-212 28h250m-212 28h198" stroke={p.ink} strokeOpacity=".4" strokeWidth="3" fill="none" />
      <path d="M786 632h318v20H786zm0 38h228v20H786zm0 38h278v20H786zm526-28h182v16h-182zm0 35h128v16h-128z" fill={p.ink} />
      <path d="m1170 154 44-86 43 90 92 2-69 56 26 86-92-51-74 55 21-96-67-58z" fill="#e7d8b8" stroke={p.ink} strokeWidth="8" />
      <path d="m1208 170 20-33 18 36 36 2-27 21 10 35-36-19-28 20 8-38-26-22z" fill="#bd4144" />
      <path d="M1398 502 1514 470l35 95-120 44z" fill={p.ink} />
      <path d="M1274 260h205v18h-205zm-24 35h210v14h-210z" stroke={p.paper} strokeWidth="8" fill="none" />
      <path d="M1288 314h178m-171 10h118" stroke={p.ink} strokeOpacity=".7" strokeWidth="3" fill="none" />
      <path d="m85 578 62 12-9 42-62-12zm1190-497 82 18-10 44-82-18z" fill="#ede5d3" />
      <path d="M96 594h36m-26 13h36m1160-493h51m-44 14h46" stroke={p.ink} strokeWidth="3" fill="none" />
      <path d="M0 850h1600" stroke={p.ink} strokeWidth="14" fill="none" />
    </>
  ),
  mycelium: (id, p) => (
    <>
      <ellipse cx="858" cy="472" rx="570" ry="330" fill={p.light} fillOpacity=".08" filter={`url(#${id}-blur)`} />
      <ellipse cx="858" cy="472" rx="510" ry="286" fill="none" stroke={p.line} strokeOpacity=".12" strokeWidth="2" />
      <ellipse cx="858" cy="472" rx="424" ry="232" fill="none" stroke={p.accent} strokeOpacity=".12" strokeWidth="2" strokeDasharray="4 18" />
      <path d="M216 750C296 628 330 542 418 513c73-24 120 4 148 41m0 0c-32-113-13-191 42-236 46-37 98-30 158-36m64 394c-62-100-55-180-15-239 40-59 102-66 172-26m90 37c54-95 122-152 210-143 65 7 104 42 150 102" fill="none" stroke={p.line} strokeOpacity=".22" strokeWidth="2" />
      <path d="M218 752C370 690 410 538 566 554c118 12 111 156 264 122 138-31 93-194 247-228 109-25 160 42 307-146" stroke={p.accent} strokeOpacity=".86" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M566 554c-72-108-92-184-64-261 28-77 107-87 140-150m188 533c-12-114-7-203 52-257 65-60 144-35 206-99m-258 356c-82 89-92 173-69 250m-195-372c-95 34-167 80-223 178m664-174c108 73 191 87 285 38" stroke={p.line} strokeOpacity=".58" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M360 664c-40-72-24-129 25-151 50-22 100 8 117 44m232-390c-35 61-28 109 26 138m179 534c28-54 72-79 128-61m170-394c22-66 70-89 126-75" stroke={p.accent} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M218 752c23-50 48-73 77-74m271-124c-2-45 15-73 51-84m213 204c30-38 60-50 91-35m341-112c-3-50 13-84 50-101M642 143c38-3 62 12 74 45m352 260c34 7 57 25 68 54m-810 15c-42 0-66 20-74 60" fill="none" stroke={p.paper} strokeOpacity=".44" strokeWidth="2" strokeLinecap="round" />
      <path d="M268 723c-12-22-9-44 9-61m260-109c9-22 27-36 54-42m301 143c15-24 39-39 70-43m337-180c20-17 42-21 66-11" fill="none" stroke={p.line} strokeOpacity=".3" strokeWidth="2" />
      <g fill={p.light} fillOpacity=".1" stroke={p.line} strokeOpacity=".4" strokeWidth="2">
        <path d="M370 505c24-28 58-31 85-8 22 19 25 52 6 76-20 26-57 28-80 6-22-21-26-51-11-74Z" />
        <path d="M612 270c19-25 52-31 76-13 25 18 30 51 12 76-18 24-51 29-75 11-26-19-31-50-13-74Z" />
        <path d="M930 616c18-25 52-31 76-12 24 18 29 51 11 75-19 25-52 29-77 10-23-18-28-49-10-73Z" />
        <path d="M1210 346c17-24 47-31 71-15 25 17 32 47 16 72-17 26-49 32-74 15-25-18-31-48-13-72Z" />
      </g>
      <g fill="none" stroke={p.paper} strokeOpacity=".34" strokeWidth="2">
        <path d="M385 527c17-17 39-17 54-2m-48 27c13 11 29 12 42 2M626 292c15-15 35-15 49-1m-47 27c13 10 27 11 40 2m276 311c15-16 35-17 50-3m-43 29c13 11 28 12 41 2m276-300c14-14 32-15 46-2m-39 28c12 10 26 10 38 1" />
      </g>
      <g fill={p.paper}>
        <circle cx="218" cy="752" r="13" /><circle cx="566" cy="554" r="12" /><circle cx="830" cy="676" r="14" />
        <circle cx="1077" cy="448" r="11" /><circle cx="1384" cy="302" r="13" /><circle cx="642" cy="143" r="9" />
        <circle cx="1274" cy="520" r="8" /><circle cx="418" cy="513" r="8" />
      </g>
      <g fill={p.accent}>
        <circle cx="360" cy="664" r="6" /><circle cx="734" cy="293" r="7" /><circle cx="950" cy="507" r="6" />
        <circle cx="1128" cy="316" r="7" /><circle cx="760" cy="818" r="6" />
      </g>
      <g fill={p.paper} fillOpacity=".62">
        <circle cx="295" cy="641" r="3" /><circle cx="482" cy="470" r="4" /><circle cx="654" cy="376" r="3" />
        <circle cx="742" cy="582" r="3" /><circle cx="1001" cy="498" r="4" /><circle cx="1195" cy="393" r="3" />
        <circle cx="1312" cy="389" r="4" /><circle cx="882" cy="765" r="3" />
      </g>
      <path d="M106 790c233-82 405-7 610 34 248 50 434-87 778-64" stroke={p.line} strokeOpacity=".12" strokeWidth="2" fill="none" />
      <path className="mw-world-artwork__growth" d="M218 752C370 690 410 538 566 554c118 12 111 156 264 122 138-31 93-194 247-228 109-25 160 42 307-146" stroke={p.paper} strokeOpacity=".35" strokeWidth="2" strokeDasharray="1 18" fill="none" />
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
