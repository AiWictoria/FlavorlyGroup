import { Col, Row } from "react-bootstrap";
import OrderTitle from "./OrderTitle";
import OrderInfoSection from "./OrderInfoSection";
import Divider from "../../shared/Divider";
import ProductInfo from "./ProductInfo";
import ClearCartButton from "./ClearCartButton";
import { useAuth } from "../../../features/auth/AuthContext";

interface ConfirmationProps {
  products: { id: string; name: string; quantity: number; price: number }[];
  deliveryData: {
    address: string;
    postcode: string;
    city: string;
    deliveryType: string;
    deliveryPrice: number;
  };
  cartId?: string;
}

export default function Confirmation({
  products,
  deliveryData,
  cartId,
}: ConfirmationProps) {
  const totalProducts = products.reduce(
    (sum, p) => sum + p.price * (p.quantity ?? 1),
    0
  );

  const { user } = useAuth();

  const total = (totalProducts + (deliveryData.deliveryPrice ?? 0)).toFixed(2);

  return (
    <>
      <Row className="g-2 justify-content-center">
        <Col xs={10}>
          <OrderTitle name={user?.firstName ?? null} />
        </Col>
        <Col xs={10} sm={6}>
          <OrderInfoSection
            title="Leverans adress:"
            adress={deliveryData.address}
            postcode={deliveryData.postcode}
            city={deliveryData.city}
          />
        </Col>

        <Col xs={10} sm={4}>
          <OrderInfoSection title="Betalnings metod:" paymethod="Kort" />
        </Col>
        <Divider color="orange" />
        <Col xs={10}>
          <Row className="d-flex justify-content-between align-items-center py-2">
            <Col xs={6} sm={8}>
              <p className="fw-bold">Produkt</p>
            </Col>
            <Col
              xs="auto"
              className="d-flex justify-content-end gap-5 text-end"
            >
              <p>Antal</p>
            </Col>
            <Col xs="auto" className=" text-end">
              <p>A-Pris</p>
            </Col>
          </Row>
        </Col>
        {products.map((p) => (
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
          <h4 className="fw-bold">Totalt: {total} kr</h4>
        </Col>
        {cartId && (
          <Col
            xs={10}
            className="d-flex justify-content-center mx-4 mx-sm-5 mx-md-0"
          >
            <Col
              md={4}
              className="d-flex justify-content-center align-items-center px-sm-4 pe-md-3 mx-md-2 py-2"
            >
              <ClearCartButton cartId={cartId} />
            </Col>
          </Col>
        )}
      </Row>
    </>
  );
}
