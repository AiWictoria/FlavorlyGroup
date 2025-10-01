import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";
import RecipeSearchBar from "../components/RecipeSearchBar";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 1,
};

export default function RecipePage() {
  const { recipes } = useRecipes();

  const [search, setSearch] = useState("");

  const filtered = recipes.filter((r) =>
    [r.title, r.category, r.ingredients, r.instructions].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

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

        <Row>
          <Col xs={12} md={4} lg={3}></Col>
          <Col
            xs={12}
            md={8}
            lg={9}
            className="d-flex align-items-center justify-content-md-end pe-md-5 ps-5"
          >
            <Button>Sort</Button>
            <Button>Filter</Button>
          </Col>
        </Row>

        <Row xs={1} md={2} lg={3} xxl={4} className="m-2 g-4">
          {filtered.map((recipe) => (
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
