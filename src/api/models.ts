export type UnitDto = { id: string; title: string; unitCode?: string };
export type ProductDto = {
    id: string;
    title: string;
    price: number | string | null | undefined;
    image?: { paths?: string[] };
    slug?: string;
};
export type IngredientDto = {
    id: string;
    title?: string;
    name?: string;
    unit?: UnitDto;
    product?: ProductDto | ProductDto[] | null;
};

export type Unit = { id: string; title: string; unitCode?: string };
export type Product = { id: string; name: string; price: number; imageUrl?: string; slug?: string };
export type Ingredient = {
    id: string;
    title: string;
    baseUnit?: Unit;
    products: Product[];
};

const toNumber = (value: unknown) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
        const n = parseFloat(value.replace(",", "."));
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};
//ibland är product ett objekt, ({ id: "1", title: "Lammstek" }) ibland en lista ([{ id: "1" }, { id: "2" }]) och ibland null. oavsätt ska det alltid bli en array
const toArray = <T>(value: T | T[] | null | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : [];

export function mapIngredient(dto: IngredientDto): Ingredient {
    const title = dto.title ?? dto.name ?? "";
    const products = toArray(dto.product).map((p) => ({
        id: p.id,
        name: p.title,
        price: toNumber(p.price),
        imageUrl: p.image?.paths?.[0],
        slug: p.slug ?? "",
    }));

    return {
        id: dto.id,
        title,
        baseUnit: dto.unit
            ? { id: dto.unit.id, title: dto.unit.title, unitCode: dto.unit.unitCode }
            : undefined,
        products,
    };
}
