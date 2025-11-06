import OrderBox from "../components/orderReceipt/OrderBox";
import Confirmation from "../components/orderReceipt/Confirmation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Cart from "../components/cartParts/Cart";
import Delivery from "../components/deliveryParts/Delivery";
import Payment from "../components/orderReceipt/Payment";

OrderReceipt.route = { path: "/order", menuLabel: "Order", index: 6 };

export default function OrderReceipt() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const stepsContent = [
    <Cart onNext={() => nextStep()} />,
    <Delivery onNext={() => nextStep()} />,
    <Payment onNext={() => nextStep()} onBack={() => prevStep()} />,
    <Confirmation />,
  ];

  const totalSteps = stepsContent.length;

  const nextStep = () => {
    setCompletedSteps((prev) =>
      prev.includes(activeStep) ? prev : [...prev, activeStep]
    );
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

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
    </OrderBox>
  );
}
