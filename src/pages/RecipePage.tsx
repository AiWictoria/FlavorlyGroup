import { Button, Col, Dropdown, Row } from "react-bootstrap";
import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";
import RecipeSearchBar from "../components/RecipeSearchBar";
import { sortRecipes } from "../utils/sortRecipes";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 1,
};

export default function RecipePage() {
  const { recipes } = useRecipes();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"title" | "averageRating">(
    "title"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filtered = recipes.filter((r) =>
    [r.title, r.category, r.ingredients, r.instructions].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = sortRecipes(filtered, sortField, sortOrder);

  return (
    <>
      <div className="mt-5 pt-5">
        <Row className="d-flex align-items-center mx-4 m-md-2 pe-2">
          <Col xs={12} md={4} lg={3}>
            <h2 className="fs-1 ps-0 ps-md-3">Search</h2>
          </Col>
          <Col xs={12} md={8} lg={9} className="mt-2 mt-md-5">
            <RecipeSearchBar onSearch={setSearch} />
          </Col>
        </Row>

        <Row className="g-2 mx-4">
          <Col xs={6} md={3}>
            <Dropdown>
              <Dropdown.Toggle className="w-100" variant="primary">
                Sort
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-100">
                <Dropdown.Header>Field</Dropdown.Header>
                <Dropdown.Item
                  active={sortField === "title"}
                  onClick={() => setSortField("title")}
                >
                  Name
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortField === "averageRating"}
                  onClick={() => setSortField("averageRating")}
                >
                  Rating
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>Order</Dropdown.Header>
                <Dropdown.Item
                  active={sortOrder === "asc"}
                  onClick={() => setSortOrder("asc")}
                >
                  Ascending ↑
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOrder === "desc"}
                  onClick={() => setSortOrder("desc")}
                >
                  Descending ↓
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col xs={6} md={3}>
            <Button className="w-100">Filter</Button>
          </Col>
          <Col xs={6} md={3}>
            <Button className="w-100">Saved recipes</Button>
          </Col>
          <Col xs={6} md={3}>
            <Button className="w-100">My recipes</Button>
          </Col>
        </Row>

        <Row xs={1} md={2} lg={3} xxl={4} className="m-2 g-4">
          {sorted.map((recipe) => (
            <Col key={recipe.id}>
              <RecipeCard
                recipeId={recipe.id}
                title={recipe.title}
                category={recipe.category}
                imageUrl={recipe.imageUrl}
                averageRating={recipe.averageRating}
                commentsCount={recipe.commentsCount}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}
