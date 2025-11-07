import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import DeliveryForm from "./DeliveryForm";

interface DeliveryProps {
  onDeliveryChange: (deliveryType: string, deliveryPrice: number) => void;
}

export default function Delivery({ onDeliveryChange }: DeliveryProps) {
  const [formData, setFormData] = useState({
    address: "",
    postcode: "",
    city: "",
    country: "",
    deliveryType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "deliveryType") {
        const price = value === "express" ? 119 : 49;
        onDeliveryChange(value, price);
      }

      return updated;
    });
  };

  return (
    <>
      <Row className="justify-content-center">
        <Col xs={10} className="mb-3">
          <h2>Leverans</h2>

          <DeliveryForm formData={formData} onChange={handleChange} />
        </Col>
      </Row>
    </>
  );
}
