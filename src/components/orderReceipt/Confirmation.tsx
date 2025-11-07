import { Col, Row } from "react-bootstrap";
import OrderTitle from "./OrderTitle";
import OrderInfoSection from "./OrderInfoSection";
import Divider from "../shared/Divider";
import ProductInfo from "./ProductInfo";

interface ConfirmationProps {
  products: { id: number; name: string; quantity: number; price: number }[];
  deliveryData: {
    address: string;
    postcode: string;
    city: string;
    deliveryType: string;
    deliveryPrice: number;
  };
}

export default function Confirmation({
  products,
  deliveryData,
}: ConfirmationProps) {
  const totalProducts = products.reduce(
    (sum, p) => sum + p.price * (p.quantity ?? 1),
    0
  );

  const total = totalProducts + (deliveryData.deliveryPrice ?? 0);

  return (
    <>
      <Row className="g-2 justify-content-center">
        <Col xs={10}>
          <OrderTitle name="Will" />
        </Col>
        <Col xs={10} sm={6}>
          <OrderInfoSection
            title="Delivery address:"
            adress={deliveryData.address}
            postcode={deliveryData.postcode}
            city={deliveryData.city}
          />
        </Col>

        <Col xs={10} sm={4}>
          <OrderInfoSection title="Pay method:" paymethod="Apple Pay" />
        </Col>
        <Divider color="orange" />
        <Col xs={10}>
          <div className="d-flex justify-content-between align-items-center fs-5 py-2 fw-bold">
            <p className="fw-bold">Product</p>

            <span className="d-flex justify-content-end gap-4">
              <p>Quantity</p>
              <p>Price</p>
            </span>
          </div>
        </Col>
        {products.map((p, i) => (
          <Col key={p.id} xs={10} className="border-bottom">
            <ProductInfo
              product={p.name}
              quantity={p.quantity}
              price={p.price}
            />
          </Col>
        ))}
        <Col xs={10}>
          <ProductInfo
            product={`Leverans ${deliveryData.deliveryType}`}
            quantity={undefined}
            price={deliveryData.deliveryPrice}
          />
        </Col>
        <Divider color="orange" />
        <Col xs={10} className="d-flex justify-content-end">
          <h4 className="fw-bold">Total: {total} kr</h4>
        </Col>
      </Row>
    </>
  );
}
