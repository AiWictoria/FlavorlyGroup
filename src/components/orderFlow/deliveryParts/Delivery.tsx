import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import DeliveryForm from "./DeliveryForm";

interface DeliveryProps {
  onDeliveryChange: (
    deliveryType: string,
    deliveryPrice: number,
    formData: any
  ) => void;
  savedData: {
    address: string;
    postcode: string;
    city: string;
    deliveryType: string;
  };
}

export default function Delivery({
  onDeliveryChange,
  savedData,
}: DeliveryProps) {
  const [formData, setFormData] = useState(savedData);
  useEffect(() => {
    setFormData((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(savedData)) {
        return savedData;
      }
      return prev;
    });
  }, [savedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      const deliveryType = name === "deliveryType" ? value : prev.deliveryType;
      const price = deliveryType === "express" ? 119 : 49;
      onDeliveryChange(deliveryType, price, updated);
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
