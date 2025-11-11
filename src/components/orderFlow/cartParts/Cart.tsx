import { Col, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import CartItem from "./CartItem";
import CancelConfirmationToast from "../../shared/CancelConfirmationToast";

interface CartProps {
  products: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onRemoveProduct: (productId: string) => void;
}
export default function Cart({
  products,
  onQuantityChange,
  onRemoveProduct,
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
              onRemove={() =>
                toast.custom((t) => (
                  <CancelConfirmationToast
                    message={`Ta bort "${p.name}" från varukorgen?`}
                    onConfirm={async () => {
                      onRemoveProduct(p.id);
                      toast.dismiss(t.id);
                    }}
                    confirmText="Bekräfta"
                    cancelText="Avbryt"
                  />
                ))
              }
            />
          ))}
        </Col>
      </Row>
    </>
  );
}
