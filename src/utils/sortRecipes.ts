import type { Recipe } from "../hooks/useRecipes";

export type SortField = "title" | "averageRating";
export type SortOrder = "asc" | "desc";

function getComparableValue(recipe: Recipe, field: SortField): string | number {
  if (field === "title") {
    return recipe.title?.toLowerCase() ?? "";
  }

  if (field === "averageRating") {
    return recipe.averageRating ?? 0;
  }

  return "";
}

function compareValues(
  a: string | number,
  b: string | number,
  order: SortOrder
): number {
  if (a < b) return order === "asc" ? -1 : 1;
  if (a > b) return order === "asc" ? 1 : -1;
  return 0;
}

export function sortRecipes(
  recipes: Recipe[],
  field: SortField,
  order: SortOrder
): Recipe[] {
  const sortedRecipes = [...recipes];

  return sortedRecipes.sort((a, b) => {
    const valueA = getComparableValue(a, field);
    const valueB = getComparableValue(b, field);

    return compareValues(valueA, valueB, order);
  });
}
