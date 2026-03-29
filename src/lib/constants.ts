export const PREDEFINED_SUBJECTS = [
  { key: "anatomy", name: "Anatomy" },
  { key: "physiology", name: "Physiology" },
  { key: "biochemistry", name: "Biochemistry" },
  { key: "community_medicine", name: "Community Medicine" },
  { key: "forensic_medicine", name: "Forensic Medicine" },
] as const;

export type SubjectKey = (typeof PREDEFINED_SUBJECTS)[number]["key"];

export const SUBJECT_OPTIONS = PREDEFINED_SUBJECTS.map((s) => ({
  value: s.key,
  label: s.name,
}));

/** Daily planner: meals, movement, hygiene, breaks — not counted as “study hours”. */
export const LIFE_ACTIVITY_OPTIONS = [
  { value: "life_dinner", label: "Dinner / meals" },
  { value: "life_walking", label: "Walking" },
  { value: "life_games", label: "Games" },
  { value: "life_wash", label: "Shower / wash" },
  { value: "life_exercise", label: "Exercise / gym" },
  { value: "life_break", label: "Break / rest" },
  { value: "life_chores", label: "Chores / errands" },
  { value: "life_social", label: "Social" },
  { value: "life_other", label: "Other (describe in title)" },
] as const;

export type LifeActivityKey = (typeof LIFE_ACTIVITY_OPTIONS)[number]["value"];

const STUDY_KEYS = new Set<string>(PREDEFINED_SUBJECTS.map((s) => s.key));
const LIFE_KEYS = new Set<string>(LIFE_ACTIVITY_OPTIONS.map((s) => s.value));

export function countsTowardStudyHours(subjectKey: string): boolean {
  return STUDY_KEYS.has(subjectKey);
}

export function isLifePlannerActivity(subjectKey: string): boolean {
  return LIFE_KEYS.has(subjectKey);
}

/** Label for planner timeline / dashboard task rows (study or life). */
export function plannerActivityLabel(subjectKey: string): string {
  const study = SUBJECT_OPTIONS.find((o) => o.value === subjectKey);
  if (study) return study.label;
  const life = LIFE_ACTIVITY_OPTIONS.find((o) => o.value === subjectKey);
  if (life) return life.label;
  return subjectKey;
}
