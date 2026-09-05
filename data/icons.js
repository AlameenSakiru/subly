// SVGs for Subly Brand Identity and Service Logos matching the official Flyer
export const brandIcons = {
  sublyLogo: `
    <svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="16" height="8" rx="4" transform="rotate(-35 5 8)" fill="#22C55E"/>
      <rect x="17" y="17" width="16" height="8" rx="4" transform="rotate(-35 17 17)" fill="#14532D"/>
    </svg>
  `,
  sublyPills: `
    <svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="16" height="8" rx="4" transform="rotate(-35 5 8)" fill="#22C55E"/>
      <rect x="17" y="17" width="16" height="8" rx="4" transform="rotate(-35 17 17)" fill="#14532D"/>
    </svg>
  `,
  // 1. Official Spotify Logo (Green Disc + White Audio Arcs)
  spotify: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <circle cx="12" cy="12" r="12" fill="#1DB954"/>
      <path d="M17.5 17.3c-.2.3-.7.5-1 .2-2.8-1.7-6.4-2.1-10.5-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.6-1 8.5-.6 11.6 1.3.4.2.4.7.2 1.2zm1.5-3.3c-.3.4-.8.6-1.3.3-3.2-2-8.1-2.6-11.9-1.4-.5.2-1-.1-1.2-.6s.1-1 .6-1.2c4.4-1.3 9.8-.7 13.5 1.6.4.3.6.8.3 1.3zm.1-3.4C15.2 8.3 8.9 8.1 5.2 9.2c-.6.2-1.2-.2-1.4-.8-.2-.6.2-1.2.8-1.4 4.2-1.3 11.2-1 15.7 1.6.5.3.7 1 .4 1.5-.3.5-1 .7-1.6.5z" fill="#FFFFFF"/>
    </svg>
  `,
  // 2. Official YouTube Logo (Red Stadium + Center Play Triangle)
  youtube: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect x="1" y="4" width="22" height="16" rx="4.5" fill="#FF0000"/>
      <polygon points="10 8.5 16 12 10 15.5 10 8.5" fill="#FFFFFF"/>
    </svg>
  `,
  // 3. Official Netflix "N" Logo (Authentic Red Ribbon with Depth)
  netflix: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#000000"/>
      <path d="M5.5 4h3.2v16H5.5z" fill="#E50914"/>
      <path d="M15.3 4h3.2v16h-3.2z" fill="#E50914"/>
      <path d="M15.3 4L8.7 20h3.5l6.3-16z" fill="#B81D24"/>
    </svg>
  `,
  // 4. Official OpenAI / ChatGPT Logo (Exact Geometric Rosette Knot)
  chatgpt: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5.5" fill="#10A37F"/>
      <path fill="#FFFFFF" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
    </svg>
  `,
  // 5. Official CapCut Logo (Dual Intersecting Film Cut Brackets)
  capcut: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#000000"/>
      <path d="M4 6.5l8 5.5-8 5.5v-11zm16 0l-8 5.5 8 5.5v-11z" fill="#FFFFFF"/>
      <path d="M7 6.5h10v2H7zm0 9h10v2H7z" fill="#FFFFFF"/>
    </svg>
  `,
  // 6. Official Prime Video Logo (Amazon Prime Blue + Curved Smile Arrow)
  prime: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#00A8E1"/>
      <path d="M19 16c-3.5 2.2-7.8 2.2-11.5 0-.4-.2-.8.2-.5.6 3.9 2.5 8.7 2.5 12.6 0 .5-.3.1-.9-.6-.6z" fill="#FFFFFF"/>
      <path d="M18.8 14.8c.2-.3.8-.1.7.3-.2.8-.7 1.7-1.3 2.1-.3.2-.6-.1-.5-.4.2-.6.7-1.4 1.1-2z" fill="#FFFFFF"/>
      <path d="M7.5 12.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm0-4.2c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7-1.2-2.7-2.7-2.7zm5 4.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm0-4.2c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7-1.2-2.7-2.7-2.7z" fill="#FFFFFF"/>
    </svg>
  `,
  // 7. Official X (Twitter) Logo
  x: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#000000"/>
      <path d="M16.99 5h2.42l-5.28 6.04L20.35 19h-4.87l-3.81-4.99L7.3 19H4.87l5.65-6.46L4.5 5h4.99l3.44 4.56L16.99 5zm-.85 12.55h1.34L8.76 6.37H7.32l8.82 11.18z" fill="#FFFFFF"/>
    </svg>
  `,
  // 8. Official Telegram Logo (Cyan Disc + Crisp White Paper Plane)
  telegram: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <circle cx="12" cy="12" r="12" fill="#24A1DE"/>
      <path d="M17.5 7.2L4.8 12.1c-.9.4-.9.9-.1 1.1l3.3 1 7.6-4.8c.4-.2.7-.1.4.1l-6.2 5.6-.2 3.4c.3 0 .5-.1.7-.3l1.7-1.6 3.5 2.6c.6.4 1.1.2 1.3-.6l2.3-10.8c.2-.9-.3-1.3-1.1-.9z" fill="#FFFFFF"/>
    </svg>
  `,
  // 9. Official Grok / xAI Logo
  supergrok: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#111827"/>
      <path d="M6 7l6 6-6 6M18 19V5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  // 10. Official Canva Logo (Cyan/Purple Radial Gradient Disc + "Canva" C Script)
  canva: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <defs>
        <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00C4CC"/>
          <stop offset="100%" stop-color="#7D2AE8"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#canva-grad)"/>
      <path d="M12.5 6.2c-2.9 0-5.3 2.1-5.3 5.8 0 3.7 2.4 5.8 5.3 5.8 1.9 0 3.3-.9 4.2-2.3l-1.6-1.1c-.6.9-1.5 1.5-2.6 1.5-1.7 0-3.1-1.3-3.1-3.9s1.4-3.9 3.1-3.9c1.1 0 2 .6 2.6 1.5l1.6-1.1c-.9-1.4-2.3-2.3-4.2-2.3z" fill="#FFFFFF"/>
    </svg>
  `,
  // 11. Official ExpressVPN Logo (Red Shield/Badge + Sharp White "V")
  expressvpn: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#DA3940"/>
      <path d="M12 4L4 7.5v5c0 5 3.4 9.7 8 10.5 4.6-.8 8-5.5 8-10.5v-5L12 4z" fill="#DA3940"/>
      <path d="M7.5 9.5l4.5 5 4.5-5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  `,
  // 12. Official Surfshark Logo (Teal Badge + Shark Fin / "S" Wave)
  surfshark: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#18868B"/>
      <path d="M15 6c-3 1-5.5 4-5.5 8 0 2.5 1.5 4 4.5 4 2 0 4-1 4-1s-1.5-2-3-2-2-.5-2-1.5c0-1.5 2.5-3.5 4.5-4.5-1-1.5-2.5-3-2.5-3z" fill="#FFFFFF"/>
    </svg>
  `,
  // 13. Official PIA (Private Internet Access) Logo (Green Robot Padlock)
  pia: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#4B8929"/>
      <path d="M12 6c-2.2 0-4 1.8-4 4v2h8v-2c0-2.2-1.8-4-4-4zm-6 6v7c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-7H6zm6 5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="#FFFFFF"/>
    </svg>
  `,
  // 14. Official Avast VPN Logo (Orange Badge + Swirl Star "a")
  avast: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#FF7800"/>
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
      <path d="M12 4a8 8 0 0 1 8 8h-3a5 5 0 0 0-5-5V4zm-8 8a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" fill="#FFFFFF"/>
    </svg>
  `,
  // 15. Official Proton VPN Logo (Purple Badge + Folded Prism Triangle)
  proton: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#6D4AFF"/>
      <path d="M6 18l6-13 6 13H6zm6-9.5L8.5 16h7L12 8.5z" fill="#FFFFFF"/>
    </svg>
  `,
  // 16. Official Mysterium VPN Logo (Dark Violet Badge + Magenta Node "M")
  mysterium: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#241B3B"/>
      <path d="M6 17V7l6 6 6-6v10h-2.5V10.8L12 14.3l-3.5-3.5V17H6z" fill="#FF2A7A"/>
    </svg>
  `,
  // 17. Official Google AI (Gemini 4-Color Spark / Star Logo)
  google: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <defs>
        <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4285F4"/>
          <stop offset="35%" stop-color="#9B72CB"/>
          <stop offset="70%" stop-color="#D96570"/>
          <stop offset="100%" stop-color="#F2994A"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="#1E1F20"/>
      <path d="M12 3c0 4.97-4.03 9-9 9 4.97 0 9 4.03 9 9 0-4.97 4.03-9 9-9-4.97 0-9-4.03-9-9z" fill="url(#gemini-grad)"/>
    </svg>
  `,
  // 18. Official Claude AI / Anthropic Sunburst Logo
  claude: `
    <svg viewBox="0 0 24 24" width="26" height="26">
      <rect width="24" height="24" rx="5" fill="#CC785C"/>
      <path d="M12 4.5l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5L6 12l4.5-1.5L12 4.5z" fill="#FFFFFF"/>
    </svg>
  `,
  crown: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#F59E0B">
      <path d="M3 18h18v2H3v-2zm1.5-9l4.5 4.5 3-7 3 7 4.5-4.5L19 16H5L4.5 9z"/>
    </svg>
  `,
  accountTrade: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  `
};

