import { Col, Row } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 1,
};

export default function RecipePage() {
  const { recipes } = useRecipes();
  return (
    <>
      <h2 className="mt-3">Recipes</h2>
      <Row xs={1} md={2} lg={3} xxl={4} className="mt-2 g-4">
        {recipes.map((recipe) => (
          <Col key={recipe.recipeId}>
            <RecipeCard
              recipeId={recipe.recipeId}
              title={recipe.title}
              category={recipe.category}
              imageUrl={recipe.imageUrl}
              averageRating={recipe.averageRating}
              commentsCount={recipe.commentsCount}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}
