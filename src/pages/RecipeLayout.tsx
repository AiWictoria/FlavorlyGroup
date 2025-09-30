import { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import type { Recipe } from "../hooks/useRecipes";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
}

export default function RecipeLayout({ mode, recipe }: RecipeLayoutProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const roundedRating = Math.round(recipe?.averageRating ?? 0);

  return (
    <>
      <div className="mt-4 pt-4 mt-lg-4 pt-lg-5">
        <Row>
          <Col lg={6} className="p-0 order-lg-2">
            <div className="ratio ratio-16x9 rounded">
              <img
                src={recipe?.imageUrl || "/images/recipes/placeholder.png"}
                alt={recipe?.title || "Recipe image"}
                className="object-fit-cover"
              />
            </div>
            {isView && (
              <>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="mx-4 fs-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${
                          star <= roundedRating
                            ? "bi-star-fill text-warning"
                            : "bi-star"
                        }`}
                      />
                    ))}
                  </div>
                  <Button variant="danger" className="mx-2 mx-sm-4 mx-lg-4 m-1">
                    <i className="bi bi-heart"> Save</i>
                  </Button>
                </div>
              </>
            )}
            {!isView && (
              <Form.Group>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    const fileInput = e.target as HTMLInputElement;
                    const file = fileInput.files?.[0] || null;
                  }}
                />
              </Form.Group>
            )}
          </Col>

          <Col md={6} className=" mt-3 pt-4 px-5">
            {isView && <h1 className="fs-1">{recipe?.title || "Title"}</h1>}
            {!isView && (
              <Form.Group>
                <Form.Label className="fs-1"> Title </Form.Label>
                <Form.Control placeholder="Enter Title" />
              </Form.Group>
            )}

            {isView && <h4>{recipe?.category || "Category"}</h4>}
            {!isView && (
              <Form.Group>
                <Form.Label className="fs-2"> Category </Form.Label>
                <Form.Control placeholder="Enter Category" />
              </Form.Group>
            )}
            <div className="pt-4">
              <h2>Ingredients</h2>
              {/* Checkbox for creating shoppinglist in future */}
              {isView && (
                <>
                  <ul className="list-unstyled">
                    {recipe?.ingredients?.split(",").map((ingredient, i) => (
                      <li key={i} className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          id={`ingredient-${i}`}
                          className="m-2 fs-4"
                        />
                        {ingredient.trim()}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline-primary">
                    Add to shopping list
                  </Button>
                </>
              )}

              {!isView && (
                <>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Control placeholder="Enter Category" />
                    <Button variant="outline-danger" size="sm" className="ms-2">
                      -
                    </Button>
                  </Form.Group>
                  <Button variant="outline-primary" size="sm">
                    + Add ingredient
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>
        <Row className="mx-4 pb-5">
          <Col lg={8} className="mx-auto text-lg-center">
            <div className="pt-4">
              <h2>Instructions</h2>
              {isView && (
                <ul className="list-unstyled">
                  {recipe?.instructions?.split(",").map((instructions, i) => (
                    <li key={i} className="d-flex align-items-center unstyled">
                      <Form.Check
                        type="checkbox"
                        id={`ingredient-${i}`}
                        className="m-2 fs-4"
                      />
                      {instructions.trim()}
                    </li>
                  ))}
                </ul>
              )}

              {!isView && (
                <>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Control placeholder="Step" />
                    <Button variant="outline-danger" size="sm" className="ms-2">
                      -
                    </Button>
                  </Form.Group>
                  <Button variant="outline-primary" size="sm">
                    + Add step
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>

        {!isView && (
          <Button type="submit" className="bg-success">
            Save Recipe
          </Button>
        )}
      </div>
    </>
  );
}
