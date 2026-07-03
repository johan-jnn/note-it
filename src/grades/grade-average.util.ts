import { Grade } from './entities/grade.entity';

export const SUBJECT_VALIDATION_THRESHOLD = 10;

/**
 * Weighted average of a set of grades, each grade being normalized to a
 * /20 scale (using its assignment's `scale`) and weighted by its
 * assignment's `coefficient`. Returns null when there is nothing to
 * average (no grades, or a total coefficient of 0).
 */
export function computeWeightedAverage(grades: Grade[]): number | null {
  if (grades.length === 0) {
    return null;
  }

  const { weightedSum, totalCoefficient } = grades.reduce(
    (acc, grade) => {
      const normalizedValue = (grade.value / grade.assignment.scale) * 20;
      const coefficient = grade.assignment.coefficient;
      return {
        weightedSum: acc.weightedSum + normalizedValue * coefficient,
        totalCoefficient: acc.totalCoefficient + coefficient,
      };
    },
    { weightedSum: 0, totalCoefficient: 0 },
  );

  if (totalCoefficient === 0) {
    return null;
  }

  return weightedSum / totalCoefficient;
}

/**
 * A subject is considered validated when the average is at least equal to
 * the threshold (10/20 by default). Returns null when there is no average
 * to judge (e.g. no grades yet).
 */
export function isSubjectValidated(
  average: number | null,
  threshold: number = SUBJECT_VALIDATION_THRESHOLD,
): boolean | null {
  if (average === null) {
    return null;
  }
  return average >= threshold;
}
