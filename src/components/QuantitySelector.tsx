interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
}

export default function QuantitySelector({ value }: { value: number }) {
  return (
    <div className="d-flex align-items-center display">
      <div className="d-flex quantity-border ">
        <button className="shopping-list-button">
          <i className="bi bi-dash minus-color"></i>
        </button>
        <span className="button-background-color">{value}</span>
        <button className="shopping-list-button">
          <i className="bi bi-plus plus-color"></i>
        </button>
      </div>
    </div>
  );
}
