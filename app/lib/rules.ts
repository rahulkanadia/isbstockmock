export type CompetitionRules = {
  maxActivePicks: number;
  monthlyChangeLimit: number;
  entryPriceRule: "A+B";
};

let activeRules: CompetitionRules = {
  maxActivePicks: 1,
  monthlyChangeLimit: 1,
  entryPriceRule: "A+B",
};

export function getActiveRules() {
  return activeRules;
}

export function updateRules(
  rules: Partial<CompetitionRules>
) {
  activeRules = { ...activeRules, ...rules };
}

export function canChangeThisMonth(
  lastChange: Date | null
) {
  if (!lastChange) return true;
  const now = new Date();
  return (
    lastChange.getMonth() !== now.getMonth() ||
    lastChange.getFullYear() !== now.getFullYear()
  );
}