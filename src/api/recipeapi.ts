import type { RecipePostDto, RecipeResponse } from "@models/recipe";

const BASE = "/api";

export async function createRecipe(dto: RecipePostDto): Promise<RecipeResponse> {
    const res = await fetch(`${BASE}/Recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `POST /Recipe failed (${res.status})`);
    }
    return res.json();
}

export async function getRecipe(id: string): Promise<RecipeResponse> {
    const res = await fetch(`${BASE}/Recipe/${id}`);
    if (!res.ok) throw new Error(`GET /Recipe/${id} failed (${res.status})`);
    return res.json();
}

export async function deleteRecipe(id: string): Promise<{ success: boolean; id?: string }> {
    const res = await fetch(`${BASE}/Recipe/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `DELETE /Recipe/${id} failed (${res.status})`);
    }
    return res.json();
}

export async function updateRecipe(
    id: string,
    patch: Partial<RecipePostDto>
): Promise<RecipeResponse> {
    const res = await fetch(`${BASE}/Recipe/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `PUT /Recipe/${id} failed (${res.status})`);
    }
    return res.json();
}

export function normalizeRecipe(r: RecipeResponse) {
    return {
        id: r.id,
        title: r.title,
        image: r.recipeImage?.paths?.[0] ?? null,
        author: r.user?.username ?? null,
        prep: r.prepTimeMinutes ?? null,
        cook: r.cookTimeMinutes ?? null,
        servings: r.servings ?? null,
        ingredients: r.items
            .filter(i => i.contentType === "RecipeItem")
            .map(i => ({
                ingredientId: (i as any).ingredient?.id,
                ingredientName:
                    (i as any).ingredient?.title ||
                    (i as any).ingredient?.name ||
                    "(okänd ingrediens)",
                quantity: (i as any).quantity ?? null,
                unitTitle: (i as any).unit?.title ?? null,
            })),
        instructions: r.items
            .filter(i => i.contentType === "Instruction")
            .sort((a: any, b: any) => (a.order ?? a.step ?? 0) - (b.order ?? b.step ?? 0))
            .map((i: any, idx: number) => i.text ?? i.content ?? `Steg ${idx + 1}`),
        comments: r.items
            .filter(i => i.contentType === "Comment")
            .map((i: any) => ({
                text: i.content,
                by: i.user?.username ?? "Anonym",
            })),
    };
}
