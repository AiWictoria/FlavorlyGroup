import OrderBox from "../components/orderFlow/orderReceipt/OrderBox";
import Confirmation from "../components/orderFlow/orderReceipt/Confirmation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Cart from "../components/orderFlow/cartParts/Cart";
import Delivery from "../components/orderFlow/deliveryParts/Delivery";
import Payment from "../components/orderFlow/orderReceipt/Payment";
import TotalBox from "../components/orderFlow/cartParts/TotalBox";
import { useOrder } from "../hooks/useOrder";

Checkout.route = { path: "/order", menuLabel: "Kassa", index: 6 };

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    products,
    handleQuantityChange,
    handleRemoveProduct,
    deliveryData,
    handleDeliveryChange,
  } = useOrder();

  const getButtonLabel = () => {
    if (activeStep === 0) return "Leverans";
    if (activeStep === 1) return "Betala";
    if (activeStep === 2) return "Återuppta betalning";
    return "Nästa";
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

        if (activeStep === stepsContent.length - 1) return;

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
