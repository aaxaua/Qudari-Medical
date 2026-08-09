// Built-in SVG illustrations and presets for Parties and Products

export interface PartyAvatarPreset {
  id: string;
  name: string;
  category: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  svgDataUri: string;
}

export interface ProductCategoryPreset {
  category: string;
  label: string;
  iconName: string;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  svgDataUri: string;
}

// 6 Built-in Party Avatars
export const PARTY_AVATAR_PRESETS: PartyAvatarPreset[] = [
  {
    id: "preset_pharmacy",
    name: "Medical Store",
    category: "Chemist Shop",
    bgGradient: "from-emerald-500 to-teal-700",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badgeText: "Retail Pharmacy",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%2310B981"/><path d="M25 40h50v40H25z" fill="%23065F46" opacity="0.3"/><path d="M20 35h60l-5-15H25l-5 15z" fill="%2334D399"/><path d="M42 50h16v20H42z" fill="%23ECFDF5"/><path d="M48 20v10M43 25h10" stroke="%23064E3B" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="55" r="8" fill="%2310B981"/><path d="M46 55h8M50 51v8" stroke="%23ECFDF5" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "preset_wholesaler",
    name: "Wholesaler Depot",
    category: "Distributor",
    bgGradient: "from-blue-600 to-indigo-800",
    borderColor: "border-blue-500/30",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badgeText: "Wholesale Agency",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%233B82F6"/><path d="M15 35l35-15 35 15v45l-35 15-35-15V35z" fill="%231E3A8A" opacity="0.3"/><path d="M15 35l35 15 35-15M50 50v45" stroke="%2393C5FD" stroke-width="4"/><path d="M30 42l20 9 20-9" stroke="%23EFF6FF" stroke-width="3"/></svg>`,
  },
  {
    id: "preset_hospital",
    name: "Hospital / Center",
    category: "Healthcare",
    bgGradient: "from-rose-500 to-red-700",
    borderColor: "border-rose-500/30",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    badgeText: "Hospital / Care",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%23F43F5E"/><path d="M30 25h40v60H30z" fill="%23881337" opacity="0.3"/><path d="M40 25h20v60H40z" fill="%23FFF1F2"/><path d="M43 35h14v14H43z" fill="%23F43F5E"/><path d="M40 55h20M50 45v20" stroke="%23F43F5E" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "preset_clinic",
    name: "Doctor Clinic",
    category: "Medical Clinic",
    bgGradient: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    badgeText: "Clinic / Doctor",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%2306B6D4"/><path d="M50 20c-15 0-25 10-25 25v10c0 12 8 20 25 25 17 0 25-8 25-20V45c0-15-10-25-25-25z" fill="%23164E63" opacity="0.3"/><circle cx="50" cy="40" r="14" fill="%23ECFEFF"/><path d="M30 78c0-10 8-16 20-16s20 6 20 16" stroke="%23ECFEFF" stroke-width="6" stroke-linecap="round"/><path d="M45 40h10M50 35v10" stroke="%2306B6D4" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "preset_pharmacist_m",
    name: "Pharmacist (Male)",
    category: "Individual Pro",
    bgGradient: "from-indigo-500 to-purple-700",
    borderColor: "border-indigo-500/30",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    badgeText: "Registered Chemist",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%236366F1"/><circle cx="50" cy="38" r="16" fill="%23FEE2E2"/><path d="M25 80c0-14 11-22 25-22s25 8 25 22" fill="%23EEF2FF"/><path d="M43 58l7 10 7-10" fill="%23818CF8"/><path d="M48 72h4M50 70v4" stroke="%234F46E5" stroke-width="2"/></svg>`,
  },
  {
    id: "preset_pharmacist_f",
    name: "Pharmacist (Female)",
    category: "Individual Pro",
    bgGradient: "from-purple-500 to-pink-700",
    borderColor: "border-purple-500/30",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    badgeText: "Registered Chemist",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="24" fill="%23A855F7"/><path d="M30 40c0-12 8-18 20-18s20 6 20 18v10H30V40z" fill="%23581C87"/><circle cx="50" cy="38" r="14" fill="%23FCE7F3"/><path d="M26 80c0-13 11-21 24-21s24 8 24 21" fill="%23FAF5FF"/><path d="M48 68h4M50 66v4" stroke="%239333EA" stroke-width="2"/></svg>`,
  },
];

// Built-in Category Visuals / Icons for Products
export const PRODUCT_CATEGORY_PRESETS: Record<string, ProductCategoryPreset> = {
  Tablet: {
    category: "Tablet",
    label: "Tablets / Strips",
    iconName: "Pill",
    bgGradient: "from-blue-500 to-indigo-600",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%233B82F6"/><circle cx="50" cy="50" r="28" fill="%23EFF6FF"/><path d="M30 50h40" stroke="%232563EB" stroke-width="5" stroke-linecap="round"/><circle cx="38" cy="38" r="3" fill="%2393C5FD"/><circle cx="62" cy="62" r="3" fill="%2393C5FD"/></svg>`,
  },
  Capsule: {
    category: "Capsule",
    label: "Capsules / Softgels",
    iconName: "Capsule",
    bgGradient: "from-purple-500 to-indigo-700",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23A855F7"/><g transform="rotate(-30 50 50)"><rect x="30" y="22" width="40" height="56" rx="20" fill="%23FAF5FF"/><path d="M30 50h40v8c0 11-9 20-20 20s-20-9-20-20v-8z" fill="%237E22CE"/></g></svg>`,
  },
  Syrup: {
    category: "Syrup",
    label: "Syrups / Suspensions",
    iconName: "Bottle",
    bgGradient: "from-amber-500 to-orange-600",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23F59E0B"/><rect x="42" y="16" width="16" height="12" rx="3" fill="%2378350F"/><rect x="30" y="28" width="40" height="56" rx="10" fill="%23FFFBEB"/><path d="M30 52h40v22c0 5-4 10-10 10H40c-6 0-10-5-10-10V52z" fill="%23D97706" opacity="0.8"/><circle cx="50" cy="40" r="4" fill="%23F59E0B"/></svg>`,
  },
  Injection: {
    category: "Injection",
    label: "Injections / Vials",
    iconName: "Syringe",
    bgGradient: "from-rose-500 to-red-600",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23F43F5E"/><g transform="rotate(45 50 50)"><path d="M42 20h16v40H42z" fill="%23FFF1F2"/><path d="M46 12h8v8h-8z" fill="%23881337"/><path d="M50 60v20" stroke="%23FFF1F2" stroke-width="4"/><path d="M42 35h16M42 45h16" stroke="%23F43F5E" stroke-width="2"/></g></svg>`,
  },
  "Cream/Lotion": {
    category: "Cream/Lotion",
    label: "Creams / Ointments / Tubes",
    iconName: "Tube",
    bgGradient: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%2310B981"/><g transform="rotate(-25 50 50)"><path d="M35 30l30 0l-5 50l-20 0z" fill="%23ECFDF5"/><rect x="42" y="18" width="16" height="12" rx="2" fill="%23064E3B"/><path d="M35 50h28l-2 20h-24z" fill="%23059669" opacity="0.4"/></g></svg>`,
  },
  Ointment: {
    category: "Ointment",
    label: "Ointment / Gel",
    iconName: "Tube",
    bgGradient: "from-teal-500 to-emerald-700",
    textColor: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    badgeBg: "bg-teal-50 dark:bg-teal-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%2314B8A6"/><g transform="rotate(-25 50 50)"><path d="M35 30l30 0l-5 50l-20 0z" fill="%23CCFBF1"/><rect x="42" y="18" width="16" height="12" rx="2" fill="%23134E4A"/><path d="M35 50h28l-2 20h-24z" fill="%230D9488" opacity="0.4"/></g></svg>`,
  },
  "Medical Equipment": {
    category: "Medical Equipment",
    label: "Equipment / Devices",
    iconName: "Stethoscope",
    bgGradient: "from-cyan-500 to-blue-600",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%2306B6D4"/><rect x="25" y="25" width="50" height="50" rx="12" fill="%23ECFEFF"/><path d="M35 50h8l4-10l6 20l6-15l4 5h12" stroke="%230891B2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  "Medical Device": {
    category: "Medical Device",
    label: "Devices & Monitors",
    iconName: "Activity",
    bgGradient: "from-indigo-500 to-cyan-600",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%236366F1"/><rect x="22" y="25" width="56" height="50" rx="10" fill="%23EEF2FF"/><path d="M30 50h8l4-12l6 22l6-16l4 6h12" stroke="%234F46E5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  "Drops/Eye Care": {
    category: "Drops/Eye Care",
    label: "Eye / Ear Drops",
    iconName: "Droplets",
    bgGradient: "from-sky-500 to-blue-600",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    badgeBg: "bg-sky-50 dark:bg-sky-950/60",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230EA5E9"/><path d="M50 20C50 20 28 48 28 64C28 76 38 84 50 84C62 84 72 76 72 64C72 48 50 20 50 20Z" fill="%23F0F9FF"/><circle cx="42" cy="62" r="5" fill="%2338BDF8"/></svg>`,
  },
};

// Helper to get image URL for a product
export function getProductImage(category: string, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl;
  }
  const found = PRODUCT_CATEGORY_PRESETS[category] || PRODUCT_CATEGORY_PRESETS["Tablet"];
  return found.svgDataUri;
}

// Helper to get image URL for a customer party
export function getPartyImage(customUrl?: string, defaultPresetId?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl;
  }
  if (defaultPresetId) {
    const preset = PARTY_AVATAR_PRESETS.find((p) => p.id === defaultPresetId);
    if (preset) return preset.svgDataUri;
  }
  return PARTY_AVATAR_PRESETS[0].svgDataUri;
}
