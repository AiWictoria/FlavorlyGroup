import { useState, useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  mapIngredient,
  type Ingredient as UiIngredient,
  type IngredientDto,
} from "../../api/models";

export type Ingredient = UiIngredient;

interface IngredientSearchProps {
  onIngredientChange: (ingredient?: UiIngredient) => void;
  clearSearchText?: number;
}

export default function IngredientSearch({
  onIngredientChange,
  clearSearchText,
}: IngredientSearchProps) {
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedIngredients, setSearchedIngredients] = useState<Ingredient[]>(
    []
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSearchText("");
  }, [clearSearchText]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchedIngredients([]);
    setSearchText(e.target.value);
    setActive(true);
    setShow(true);
    onIngredientChange(undefined);
  }

  useEffect(() => {
    if (!active || !searchText) {
      setShow(false);
      setSearchedIngredients([]);
      return;
    }

    const fetchIngredients = async () => {
      try {
        const res = await fetch(
          `/api/expand/Ingredient?where=titleLIKE${encodeURIComponent(
            searchText
          )}&limit=4&orderby=title`
        );
        if (!res.ok) {
          toast.error("Misslyckades med att ladda ingredienser");
          return;
        }
        const data: IngredientDto[] = await res.json();
        const mapped: Ingredient[] = [];
        for (const d of data) {
          try {
            mapped.push(mapIngredient(d));
          } catch {
            /* ignore this item */
          }
        }
        setSearchedIngredients(mapped);
        setShow(mapped.length > 0);
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
        />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "100%" }}>
        {searchedIngredients.map((ingredient) => (
          <Dropdown.Item
            key={ingredient.id}
            onClick={() => {
              onIngredientChange(ingredient);
              setActive(false);
              setShow(false);
              setSearchedIngredients([]);
              setSearchText(ingredient.title);
            }}
          >
            {ingredient.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
