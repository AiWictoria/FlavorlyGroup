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
      <div className="d-flex justify-content-between align-items-center">
        <p>{product}</p>

        <span className="d-flex justify-content-end gap-5">
          {quantity !== undefined && <p>{quantity}</p>}
          <p>{price} kr</p>
        </span>
      </div>
    </>
  );
}
