import type { Recipe } from "../hooks/useRecipes";

export type SortField = "title" | "averageRating";
export type SortOrder = "asc" | "desc";

export function sortRecipes(
  recipes: Recipe[],
  field: SortField,
  order: SortOrder
): Recipe[] {
  return [...recipes].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    if (field === "title") {
      aVal = a.title?.toLowerCase?.() ?? "";
      bVal = b.title?.toLowerCase?.() ?? "";
    } else if (field === "averageRating") {
      aVal = a.averageRating ?? 0;
      bVal = b.averageRating ?? 0;
    }

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}
