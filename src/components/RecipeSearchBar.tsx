import { Form, Row, Col } from "react-bootstrap";

interface RecipeSearchBarProps {
  onSearch: (value: string) => void;
}

export default function RecipeSearchBar({ onSearch }: RecipeSearchBarProps) {
  return (
    <Row className="mb-4">
      <Col>
        <Form.Control
          type="text"
          placeholder="Search recipes, ingredients, categories..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </Col>
    </Row>
  );
}
