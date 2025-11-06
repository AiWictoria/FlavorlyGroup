import OrderBox from "../components/orderReceipt/OrderBox";
import Confirmation from "../components/orderReceipt/Confirmation";
import { useState } from "react";
import Cart from "../components/cartParts/Cart";
import Delivery from "../components/deliveryParts/Delivery";
import Payment from "../components/orderReceipt/Payment";

OrderReceipt.route = { path: "/order", menuLabel: "Order", index: 6 };

export default function OrderReceipt() {
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
