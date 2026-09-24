export type SceneType =
  | "road"
  | "open_drain"
  | "workplace"
  | "fire"
  | "river"
  | "rail"
  | "neglect";

export type AmountKind =
  | "demanded"
  | "promised"
  | "said_handed"
  | "court"
  | "government"
  | "insurance"
  | "employer"
  | "none";

export type Sex = "female" | "male" | "not_stated";

export type ExtraSource = {
  url: string;
  outlet: string;
  published: string;
};

export type AlsoAmount = {
  amountBdt: number;
  amountKind: AmountKind;
  quoteEn: string;
  quoteBn: string;
};

export type CaseImage = {
  url: string;
  creditEn: string;
  creditBn: string;
  articlePicturesVictim: boolean;
};

export type CaseRow = {
  id: string;
  scene: SceneType;
  url: string;
  outlet: string;
  published: string;
  incidentDate: string | null;
  locationEn: string;
  locationBn: string;
  nameEn: string | null;
  nameBn: string | null;
  age: number | null;
  sex: Sex;
  doingEn: string | null;
  doingBn: string | null;
  /** Countdown act when this case is not in the hand-written list. No name, no amount. */
  actEn?: string;
  actBn?: string;
  amountBdt: number | null;
  amountKind: AmountKind;
  /** True when the article says the amount was paid or handed over. */
  paid?: boolean;
  quoteEn: string;
  quoteBn: string;
  also: AlsoAmount | null;
  noteEn: string | null;
  noteBn: string | null;
  extraSources: ExtraSource[];
  othersDied: boolean;
  image?: CaseImage | null;
};

export type Lang = "bn" | "en";
