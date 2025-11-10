import { useState, useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import type { Ingredient } from "src/hooks/useShoppingList";

// Component which retrieves Ingredient object when the user searches

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

    // Clear ingredient when user starts searching ingredients again
    onIngredientChange(undefined);
    setShow(true);
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
          toast.error(
            "Misslyckades med att ladda ingredienser, försök igen senare"
          );
          return;
        }

        const data: Ingredient[] = await res.json();
        console.log(data);

        setSearchedIngredients(data);
      } catch {
        toast.error("Nätverksfel, försök igen senare");
      }
    };

    fetchIngredients();
  }, [searchText]);

  return (
    <Dropdown show={show && searchedIngredients.length > 0}>
      <Dropdown.Toggle as="div" bsPrefix="p-0">
        <Form.Control
          placeholder="Sök ingrediens..."
          value={searchText}
          onChange={handleSearch}
          required
        />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "100%" }}>
        {searchedIngredients.map((ingredient) => (
          <Dropdown.Item
            key={ingredient.id}
            onClick={() => {
              onIngredientChange(ingredient);
              setSearchText(ingredient.name ?? "");
              setShow(false);
            }}
          >
            {ingredient.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
