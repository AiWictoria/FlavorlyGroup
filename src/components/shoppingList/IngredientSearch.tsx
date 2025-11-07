import { useState, useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";
import toast from "react-hot-toast";

// Component which retrieves Ingredient object when the user searches

export interface Ingredient {
  id?: string;
  title?: string;
  name?: string;
  amount?: number;
  baseUnit?: Unit;
  productId?: Product[];
}
export interface Product {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  unit?: Unit;
}

export interface Unit {
  id?: string,
  title?: string,
  description?: string,
  baseUnitId?: string,
  unitCode?: string,
}

interface IngredientSearchProps {
  // Sends back the Ingredient object
  onIngredientChange: (ingredient?: Ingredient) => void;
  clearSearchText?: number;
}

export default function IngredientSearch({
  onIngredientChange,
  clearSearchText,
}: IngredientSearchProps) {
  // Controls whether the dropdown should be shown or not
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedIngredients, setSearchedIngredients] = useState<Ingredient[]>(
    []
  );

  // When the user adds an Ingredient successfully
  useEffect(() => {
    setSearchText("");
  }, [clearSearchText]);

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchedIngredients([]);
    setSearchText(event.target.value);
    setShow(true);

    // Clear ingredient when user starts searching ingredients again
    onIngredientChange(undefined);
  }

  useEffect(() => {
    // Don't search if there's no text
    if (!searchText) {
      setShow(false);
      setSearchedIngredients([]);
      return;
    }

    const fetchIngredients = async () => {
      try {
        const res = await fetch(
          `/api/expand/Ingredient?where=titleLIKE${searchText}&limit=4`
        );

        if (!res.ok) {
          toast.error("Failed to load ingredients, try again later");
          return;
        }

        const data: Ingredient[] = await res.json();
        setSearchedIngredients(data);
        setShow(true);
      } catch {
        toast.error("Network error, please try again later");
      }
    };

    fetchIngredients();
  }, [searchText]);

  return (
    <Dropdown show={show && searchedIngredients.length > 0}>
      <Dropdown.Toggle as="div" bsPrefix="p-0">
        <Form.Control
          placeholder="Search ingredient..."
          value={searchText}
          onChange={handleSearch}
          required
        />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "100%" }}>
        {searchedIngredients.map((ingredient) => (
          <Dropdown.Item
            key={ingredient.id ?? ingredient.title ?? ingredient.name}
            onClick={() => {
              onIngredientChange(ingredient);
              setSearchText(ingredient.title ?? ingredient.name ?? "");
              setShow(false);
            }}
          >
            {ingredient.title ?? ingredient.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
