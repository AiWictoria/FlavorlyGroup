export type ItemBase = { contentType: "RecipeItem" | "Instruction" | "Comment" };

export type RecipeItemDto = ItemBase & {
    contentType: "RecipeItem";
    ingredientId: string;
    quantity?: number;
    unitId?: string;
};

export type InstructionDto = ItemBase & {
    contentType: "Instruction";
    text: string;
    order?: number;
};

export type CommentDto = ItemBase & {
    contentType: "Comment";
    content: string;
    user?: { id: string; username: string }[];
};

export type RecipePostDto = {
    title: string;
    description?: string;
    recipeImage?: { paths?: string[]; mediaTexts?: string[] };
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    user?: { id: string; username: string }[];
    slug?: string;
    items: (RecipeItemDto | InstructionDto | CommentDto)[];
};


export type RecipeResponse = {
    id: string;
    title: string;
    description?: string;
    recipeImage?: { paths?: string[]; mediaTexts?: string[] };
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    user?: { id: string; username: string };
    items: Array<
        | ({
            contentType: "RecipeItem";
            quantity?: number;
            unit?: { id: string; title: string; unitCode?: string };
            ingredient: { id: string; title?: string; name?: string; slug?: string };
        })
        | ({
            contentType: "Instruction";
            text?: string;
            content?: string;
            order?: number;
            step?: number;
        })
        | ({
            contentType: "Comment";
            content: string;
            user?: { id: string; username: string };
        })
    >;
};
