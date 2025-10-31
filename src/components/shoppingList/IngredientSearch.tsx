import { useState, useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";

export interface Ingredient {
  id: number;
  title: string;
  unitId: number;
  unit: Unit;
}

export interface Unit {
  title: string;
}

interface IngredientSearchProps {
  onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientSearch({ onSelect }: IngredientSearchProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedIngredients, setSearchedIngredients] = useState<Ingredient[]>(
    []
  );

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  useEffect(() => {
    if (!searchText) {
      setSearchedIngredients([]);
      return;
    }

    const fetchData = async () => {
      const response = await fetch(
        `/api/expand/Ingredient?where=titleLIKE${searchText}&limit=4`
      );
      const data: Ingredient[] = await response.json();
      setSearchedIngredients(data);
    };
    fetchData();
  }, [searchText]);

  return (
    <Dropdown show={searchedIngredients.length > 0}>
      <Dropdown.Toggle as="div" bsPrefix="p-0">
        <Form.Control
          placeholder="Search ingredient..."
          value={searchText}
          onChange={handleSearch}
        />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "100%" }}>
        {searchedIngredients.map((ingredient) => (
          <Dropdown.Item
            key={ingredient.id}
            onClick={() => {
              onSelect(ingredient);
              setSearchText(ingredient.title);
              setSearchedIngredients([]);
            }}
          >
            {ingredient.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
