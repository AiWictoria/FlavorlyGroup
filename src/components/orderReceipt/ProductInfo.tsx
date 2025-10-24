import { Row, Col } from "react-bootstrap";

interface ProductInfoProps {
  product: string;
  quantity?: number;
  price: number;
}

export default function ProductInfo({
  product,
  quantity,
  price,
}: ProductInfoProps) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center fs-5 py-2">
        <span className="fw-bold">{product}</span>

        <span className="d-flex justify-content-end gap-5">
          {quantity !== undefined && <span>{quantity}</span>}
          <span>{price} kr</span>
        </span>
      </div>
    </>
  );
}
