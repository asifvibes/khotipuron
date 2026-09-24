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
  amountBdt: number | null;
  amountKind: AmountKind;
  quoteEn: string;
  quoteBn: string;
  also: AlsoAmount | null;
  noteEn: string | null;
  noteBn: string | null;
  extraSources: ExtraSource[];
  othersDied: boolean;
};

export type Lang = "bn" | "en";
