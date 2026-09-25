/**
 * Deaths outside Bangladesh are not cases.
 * A highway inside the country stays, even when its name includes another city.
 * A body brought home after a death abroad does not.
 */

const COUNTRIES_EN = [
  "saudi arabia",
  "united arab emirates",
  "united kingdom",
  "united states",
  "south korea",
  "south africa",
  "sri lanka",
  "new zealand",
  "hong kong",
  "abu dhabi",
  "fiji",
  "saudi",
  "dubai",
  "qatar",
  "doha",
  "kuwait",
  "oman",
  "bahrain",
  "malaysia",
  "singapore",
  "maldives",
  "nepal",
  "myanmar",
  "india",
  "pakistan",
  "thailand",
  "korea",
  "japan",
  "china",
  "italy",
  "greece",
  "libya",
  "iraq",
  "iran",
  "turkey",
  "ukraine",
  "russia",
  "england",
  "scotland",
  "australia",
  "canada",
  "america",
  "brunei",
  "indonesia",
  "philippines",
  "egypt",
  "jordan",
  "lebanon",
  "syria",
  "yemen",
  "spain",
  "france",
  "germany",
  "portugal",
  "cyprus",
  "malta",
  "romania",
  "poland",
  "taiwan",
  "vietnam",
  "cambodia",
  "laos",
  "afghanistan",
  "mauritius",
];

const COUNTRIES_BN = [
  "সৌদি আরব",
  "সংযুক্ত আরব আমিরাত",
  "দক্ষিণ কোরিয়া",
  "দক্ষিণ আফ্রিকা",
  "শ্রীলঙ্কা",
  "নিউজিল্যান্ড",
  "আবুধাবি",
  "ফিজি",
  "সৌদি",
  "দুবাই",
  "কাতার",
  "দোহা",
  "কুয়েত",
  "ওমান",
  "বাহরাইন",
  "মালয়েশিয়া",
  "মালয়েশিয়া",
  "সিঙ্গাপুর",
  "মালদ্বীপ",
  "নেপাল",
  "মিয়ানমার",
  "মিয়ানমার",
  "ভারত",
  "পাকিস্তান",
  "থাইল্যান্ড",
  "কোরিয়া",
  "কোরিয়া",
  "জাপান",
  "চীন",
  "ইতালি",
  "গ্রিস",
  "লিবিয়া",
  "লিবিয়া",
  "ইরাক",
  "ইরান",
  "তুরস্ক",
  "ইউক্রেন",
  "রাশিয়া",
  "রাশিয়া",
  "ইংল্যান্ড",
  "যুক্তরাজ্য",
  "অস্ট্রেলিয়া",
  "অস্ট্রেলিয়া",
  "কানাডা",
  "আমেরিকা",
  "যুক্তরাষ্ট্র",
  "ব্রুনাই",
  "ইন্দোনেশিয়া",
  "ইন্দোনেশিয়া",
  "ফিলিপাইন",
  "মিশর",
  "জর্ডান",
  "লেবানন",
  "সিরিয়া",
  "সিরিয়া",
  "ইয়েমেন",
  "ইয়েমেন",
  "স্পেন",
  "ফ্রান্স",
  "জার্মানি",
  "পর্তুগাল",
  "সাইপ্রাস",
  "মাল্টা",
  "হংকং",
  "তাইওয়ান",
  "তাইওয়ান",
  "ভিয়েতনাম",
  "ভিয়েতনাম",
  "কম্বোডিয়া",
  "কম্বোডিয়া",
  "লাওস",
  "আফগানিস্তান",
  "মরিশাস",
];

const EN_SORTED = [...COUNTRIES_EN].sort((a, b) => b.length - a.length);
const BN_SORTED = [...COUNTRIES_BN].sort((a, b) => b.length - a.length);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Drop border wording so an India-bound truck inside Bangladesh is not a death abroad. */
function stripBorderTalk(text: string): string {
  return text
    .replace(/India-Bangladesh|Bangladesh-India|Indo-Bangla\w*/gi, " ")
    .replace(/\bIndia-bound\b|\bfrom India\b|\bIndian\b|\bto India\b/gi, " ")
    .replace(/ভারত-বাংলাদেশ|বাংলাদেশ-ভারত|ভারতীয়|ভারতীয়|ভারত থেকে|ভারতগামী|ভারত সীমান্ত/g, " ");
}

function countryIn(text: string): string | null {
  const cleaned = stripBorderTalk(text);
  for (const name of EN_SORTED) {
    const pattern = new RegExp(`(?:^|[^A-Za-z])${escapeRegExp(name)}(?:[^A-Za-z]|$)`, "i");
    if (pattern.test(cleaned)) return name;
  }
  for (const name of ["USA", "U.S.", "U.S.A.", "UK", "U.K.", "UAE", "U.A.E."]) {
    const pattern = new RegExp(`(?:^|[^A-Za-z])${escapeRegExp(name)}(?:[^A-Za-z]|$)`, "i");
    if (pattern.test(cleaned)) return name;
  }
  for (const name of BN_SORTED) {
    if (cleaned.includes(name)) return name;
  }
  return null;
}

/** The place field itself is outside Bangladesh. Empty is not a claim. */
export function locationOutsideBangladesh(locationEn: string | null | undefined, locationBn: string | null | undefined): string | null {
  return countryIn(locationEn ?? "") || countryIn(locationBn ?? "");
}

const DEATH = /\b(killed|died|death|dead)\b|নিহত|মারা গে|মারা যান|মৃত্যু|কবর/;

/**
 * A sentence that places the death in another country.
 * "in Fiji" counts. "Dhaka-Sylhet highway" does not.
 */
export function articleDeathAbroad(text: string): string | null {
  const sentences = text.split(/(?<=[।.!?])/);
  for (const sentence of sentences) {
    if (!DEATH.test(sentence)) continue;
    const cleaned = stripBorderTalk(sentence);
    for (const name of EN_SORTED) {
      const pattern = new RegExp(`\\b(?:in|at|near|outside)\\s+(?:the\\s+)?${escapeRegExp(name)}\\b`, "i");
      if (pattern.test(cleaned)) return name;
    }
    for (const name of BN_SORTED) {
      if (cleaned.includes(name)) return name;
    }
  }
  return null;
}
