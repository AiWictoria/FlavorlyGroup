import { Col, Row } from "react-bootstrap";
import CartItem from "./CartItem";
interface CartProps {
  onNext: () => void;
  products: { id: number; name: string; price: number; quantity: number }[];
  onQuantityChange: (productId: number, newQuantity: number) => void;
}
export default function Cart({
  onNext,
  products,
  onQuantityChange,
}: CartProps) {
  return (
    <>
      <Row className="justify-content-center">
        <Col xs={10} className="mb-3">
          <h2>Varukorg</h2>
        </Col>
        <Col xs={10} className="mb-sm-4">
          {products.map((p) => (
            <CartItem
              key={p.id}
              name={p.name}
              productImage="images/start.jpg"
              unitPrice={p.price}
              quantity={p.quantity}
              onQuantityChange={(newQuantity) =>
                onQuantityChange(p.id, newQuantity)
              }
            />
          ))}
        </Col>
      </Row>
    </>
  );
}
