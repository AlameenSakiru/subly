// Subly Services, Categories, and Pricing Data matching the Official Flyer

export const siteConfig = {
  name: "Subly",
  tagline: "Premium Subscriptions. Social Accounts & More.",
  phone: "07047929177",
  whatsappNumber: "2347047929177",
  whatsappDefaultMsg: "Hi Subly! I want to inquire about your premium subscriptions and services.",
  badges: [
    { icon: "phone", text: "07047929177" },
    { icon: "headphones", text: "Fast Support" },
    { icon: "shield", text: "Safe & Trusted" }
  ]
};

export const categories = [
  { id: "featured", label: "Featured Bestsellers", icon: "featured" },
  { id: "streaming", label: "Streaming", icon: "streaming" },
  { id: "ai", label: "AI & Productivity", icon: "ai" },
  { id: "vpn", label: "VPN Plans", icon: "vpn" },
  { id: "social", label: "Social & Accounts", icon: "social" },
  { id: "design", label: "Design & Editing", icon: "design" },
  { id: "all", label: "All Offers", icon: "all" }
];

// Main Available Subscriptions (matching the flyer list)
export const flyerMainServices = [
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    category: "streaming",
    categoryLabel: "Streaming",
    price: 800,
    priceDisplay: "₦800",
    period: "Individual Account",
    description: "Ad-free music listening, offline download, unlimited skips with high fidelity audio.",
    featured: true,
    popular: true,
    badge: "Bestseller",
    brandColor: "#1DB954",
    icon: "spotify",
    logoUrl: "/logos/spotify.svg",
    features: ["Ad-free music playback", "Offline downloads", "Works on iOS, Android & PC", "Instant activation"]
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    category: "streaming",
    categoryLabel: "Streaming",
    price: 1000,
    priceDisplay: "₦1000",
    period: "1 Month",
    description: "Zero video ads, background playback, and YouTube Music Premium included.",
    featured: true,
    popular: true,
    badge: "Popular",
    brandColor: "#FF0000",
    icon: "youtube",
    logoUrl: "/logos/youtube.svg",
    features: ["Zero ads on all videos", "Background & PiP playback", "YouTube Music Pro included", "Fast setup"]
  },
  {
    id: "netflix-premium",
    name: "Netflix",
    category: "streaming",
    categoryLabel: "Streaming",
    price: 3500,
    priceDisplay: "₦3500",
    period: "per month",
    description: "Ultra HD 4K streaming with private pin profile on supported smart screens.",
    featured: true,
    popular: true,
    badge: "4K UHD",
    brandColor: "#E50914",
    icon: "netflix",
    logoUrl: "/logos/netflix.svg",
    features: ["Ultra HD 4K streaming", "Private PIN profile", "Zero screen kickouts", "Full month warranty"]
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus (ChatGPT Go)",
    category: "ai",
    categoryLabel: "AI Tools",
    price: 6500,
    priceDisplay: "₦6500",
    period: "Access Tier",
    description: "Access GPT-4o, DALL-E image generation, advanced data analysis and instant output.",
    featured: true,
    popular: true,
    badge: "Top Tier",
    brandColor: "#10A37F",
    icon: "chatgpt",
    logoUrl: "/logos/chatgpt.svg",
    features: ["GPT-4o & o1 reasoning", "DALL-E image generator", "Custom GPTs & file analysis", "Priority high speed"]
  },
  {
    id: "capcut-pro",
    name: "CapCut Pro",
    category: "design",
    categoryLabel: "Design & Editing",
    price: 1500,
    priceDisplay: "₦1500",
    period: "Pro Account",
    description: "Unlock all VIP transitions, auto-captions, 4K 60fps export and cloud space.",
    featured: true,
    popular: true,
    badge: "Hot",
    brandColor: "#000000",
    icon: "capcut",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Capcut-icon.svg",
    features: ["All Pro effects & transitions", "AI video captions & voice", "4K 60fps export", "PC & Mobile sync"]
  },
  {
    id: "prime-video-logs",
    name: "Prime Video Logs",
    category: "streaming",
    categoryLabel: "Streaming",
    price: 6000,
    priceDisplay: "₦6,000",
    period: "per month",
    description: "Watch movies, exclusive series, and Amazon Originals in high definition.",
    featured: false,
    popular: false,
    badge: "Instant Delivery",
    brandColor: "#00A8E1",
    icon: "prime",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    features: ["Thousands of HD movies", "Instant account logs", "Multi-device support", "30-day warranty"]
  },
  {
    id: "x-premium-3m",
    name: "X Premium (3 Months)",
    category: "social",
    categoryLabel: "Social & Accounts",
    price: 8500,
    priceDisplay: "₦8500",
    period: "3 Months Access",
    description: "Blue checkmark verification, edit post features, analytics, and Grok AI access.",
    featured: false,
    popular: false,
    badge: "Verified Check",
    brandColor: "#000000",
    icon: "x",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    features: ["Blue checkmark badge", "Grok AI assistant access", "Prioritized replies & ranking", "Long post & edit button"]
  },
  {
    id: "x-premium-6m",
    name: "X Premium (6 Months)",
    category: "social",
    categoryLabel: "Social & Accounts",
    price: 13000,
    priceDisplay: "₦13000",
    period: "6 Months Access",
    description: "Extended 6-month blue checkmark verification and premium monetization tools.",
    featured: false,
    popular: true,
    badge: "Best Value",
    brandColor: "#000000",
    icon: "x",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    features: ["6 months active checkmark", "Creator revenue eligibility", "Ad revenue share boost", "Fast account delivery"]
  },
  {
    id: "tg-premium",
    name: "Telegram Premium",
    category: "social",
    categoryLabel: "Social & Accounts",
    price: 5000,
    priceDisplay: "₦5000",
    period: "3 months & above",
    description: "4GB file uploads, faster downloads, voice-to-text, animated emoji, and star badge.",
    featured: false,
    popular: false,
    badge: "Fast Delivery",
    brandColor: "#24A1DE",
    icon: "telegram",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    features: ["4GB file upload limit", "Double limits across channels", "Star badge profile", "Voice-to-text audio"]
  },
  {
    id: "supergrok",
    name: "Supergrok",
    category: "ai",
    categoryLabel: "AI Tools",
    price: 6500,
    priceDisplay: "₦6500",
    period: "Direct Access",
    description: "Real-time search intelligence, deep uncensored analysis powered by xAI.",
    featured: false,
    popular: false,
    badge: "xAI Tech",
    brandColor: "#111827",
    icon: "supergrok",
    logoUrl: "https://cdn.simpleicons.org/x/000000",
    features: ["Real-time X data intelligence", "Deep reasoning mode", "Generative analysis", "Instant access"]
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    category: "design",
    categoryLabel: "Design & Editing",
    price: 9000,
    priceDisplay: "₦9,000",
    period: "1 Year Access",
    description: "Full access to 100M+ stock assets, Magic Studio AI, background remover, and brand kit.",
    featured: true,
    popular: true,
    badge: "1 Year Full",
    brandColor: "#00C4CC",
    icon: "canva",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    features: ["1 Full Year activation", "Magic AI Studio & resize", "1-click background remover", "Private team/account"]
  }
];

