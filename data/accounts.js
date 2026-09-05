// Subly X (Twitter) Accounts Inventory & Trading Data

export const xAccountsCatalog = [
  {
    id: "x-verified-blue",
    title: "X Blue Verified Badge Account",
    type: "verified",
    typeLabel: "Blue Badge Verified",
    followers: "1,000 - 5,000+ Active",
    year: "2019 - 2023 Vintage",
    badge: "Official Verified",
    priceDisplay: "From ₦25,000",
    description: "Active profile with active blue checkmark verification badge, Grok AI access, and reply ranking boost.",
    features: [
      "Blue checkmark active & verified",
      "Grok AI assistant unlocked",
      "Priority reply ranking & algorithm boost",
      "Full original email & password handover",
      "Instant 2FA credentials transfer"
    ],
    niche: "General / Lifestyle / Tech"
  },
  {
    id: "x-monetized-creator",
    title: "Monetized Creator Ad-Share Account",
    type: "monetized",
    typeLabel: "Monetization Ready",
    followers: "10,000 - 50,000+ Followers",
    year: "2017 - 2022 Aged",
    badge: "Revenue Ready",
    priceDisplay: "From ₦75,000",
    description: "Monetization-ready account with high organic impressions history. Eligible for Creator Revenue Share payouts.",
    features: [
      "5M+ monthly organic impressions history",
      "Stripe / Payoneer payout ready",
      "Blue badge checkmark active",
      "Zero policy strikes / Clean standing",
      "Direct handover with full recovery access"
    ],
    niche: "Viral Media / News / Memes"
  },
  {
    id: "x-aged-vintage",
    title: "Aged OG Account (2011 - 2016)",
    type: "aged",
    typeLabel: "Vintage Aged",
    followers: "500 - 3,000+ Followers",
    year: "2011 - 2016 Creation",
    badge: "High Trust Score",
    priceDisplay: "From ₦18,000",
    description: "High-trust vintage account created between 2011 and 2016. High algorithmic trust score, resistant to automated bans.",
    features: [
      "10+ Years account age & trust",
      "Immune to shadowban & spam filters",
      "Clean handle history",
      "Includes original registered email",
      "Perfect for marketing & brand authority"
    ],
    niche: "Personal / Business Brand"
  },
  {
    id: "x-crypto-web3",
    title: "Crypto, Web3 & Airdrop Niche Account",
    type: "crypto",
    typeLabel: "Crypto & Tech Niche",
    followers: "5,000 - 25,000+ Followers",
    year: "2020 - 2023 Active",
    badge: "High Engagement",
    priceDisplay: "From ₦45,000",
    description: "Tailored for crypto traders, Web3 founders, and NFT/Airdrop enthusiasts with organic crypto audience engagement.",
    features: [
      "80%+ Crypto & Web3 followers",
      "High tweet engagement & retweet rate",
      "Eligible for crypto promotions & KOL deals",
      "Full email credentials included",
      "Instant WhatsApp dispatch"
    ],
    niche: "Crypto / Web3 / DeFi"
  },
  {
    id: "x-high-growth-50k",
    title: "High Growth Mega Account (50k+ Followers)",
    type: "monetized",
    typeLabel: "Mega Audience",
    followers: "50,000 - 150,000+ Followers",
    year: "2018 - 2023 Active",
    badge: "Mega Reach",
    priceDisplay: "From ₦160,000",
    description: "Massive reach for influencers, agencies, and businesses looking for an instant powerhouse audience in Nigeria & globally.",
    features: [
      "50k - 150k verified organic followers",
      "Massive daily impression reach",
      "High sponsorship & brand revenue potential",
      "Escrow-level secure handover protocol",
      "100% replacement warranty guarantee"
    ],
    niche: "Entertainment / Trends / News"
  },
  {
    id: "x-bulk-marketing",
    title: "Bulk Marketing Accounts (Pack of 5 or 10)",
    type: "bulk",
    typeLabel: "Bulk Packages",
    followers: "Pack of 5-10 Aged Accounts",
    year: "2015 - 2022 Mixed",
    badge: "Agency Pack",
    priceDisplay: "From ₦55,000",
    description: "Discounted bulk bundles for social media agencies, growth hackers, affiliate marketers, and viral trend pushers.",
    features: [
      "Pack of 5 to 10 verified aged accounts",
      "Aged and warm for automation / tweet marketing",
      "Formatted spreadsheet handover (User, Pass, 2FA, Email)",
      "Bulk volume discount applied",
      "Fast WhatsApp setup guidance"
    ],
    niche: "Marketing / Brand Campaigns"
  }
];

export const xAccountCategories = [
  { id: "all", label: "All Accounts" },
  { id: "verified", label: "Blue Badge Verified" },
  { id: "monetized", label: "Monetization Ready" },
  { id: "aged", label: "Vintage Aged (2011+)" },
  { id: "crypto", label: "Crypto & Tech Niche" },
  { id: "bulk", label: "Bulk Packages" }
];

export function getXAccountOrderUrl(accountTitle, price) {
  const text = encodeURIComponent(
    `Hi Subly! I want to purchase the "${accountTitle}" (${price}) on X. Please let me know what handles are currently available.`
  );
  return `https://wa.me/2347047929177?text=${text}`;
}

export function getXAccountSellUrl() {
  const text = encodeURIComponent(
    `Hi Subly! I have an X (Twitter) account I want to SELL for instant cash. Here are the details:\n- Handle:\n- Follower Count:\n- Account Creation Year:\n- Blue Badge Verified (Yes/No):\n- Niche:`
  );
  return `https://wa.me/2347047929177?text=${text}`;
}