export const uiIcons = {
  whatsapp: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.75 7.84 19L7.54 18.82L4.43 19.64L5.26 16.61L5.06 16.3C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C16.58 3.67 20.28 7.37 20.28 11.91C20.28 16.45 16.58 20.15 12.04 20.15Z"/>
    </svg>
  `,
  phone: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  `,
  headphones: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  `,
  shield: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `,
  arrowUpRight: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  `,
  send: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,
  star: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="#F59E0B" stroke="#F59E0B" stroke-width="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  `,
  messageSquare: `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#22C55E">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <circle cx="9" cy="10" r="1.2" fill="#FFFFFF"/>
      <circle cx="13" cy="10" r="1.2" fill="#FFFFFF"/>
      <circle cx="17" cy="10" r="1.2" fill="#FFFFFF"/>
    </svg>
  `,
  cart: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  `,
  sun: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `,
  moon: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `
};

export const categoryIcons = {
  featured: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
      <path d="M12 2c-.5 2.5-3 4.5-3 7 0 2.8 2.2 5 5 5 2.5 0 4.5-2 4.5-4.5 0-3-3-5.5-3.5-7.5-.5 1-1 2-2 2-.5 0-1-.5-1-1.5 0-.2 0-.3.05-.5C12 2.5 12 2 12 2zm-2 10c-.5 0-1 .5-1 1 0 3.3 2.7 6 6 6 1.8 0 3.4-.8 4.5-2.1-1.2.6-2.5 1.1-4 1.1-3 0-5.5-2.2-5.5-5 0-.5.2-1 .4-1.5-.2.3-.4.5-.4.5z"/>
    </svg>
  `,
  streaming: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
      <line x1="7" y1="2" x2="7" y2="22"></line>
      <line x1="17" y1="2" x2="17" y2="22"></line>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="2" y1="7" x2="7" y2="7"></line>
      <line x1="2" y1="17" x2="7" y2="17"></line>
      <line x1="17" y1="17" x2="22" y2="17"></line>
      <line x1="17" y1="7" x2="22" y2="7"></line>
    </svg>
  `,
  ai: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
    </svg>
  `,
  vpn: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M12 8v4"></path>
      <path d="M12 16h.01"></path>
    </svg>
  `,
  social: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,
  design: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13.5" cy="6.5" r=".5"></circle>
      <circle cx="17.5" cy="10.5" r=".5"></circle>
      <circle cx="8.5" cy="7.5" r=".5"></circle>
      <circle cx="6.5" cy="12.5" r=".5"></circle>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
    </svg>
  `,
  all: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  `
};
