import { useState } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  onRemove?: () => void;
}

export default function QuantitySelector({
  value,
  onChange,
  onRemove,
}: QuantitySelectorProps) {
  const [count, setCount] = useState(value);

  const handleMinus = () => {
    if (count === 1) {
      if (onRemove) onRemove();
    } else {
      const newCount = count - 1;
      setCount(newCount);
      onChange(newCount);
    }
  };

  const handlePlus = () => {
    const newCount = count + 1;
    setCount(newCount);
    onChange(newCount);
  };

  return (
    <div className="d-flex align-items-center justify-content-between quantity-wrapper flavorly-shadow">
      <button onClick={handleMinus} className="quantity-button">
        {count === 1 ? (
          <i className="bi bi-trash minus-color"></i>
        ) : (
          <i className="bi bi-dash minus-color"></i>
        )}
      </button>

      <span className="pb-1">{count}</span>

      <button onClick={handlePlus} className="quantity-button">
        <i className="bi bi-plus plus-color"></i>
      </button>
    </div>
  );
}