// VPN Plans Matrix (as presented on the flyer)
export const vpnPlans = [
  {
    id: "expressvpn",
    name: "ExpressVPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 5000,
    priceDisplay: "₦5,000",
    period: "Monthly",
    badge: "Ultra Fast",
    description: "Lightning-fast high security VPN with servers across 94+ global locations.",
    brandColor: "#DA3940",
    icon: "expressvpn",
    logoUrl: "https://cdn.simpleicons.org/expressvpn/DA3940",
    features: ["Ultra high speeds", "94+ country locations", "Military-grade encryption", "Instant setup"]
  },
  {
    id: "surfshark",
    name: "Surfshark VPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 5500,
    priceDisplay: "₦5500",
    period: "Monthly",
    badge: "Unlimited",
    description: "Protect all your devices with CleanWeb ad blocker and strict zero-logs policy.",
    brandColor: "#18868B",
    icon: "surfshark",
    logoUrl: "https://cdn.simpleicons.org/surfshark/18868B",
    features: ["Unlimited devices", "CleanWeb ad blocker", "Strict no-logs policy", "Fast streaming"]
  },
  {
    id: "pia-vpn",
    name: "PIA VPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 5000,
    priceDisplay: "₦5,000",
    period: "Monthly",
    badge: "Top Security",
    description: "Private Internet Access with 10Gbps NextGen servers and open-source transparency.",
    brandColor: "#78B833",
    icon: "pia",
    logoUrl: "https://cdn.simpleicons.org/privateinternetaccess/78B833",
    features: ["Private Internet Access", "10Gbps servers", "Open source transparency", "No logs recorded"]
  },
  {
    id: "avast-vpn",
    name: "Avast VPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 6000,
    priceDisplay: "₦6,000",
    period: "Monthly",
    badge: "Secure",
    description: "Bank-grade encryption, optimized streaming servers, and DNS leak prevention.",
    brandColor: "#FF7800",
    icon: "avast",
    logoUrl: "https://cdn.simpleicons.org/avast/FF7800",
    features: ["Bank-grade security", "Fast streaming servers", "DNS leak protection", "Simple 1-click connect"]
  },
  {
    id: "proton-vpn",
    name: "Proton VPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 5500,
    priceDisplay: "₦5500",
    period: "Monthly",
    badge: "Swiss Privacy",
    description: "Protected by Swiss privacy laws, NetShield malware filter, and Tor over VPN.",
    brandColor: "#6D4AFF",
    icon: "proton",
    logoUrl: "https://cdn.simpleicons.org/protonvpn/6D4AFF",
    features: ["Swiss privacy laws", "NetShield malware filter", "Tor over VPN integration", "High speed"]
  },
  {
    id: "mysterium-vpn",
    name: "Mysterium VPN",
    category: "vpn",
    categoryLabel: "VPN Plans",
    price: 9000,
    priceDisplay: "₦9000",
    period: "Monthly",
    badge: "dVPN Residential",
    description: "Decentralized dVPN node network with residential IPs to unblock any restricted service.",
    brandColor: "#7535D4",
    icon: "mysterium",
    logoUrl: "https://cdn.simpleicons.org/mysterium/7535D4",
    features: ["Decentralized dVPN node", "Residential IPs", "Unblock any restricted site", "Pay-as-you-go speed"]
  }
];

// Special High-Tier Offers from Flyer
export const specialtyOffers = [
  {
    id: "google-ai-pro",
    name: "Google AI Pro (Gemini Advanced)",
    period: "18 Months Access",
    price: 12000,
    priceDisplay: "₦12,000",
    category: "ai",
    categoryLabel: "AI Tools",
    badge: "18 Months",
    featured: true,
    popular: true,
    brandColor: "#4285F4",
    icon: "google",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    description: "Gemini 1.5 Pro / Ultra model with 1 Million+ token context window and Google Workspace integration.",
    features: [
      "18 Full Months duration",
      "2TB Cloud storage included",
      "Deep multi-modal analysis",
      "Direct Google activation"
    ]
  }
];

// Complete combined catalog list
export const servicesData = [
  ...flyerMainServices,
  ...vpnPlans,
  ...specialtyOffers
];

// Helper to generate WhatsApp order message URL
export function getWhatsAppOrderUrl(serviceName, price) {
  const text = encodeURIComponent(
    `Hi Subly! I want to order ${serviceName} (${price}). Please provide payment details.`
  );
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
