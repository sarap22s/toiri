// Server-authoritative credit packs. Prices and credit amounts are never
// taken from the browser — the checkout route looks them up here by id.
export type Pack = {
  id: string;
  name: string;
  nameBn: string;
  credits: number;
  amountBDT: number;
};

export const PACKS: Pack[] = [
  { id: "starter", name: "Starter", nameBn: "স্টার্টার", credits: 50, amountBDT: 200 },
  { id: "builder", name: "Builder", nameBn: "বিল্ডার", credits: 150, amountBDT: 500 },
  { id: "studio", name: "Studio", nameBn: "স্টুডিও", credits: 400, amountBDT: 1200 },
];

export function findPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}
