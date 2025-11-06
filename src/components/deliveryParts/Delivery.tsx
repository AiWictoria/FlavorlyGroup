import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import TotalBox from "../cartParts/TotalBox";
import DeliveryForm from "./DeliveryForm";

interface DeliveryProps {
  onNext: () => void;
}

export default function Delivery({ onNext }: DeliveryProps) {
  const [formData, setFormData] = useState({
    address: "",
    postcode: "",
    city: "",
    country: "",
    deliveryType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  return (
    <>
      <Row className="justify-content-center">
        <Col xs={10} className="mb-3">
          <h2>Leverans</h2>

          <DeliveryForm formData={formData} onChange={handleChange} />
        </Col>
        <Col xs="12">
          <TotalBox
            buttonLable="Delivery"
            onNext={onNext}
            products={[
              { name: "Mjölk", price: 20, quantity: 2 },
              { name: "Banan", price: 10, quantity: 1 },
            ]}
            deliveryPrice={15}
          />
        </Col>
      </Row>
    </>
  );
}
