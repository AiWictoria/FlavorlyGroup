import { Button, Col, Dropdown, Row } from "react-bootstrap";
import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";
import RecipeSearchBar from "../components/RecipeSearchBar";
import { sortRecipes } from "../utils/sortRecipes";
import Box from "../components/shared/Box";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recept",
  index: 1,
  adminOnly: false,
  protected: false,
};

export default function RecipePage() {
  const { recipes } = useRecipes();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"title" | "averageRating">(
    "title"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filtered = recipes.filter((r) =>
    [(r as any).title, (r as any).category, (r as any).description].some(
      (field: any) => field?.toLowerCase().includes(search.toLowerCase())
    )
  );
  function handleClear() {
    setSearch("");
    setSortField("title");
    setSortOrder("asc");
  }
  const sorted = sortRecipes(filtered, sortField, sortOrder);

  return (
    <>
      <Box size="xl">
        <div className="mb-5">
          <Row className="d-flex align-items-center mx-md-4 m-2 pe-2">
            <Col xs={12} md={4} lg={3}>
              <h2 className="fs-1 ps-0 ps-md-3">Recept</h2>
            </Col>
            <Col xs={12} md={8} lg={9} className="mt-2 mt-md-5">
              <RecipeSearchBar onSearch={setSearch} />
            </Col>
          </Row>

          <Row className="g-1 mx-4">
            <Col xs={10}>
              <Dropdown>
                <Dropdown.Toggle
                  className="w-100 overflow-hidden p-1"
                  variant="secondary"
                >
                  Sortera
                </Dropdown.Toggle>

                <Dropdown.Menu className="w-100">
                  <Dropdown.Header>Fält</Dropdown.Header>
                  <Dropdown.Item
                    active={sortField === "title"}
                    onClick={() => setSortField("title")}
                  >
                    Namn
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortField === "averageRating"}
                    onClick={() => setSortField("averageRating")}
                  >
                    Betyg
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Header>Ordning</Dropdown.Header>
                  <Dropdown.Item
                    active={sortOrder === "asc"}
                    onClick={() => setSortOrder("asc")}
                  >
                    Stigande ↑
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortOrder === "desc"}
                    onClick={() => setSortOrder("desc")}
                  >
                    Fallande ↓
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col xs={2}>
              <Button
                className="w-100 overflow-hidden p-1 text-primary"
                variant="outline-secondary"
                onClick={handleClear}
              >
                ✕
              </Button>
            </Col>
          </Row>

          <Row xs={1} md={2} lg={3} xxl={4} className="m-2 g-4">
            {sorted.map((recipe) => {
              const anyRec: any = recipe as any;
              const imagePath: string | undefined =
                anyRec.image || anyRec?.recipeImage?.paths?.[0];
              const imageUrl = imagePath ? `/media/${imagePath}` : undefined;
              const category = anyRec.category ?? anyRec.description ?? "";
              return (
                <Col key={recipe.id}>
                  <RecipeCard
                    recipeId={recipe.id as any}
                    title={recipe.title}
                    category={category}
                    imageUrl={imageUrl}
                    commentsCount={
                      (anyRec.comments?.length as number) ||
                      anyRec.commentsCount
                    }
                  />
                </Col>
              );
            })}
          </Row>
        </div>
      </Box>
    </>
  );
}
