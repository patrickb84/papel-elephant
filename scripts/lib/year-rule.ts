// The "painted in the same year" rule, shared by the artwork search (step 4)
// and the final check before publishing (step 6).
//
// A painting qualifies when its date is within `tolerance` years of the book's
// publication year. Museums often give a range ("1803–15") or a circa date
// ("c. 1850", stored as a range): a range counts only when it is at most
// `maxRange` years wide AND reaches within `tolerance` of the publication
// year. Otherwise a vague date could claim a match it doesn't have.

export interface YearRule {
  tolerance: number;
  maxRange: number;
}

export function yearCheck(year: number, start: number, end: number, rule: YearRule): { ok: boolean; gap: number; why?: string } {
  const lo = Math.min(start, end), hi = Math.max(start, end);
  const gap = year < lo ? lo - year : year > hi ? year - hi : 0;
  if (hi - lo > rule.maxRange) return { ok: false, gap, why: `date range ${lo}–${hi} is wider than ${rule.maxRange} years` };
  if (gap > rule.tolerance) return { ok: false, gap, why: `painted ${gap} years from publication (allowed: ${rule.tolerance})` };
  return { ok: true, gap };
}

export const ruleFromConfig = (config: { artYearTolerance: number; artMaxDateRange: number }): YearRule => ({
  tolerance: config.artYearTolerance,
  maxRange: config.artMaxDateRange,
});
