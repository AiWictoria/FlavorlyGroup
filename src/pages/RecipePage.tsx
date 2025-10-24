import { Button, Col, Dropdown, Row } from "react-bootstrap";
import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";
import RecipeSearchBar from "../components/RecipeSearchBar";
import { sortRecipes } from "../utils/sortRecipes";
import { useAuth } from "../hooks/useAuth";
import { useSavedRecipes } from "../hooks/useSavedRecipes";
import OrderDeliveryAdress from "../components/orderReceipt/OrderDeliveryAdress";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 1,
};

export default function RecipePage() {
  const { recipes } = useRecipes();
  const { user } = useAuth();
  const { savedRecipes } = useSavedRecipes();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"title" | "averageRating">(
    "title"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "saved" | "mine">("all");

  const filtered = recipes
    .filter((r) =>
      [r.title, r.category, r.ingredients, r.instructions].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((r) => {
      if (filterType === "saved") {
        return savedRecipes.some((s) => s.recipeId === r.id);
      }
      if (filterType === "mine") {
        return user && r.userId === user.id;
      }
      return true;
    });
  function handleClear() {
    setSearch("");
    setSortField("title");
    setSortOrder("asc");
    setFilterType("all");
  }
  const sorted = sortRecipes(filtered, sortField, sortOrder);

  return (
    <>
      <OrderDeliveryAdress
        adress="Willgata 13B"
        postcode="123 34"
        city="Willköping"
      />
      <div className="mt-5 pt-5 mb-5">
        <Row className="d-flex align-items-center mx-4 m-md-2 pe-2">
          <Col xs={12} md={4} lg={3}>
            <h2 className="fs-1 ps-0 ps-md-3">Search</h2>
          </Col>
          <Col xs={12} md={8} lg={9} className="mt-2 mt-md-5">
            <RecipeSearchBar onSearch={setSearch} />
          </Col>
        </Row>

        <Row className="g-1 mx-4">
          <Col xs={5}>
            <Dropdown>
              <Dropdown.Toggle
                className="w-100 overflow-hidden p-1"
                variant="secondary"
              >
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
          <Col xs={5}>
            <Dropdown>
              <Dropdown.Toggle
                className="w-100 overflow-hidden p-1"
                variant="secondary"
              >
                Filter
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-100">
                <Dropdown.Item
                  active={filterType === "all"}
                  onClick={() => setFilterType("all")}
                >
                  All Recipes
                </Dropdown.Item>

                {user && (
                  <>
                    <Dropdown.Item
                      active={filterType === "saved"}
                      onClick={() => setFilterType("saved")}
                    >
                      Saved
                    </Dropdown.Item>
                    <Dropdown.Item
                      active={filterType === "mine"}
                      onClick={() => setFilterType("mine")}
                    >
                      My Recipes
                    </Dropdown.Item>
                  </>
                )}
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
          {sorted.map((recipe) => (
            <Col key={recipe.id}>
              <RecipeCard
                recipeId={recipe.id}
                title={recipe.title}
                category={recipe.category}
                imageUrl={recipe.imageUrl}
                commentsCount={recipe.commentsCount}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}
