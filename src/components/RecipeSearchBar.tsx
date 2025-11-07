import { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

interface RecipeSearchBarProps {
  onSearch: (value: string) => void;
}

export default function RecipeSearchBar({ onSearch }: RecipeSearchBarProps) {
  const [value, setValue] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  }

  function handleClear() {
    setValue("");
    onSearch("");
  }

  return (
    <Row className="mb-4">
      <Col>
        <div className="position-relative">
          <Form.Control
            type="text"
            aria-label="Search recipes"
            placeholder="Sök recept, ingredienser, kategorier..."
            value={value}
            onChange={handleChange}
            className="pe-5 ps-3"
          />
          {value && (
            <i
              className="bi bi-x-lg position-absolute top-50 end-0 translate-middle-y me-5"
              role="button"
              onClick={handleClear}
            ></i>
          )}
          <i className="bi bi-search fs-5 position-absolute top-50 end-0 translate-middle-y me-3 p-0"></i>
        </div>
      </Col>
    </Row>
  );
}
