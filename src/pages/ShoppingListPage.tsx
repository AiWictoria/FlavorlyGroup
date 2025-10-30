// import { useShoppingList } from "../hooks/useShoppingList";
import {
  Form,
  Button,
  ListGroup,
  Row,
  Col,
  Dropdown,
  Card,
  Table,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useState } from "react";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Shopping List",
  index: 4,
  protected: true,
};

// Future interface for useShoppingList could look like this

//  interface ShoppingItem {
//   id: number;
//   userId: number;
//   ingredient: string;
//   checked: boolean;
//   amount: number;
//   unit: string;
// }

export default function ShoppingListPage() {
  ////////////////////////////////////////
  // MOCK UNTIL PROPER DB IS IMPLEMENTED//
  function useShoppingListMock() {
    const [items, setItems] = useState([
      { id: "1", ingredient: "Eggs", checked: false, unit: "g", amount: "500" },
      {
        id: "2",
        ingredient: "Milk",
        checked: true,
        unit: "ml",
        amount: "1000",
      },
    ]);

    const addItem = async (ingredient: string) => {
      setItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          ingredient,
          checked: false,
          unit: "",
          amount: "",
        },
      ]);
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleItemChecked = (id: string, checked: boolean) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked } : item))
      );
    };
    const moveItemsToCart = () => {
      setItems((prev) => prev.filter((item) => !item.checked));
    };

    const fetchList = async () => {}; // no-op for mock

    return {
      items,
      addItem,
      removeItem,
      toggleItemChecked,
      fetchList,
      moveItemsToCart,
    };
  }
  ////////////////////////////////////////

  const {
    items,
    addItem,
    removeItem,
    toggleItemChecked,
    fetchList,
    moveItemsToCart,
  } =
    /////////////////////////////////////////////////
    //Change this to useShoppingList when done mocking
    /////////////////////////////////////////////////
    useShoppingListMock();

  const [newItem, setNewItem] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    await fetchList();
    setNewItem("");
  }

  return (
    <Row className="mt-5 p-3 p-xl-5">
      <Col className="mt-4 mx-xl-5 px-xl-5">
        <h2>Shopping List</h2>
        <Form onSubmit={handleAdd}>
          <Row className="mt-4">
            <Col xs={12} xl={7} className="mb-2">
              <Form.Group>
                <Form.Control
                  placeholder="Add ingredient..."
                  onChange={(e) => setNewItem(e.target.value)}
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col xs={6} xl={3} className="mb-2">
              <Form.Group>
                <Form.Control
                  placeholder="Add amount..."
                  type="number"
                  onChange={(e) => setNewItem(e.target.value)}
                ></Form.Control>
              </Form.Group>
            </Col>

            <Col xs={6} xl={1}>
              <Form.Control placeholder="Unit" disabled></Form.Control>
            </Col>
            <Col xs={12} xl={1}>
              <div className="d-grid gap-2 mb-5">
                <Button variant="success" type="submit" className="w-auto">
                  Add
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {items.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tomatoes (3 pcs)</td>
                <td>
                  <Form.Select size="sm">
                    <option>Cherry Tomatoes 500g</option>
                    <option>Roma Tomatoes 1kg</option>
                  </Form.Select>
                </td>
                <td className="text-center">
                  <Button size="sm">-</Button>
                  <span className="mx-2">2</span>
                  <Button size="sm">+</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <div
            className="d-flex justify-content-center align-items-center mt-5"
            style={{ color: "#9b9d9eff" }}
          >
            <h1>Shopping list is empty...</h1>
          </div>
        )}

        {items.length > 0 ? (
          <>
            <ListGroup>
              {items.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex align-items-center "
                >
                  <Form.Check
                    id={`check-${item.id}`}
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) =>
                      toggleItemChecked(item.id, e.target.checked)
                    }
                    label={
                      <>
                        <div className="d-flex flex-wrap">
                          <span>{item.ingredient}</span>
                          <span className="ms-1">{item.amount}</span>
                          <span className="ms-1">{item.unit}</span>
                        </div>
                      </>
                    }
                  />

                  <Dropdown className="ms-2">
                    <Dropdown.Toggle variant="info">Products</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>All the products</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Button
                    className="ms-auto"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    -
                  </Button>
                </ListGroup.Item>
              ))}

              <Button className="mt-3" onClick={() => moveItemsToCart()}>
                Add ingredients to cart
              </Button>
            </ListGroup>
          </>
        ) : (
          <div
            className="d-flex justify-content-center align-items-center mt-5"
            style={{ color: "#9b9d9eff" }}
          >
            <h1>Shopping list is empty...</h1>
          </div>
        )}
      </Col>
    </Row>
  );
}
