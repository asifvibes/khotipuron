import type { CaseRow, Lang } from "@/data/types";
import { countdownDate } from "@/data/logic";

type Idle = "walk" | "sit";

const SIT_BN = "আপনি যেমন করে প্রায়ই গাছের নিচে বসে থাকেন, তেমনি করেই";
const WALK_BN = "আপনি যেমন প্রায়ই রাস্তা পার হন, তেমনি ভাবে";
const SIT_EN = "Just as you often sit under a tree,";
const WALK_EN = "Just as you often cross the road,";

/** The act the article states. No name, no amount, no invented rest. */
const ACT: Record<string, { bn: string; en: string }> = {
  "khalid-rahman-kurigram": {
    bn: "কুড়িগ্রাম শহর থেকে মোটরসাইকেলে বাড়ি ফিরছিলেন",
    en: "was returning home from Kurigram town on a motorcycle",
  },
  "corporal-pias-hsia": {
    bn: "দায়িত্বে ছিলেন",
    en: "was on duty",
  },
  "niyamat-ali-osmaninagar": {
    bn: "সিএনজি অটোরিকশায় ছিলেন",
    en: "was in a CNG-run auto-rickshaw",
  },
  "akhi-akter-dhamrai": {
    bn: "মইনুল ঘাটে বেড়াতে গিয়ে অটোরিকশায় বাড়ি ফিরছিলেন",
    en: "was returning home by auto-rickshaw after an outing to Moinul Ghat",
  },
  "nadim-sheikh-gopalganj": {
    bn: "ট্রাক চালাচ্ছিলেন",
    en: "was driving a truck",
  },
  "rabeya-akhter-katiadi": {
    bn: "সিএনজি অটোরিকশার যাত্রী ছিলেন",
    en: "was a passenger in a CNG-run auto-rickshaw",
  },
  "abdur-razzak-haluaghat-road": {
    bn: "ছিলেন",
    en: "was there",
  },
  "sohel-kazi-jhenaidah": {
    bn: "স্ত্রীর বাবার বাড়ির দিকে মোটরসাইকেলে যাচ্ছিলেন",
    en: "was riding a motorcycle towards his wife's parents' home",
  },
  "mimtah-karnaphuli": {
    bn: "বড় বোনের বিয়ের অনুষ্ঠান থেকে কক্সবাজারের বাড়ির পথে ফিরছিলেন",
    en: "was returning home to Cox's Bazar from her elder sister's wedding",
  },
  "amjad-gazi-abhaynagar": {
    bn: "নোয়াপাড়া থেকে যশোরের দিকে মোটরসাইকেলে যাচ্ছিলেন",
    en: "was travelling by motorcycle from Noapara towards Jashore",
  },
  "nafisa-nawal-patenga": {
    bn: "আইসিটি পরীক্ষা দিতে রাইডশেয়ারের মোটরসাইকেলে যাচ্ছিলেন",
    en: "was going to an ICT exam on a ride-sharing motorcycle",
  },
  "chan-mia-kabir-jatrabari": {
    bn: "মোটরসাইকেল চালাচ্ছিলেন",
    en: "was riding a motorcycle",
  },
  "tasfia-ahmed-tisha-khilgaon": {
    bn: "বাড়ি ফিরছিলেন, হেঁটে না মোটরসাইকেলে তা পুলিশ নিশ্চিত করতে পারেনি",
    en: "was returning home, and the police could not confirm whether on foot or by motorcycle",
  },
  "shampa-begum-ghoraghat": {
    bn: "বিয়েতে মোটরসাইকেলে যাচ্ছিলেন",
    en: "was going to a wedding on a motorcycle",
  },
  "hridoy-hossain-kuchiamora": {
    bn: "মোটরসাইকেল চালাচ্ছিলেন",
    en: "was riding a motorcycle",
  },
  "lipi-begum-gurudaspur": {
    bn: "গাজীপুর থেকে নাটোরে একটি মরদেহ নিয়ে যাওয়া অ্যাম্বুলেন্সে ছিলেন",
    en: "was in an ambulance carrying a body from Gazipur to Natore",
  },
  "anwar-ishwardi": {
    bn: "ছেলের বিয়ের কেনাকাটা সেরে মোটরসাইকেলে বাড়ি ফিরছিলেন",
    en: "was returning home on a motorcycle after shopping for his son's wedding",
  },
  "delwar-hossain-bayezid": {
    bn: "রাস্তা পার হচ্ছিলেন",
    en: "was crossing the road",
  },
  "abdus-salam-madaripur": {
    bn: "থানায় ফেরা পুলিশের পিকআপে ছিলেন",
    en: "was in a police pickup heading back to the station",
  },
  "chayan-molla-bhanga": {
    bn: "মোটরসাইকেল চালিয়ে বাড়ি ফিরছিলেন",
    en: "was riding a motorcycle home",
  },
  "asadullah-kaliakair": {
    bn: "ছিলেন",
    en: "was there",
  },
  "shamim-kapasia": {
    bn: "ছিলেন",
    en: "was there",
  },
  "ashik-ahmed-bohuti": {
    bn: "সিএনজি অটোরিকশা চালাচ্ছিলেন",
    en: "was driving a CNG-run auto-rickshaw",
  },
  "firoz-ahmed-lohagara": {
    bn: "মোটরসাইকেল চালাচ্ছিলেন",
    en: "was riding a motorcycle",
  },
  "aslam-hossain-talukdar-bazar": {
    bn: "রাস্তার পাশে ট্রাকের যান্ত্রিক ত্রুটি সারাচ্ছিলেন",
    en: "was fixing a truck's mechanical fault at the roadside",
  },
  "hira-mia-pateshwari": {
    bn: "কুড়িগ্রাম থেকে নাগেশ্বরীর দিকে মোটরসাইকেলে যাচ্ছিলেন",
    en: "was travelling by motorcycle from Kurigram towards Nageshwari",
  },
  "saddam-hossain-ullapara": {
    bn: "শাহজাদপুর বাজারের দিকে যাওয়া একটি পিকআপে ছিলেন",
    en: "was in a pickup heading towards Shahzadpur Bazar",
  },
  "meherun-begum-korail": {
    bn: "সিটি করপোরেশনের স্থানান্তর স্টেশন থেকে পুনর্ব্যবহারযোগ্য জিনিস তুলছিলেন",
    en: "was collecting recyclable things at a city corporation transfer station",
  },
  "jahurul-haque-hatibandha": {
    bn: "ব্যাটারিচালিত ইজিবাইকের যাত্রী ছিলেন",
    en: "was a passenger on a battery-run easy bike",
  },
  "alamgir-hossain-kaliakair": {
    bn: "পিকআপের যাত্রী ছিলেন",
    en: "was a passenger in a pickup",
  },
  "jasim-uddin-chakaria": {
    bn: "লাগুনায় যাত্রী ছিলেন",
    en: "was a passenger in a Laguna",
  },
  "abdul-gafur-purbadhala": {
    bn: "পিকআপের যাত্রী ছিলেন",
    en: "was a passenger in a pickup",
  },
  "samiul-haque-jamalpur": {
    bn: "ঢাকার লালমাটিয়া থেকে গাড়িতে জামালপুরে ফিরছিলেন",
    en: "was returning to Jamalpur from Lalmatia in Dhaka by car",
  },
  "babul-hasan-erulia": {
    bn: "নওগাঁর দিকে মোটরসাইকেল চালাচ্ছিলেন",
    en: "was riding a motorcycle towards Naogaon",
  },
  "abdur-rahman-noyabazar": {
    bn: "গবাদিপশু নিয়ে একটি অগভীর যান্ত্রিক যানে যাচ্ছিলেন",
    en: "was travelling with livestock in a shallow mechanised vehicle",
  },
  "monsur-ali-nalka": {
    bn: "ছিলেন",
    en: "was there",
  },
  "meghrani-chakma-rangamati": {
    bn: "কুটুকছড়ি বাজারে বিক্রির মাল নিয়ে যাচ্ছিলেন",
    en: "was taking goods to sell at Kutukchhari Bazar",
  },
  "firoza-begum-shibganj": {
    bn: "মেয়ের বাড়িতে যেতে রাস্তা পার হচ্ছিলেন",
    en: "was crossing the road on the way to her daughter's house",
  },
  "abu-sayeed-erulia": {
    bn: "ছিলেন",
    en: "was there",
  },
  "peheli-bhairabi-osmaninagar": {
    bn: "সিলেটে অনুষ্ঠানে গান গেয়ে ঢাকার পথে ছিলেন",
    en: "was on the way to Dhaka after singing at an event in Sylhet",
  },
  "mehedi-hasan-mim-baridhara": {
    bn: "ফুটপাতে বসে ছিলেন",
    en: "was sitting on the footpath",
  },
  "unnamed-cng-passenger-trishal": {
    bn: "সিএনজি অটোরিকশার যাত্রী ছিলেন",
    en: "was a passenger in a CNG-run auto-rickshaw",
  },
  "unnamed-bus-passenger-muksudpur": {
    bn: "বাসের যাত্রী ছিলেন",
    en: "was a passenger on a bus",
  },
  "unnamed-bus-passenger-shahrasti": {
    bn: "বাসের যাত্রী ছিলেন",
    en: "was a passenger on a bus",
  },
  "tapas-sarkar-bogura": {
    bn: "নিজের ট্রাকের পাংচার হওয়া চাকা সারাচ্ছিলেন",
    en: "was repairing a punctured wheel of his own truck",
  },
  "nur-alam-patharghata": {
    bn: "মাছ ধরতে গিয়েছিলেন",
    en: "had gone fishing",
  },
  "sumaiya-nizamuddin-chapai": {
    bn: "নদীতে গোসল করছিলেন",
    en: "was bathing in the river",
  },
  "obaidullah-shitalakshya": {
    bn: "লাখপুরে একটি বাড়ি বেড়াতে এসে নদীতে গোসল করছিলেন",
    en: "was bathing in the river while visiting a home in Lakhpur",
  },
  "asekin-sonargaon": {
    bn: "নদীতে গোসল করছিলেন",
    en: "was bathing in the river",
  },
  "fayez-ahmed-sonadia": {
    bn: "মাছ ধরতে গিয়েছিলেন",
    en: "had gone fishing",
  },
  "robiul-hossain-benapole": {
    bn: "আমদানি করা মাল খালাস করছিলেন",
    en: "was unloading imported goods",
  },
  "amarendra-nath-bhowmik": {
    bn: "মেশিন দিয়ে গবাদিপশুর ঘাস কাটছিলেন",
    en: "was cutting grass for livestock with a machine",
  },
  "enayet-khan-gopalganj": {
    bn: "জমিতে সেচ দিতে বৈদ্যুতিক পাম্পের সংযোগ দিচ্ছিলেন",
    en: "was connecting an electric pump to irrigate a field",
  },
  "abdul-alim-sujon-sitakunda": {
    bn: "ইয়ার্ডে নিরাপত্তা কর্মকর্তা হিসেবে কাজ করতেন",
    en: "was working as a safety officer at the yard",
  },
  "imran-hossain-gabtoli": {
    bn: "একটি হিমায়িত মাছের ট্রাক সারাচ্ছিলেন এবং গ্যাস সিলিন্ডার ভরছিলেন",
    en: "was repairing a refrigerated fish truck and refilling its gas cylinder",
  },
  "zainab-begum-ashulia": {
    bn: "দোকানে বসে ছিলেন",
    en: "was sitting at a shop",
  },
  "newaz-chowdhury-mitu": {
    bn: "ফ্ল্যাটে কম্পিউটারে কাজ করছিলেন",
    en: "was working on a computer in a flat",
  },
  "maruf-bandar": {
    bn: "বাড়িতে ছিলেন",
    en: "was at home",
  },
  "delwar-hossain-mintu-sholoshahar": {
    bn: "রেললাইনে খেলা একটি শিশুকে বাঁচাতে গিয়েছিলেন",
    en: "had gone to save a child who was playing on the railway tracks",
  },
  "jotsna-begum-cumilla-station": {
    bn: "নাতনিকে ডাক্তারের কাছে নিয়ে বাসস্ট্যান্ডের পথে রেললাইন পার হচ্ছিলেন",
    en: "was crossing the rail line on the way to the bus stand after taking her granddaughter to a doctor",
  },
  "nazma-khatun-bhogra": {
    bn: "জলাবদ্ধ রাস্তায় পা দিচ্ছিলেন",
    en: "was stepping onto a flooded stretch of road",
  },
  "smriti-chotora": {
    bn: "মায়ের সঙ্গে বিয়ের দাওয়াত থেকে বাড়ি ফিরছিলেন",
    en: "was returning home from a wedding with her mother",
  },
  "saidul-islam-agrabad": {
    bn: "বাড়ির বাইরে খোলা ড্রেনের কাছে খেলছিলেন",
    en: "was playing near an open drain outside his home",
  },
  "faria-tasnim-tongi": {
    bn: "খোলা ড্রেনে পড়ে নিখোঁজ হয়েছিলেন",
    en: "had gone missing after falling into an open drain",
  },
  "jalal-mia-kamrangirchar": {
    bn: "বাড়ির সামনে দাঁড়িয়ে ছিলেন",
    en: "was standing in front of his home",
  },
  "mahid-islam-vatara": {
    bn: "খেলছিলেন",
    en: "was playing",
  },
};

export function momentLine(row: CaseRow, idle: Idle, lang: Lang): string {
  const act = ACT[row.id];
  if (!act) throw new Error(`missing countdown act for ${row.id}`);
  const you = lang === "bn" ? (idle === "sit" ? SIT_BN : WALK_BN) : idle === "sit" ? SIT_EN : WALK_EN;
  const date = row.incidentDate ? countdownDate(row.incidentDate, lang) : "";
  if (lang === "bn") {
    const when = date ? `${date} একজন মানুষ ${act.bn}` : `একজন মানুষ ${act.bn}`;
    return `${you} ${when}।`;
  }
  const when = date ? `${date}, a person ${act.en}` : `a person ${act.en}`;
  return `${you} ${when}.`;
}
