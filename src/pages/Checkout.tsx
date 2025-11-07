import OrderBox from "../components/orderReceipt/OrderBox";
import Confirmation from "../components/orderReceipt/Confirmation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Cart from "../components/cartParts/Cart";
import Delivery from "../components/deliveryParts/Delivery";
import Payment from "../components/orderReceipt/Payment";
import TotalBox from "../components/cartParts/TotalBox";

Checkout.route = { path: "/order", menuLabel: "Kassa", index: 6 };

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryData {
  address: string;
  postcode: string;
  city: string;
  deliveryType: string;
  deliveryPrice: number;
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [products, setProducts] = useState(() => {
    const saved = sessionStorage.getItem("orderProducts");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Mjölk", price: 20, quantity: 2 },
          { id: 2, name: "Ägg 6p frigående höns", price: 35, quantity: 1 },
        ];
  });

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setProducts((prev: Product[]) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  useEffect(() => {
    sessionStorage.setItem("orderProducts", JSON.stringify(products));
  }, [products]);

  const getButtonLabel = () => {
    if (activeStep === 0) return "Leverans";
    if (activeStep === 1) return "Betala";
    if (activeStep === 2) return "Återuppta betalning";
    return "Nästa";
  };

  const handleRemoveProduct = (productId: number) => {
    setProducts((prev: Product[]) => prev.filter((p) => p.id !== productId));
  };

  const [deliveryData, setDeliveryData] = useState<DeliveryData>(() => {
    const saved = sessionStorage.getItem("deliveryData");
    return saved
      ? JSON.parse(saved)
      : {
          address: "",
          postcode: "",
          city: "",
          deliveryType: "",
          deliveryPrice: 0,
        };
  });

  useEffect(() => {
    sessionStorage.setItem("deliveryData", JSON.stringify(deliveryData));
  }, [deliveryData]);

  const handleDeliveryChange = (
    type: string,
    price: number,
    formData: Omit<DeliveryData, "deliveryType" | "deliveryPrice">
  ) => {
    setDeliveryData({ ...formData, deliveryType: type, deliveryPrice: price });
  };

  const handlePayNow = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/stripe/create-checkout-session",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!data?.url) {
        console.error("No checkout URL returned from backend");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  const stepsContent = [
    <Cart
      products={products}
      onQuantityChange={handleQuantityChange}
      onRemoveProduct={handleRemoveProduct}
    />,
    <Delivery onDeliveryChange={handleDeliveryChange} />,
    <Payment />,
    <Confirmation products={products} deliveryData={deliveryData} />,
  ];

  const totalSteps = stepsContent.length;

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  useEffect(() => {
    const status = searchParams.get("status");
    const step = searchParams.get("step");

    if (status === "success" && step === "confirmation") {
      setCompletedSteps([0, 1, 2]);
      setActiveStep(3);
    } else if (status === "cancelled" && step === "payment") {
      setCompletedSteps([0, 1]);
      setActiveStep(2);
    }
  }, [searchParams]);

  return (
    <OrderBox
      activeStep={activeStep}
      completedSteps={completedSteps}
      onStepClick={(stepIndex) => {
        const maxCompletedStep = completedSteps.length
          ? Math.max(...completedSteps)
          : -1;
        const nextStepIndex = maxCompletedStep + 1;

        if (
          stepIndex <= activeStep ||
          stepIndex <= maxCompletedStep ||
          stepIndex === nextStepIndex
        ) {
          setActiveStep(stepIndex);
        }
      }}
    >
      {stepsContent[activeStep]}
      {activeStep < totalSteps - 1 && (
        <TotalBox
          buttonLable={getButtonLabel()}
          onNext={
            activeStep === 1 || activeStep === 2 ? handlePayNow : nextStep
          }
          products={products}
          deliveryPrice={deliveryData.deliveryPrice}
        />
      )}
    </OrderBox>
  );
}
