import { useState, useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";

// Component which retrieves Ingredient object when the user searches

export interface Ingredient {
  id: string;
  title: string;
  amount: number;
  unit: Unit;
}

export interface Unit {
  id: string;
  title: string;
}

interface IngredientSearchProps {
  // Sends back the Ingredient object
  onIngredientChange: (ingredient?: Ingredient) => void;
}

export default function IngredientSearch({
  onIngredientChange,
}: IngredientSearchProps) {
  // Controls whether the dropdown should be shown or not
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedIngredients, setSearchedIngredients] = useState<Ingredient[]>(
    []
  );

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchedIngredients([]);
    setSearchText(event.target.value);
    setShow(true);

    // Clear ingredient when user starts searching ingredients again
    onIngredientChange(undefined);
  }

  // Search for ingredients when the user types
  useEffect(() => {
    // Don't search if theres no text in textfield
    if (!searchText) {
      setShow(false);
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
    <Dropdown show={show && searchedIngredients.length > 0}>
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
              onIngredientChange(ingredient);
              setSearchText(ingredient.title);
              setShow(false);
            }}
          >
            {ingredient.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
