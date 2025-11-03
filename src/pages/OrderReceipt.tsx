import OrderBox from "../components/orderReceipt/OrderBox";
import Confirmation from "../components/orderReceipt/Confirmation";
import { useState } from "react";
import Cart from "../components/orderReceipt/Cart";
import Delivery from "../components/orderReceipt/Delivery";
import Payment from "../components/orderReceipt/Payment";

OrderReceipt.route = {
  path: "/order",
  menuLabel: "Order",
  index: 6,
};

export default function OrderReceipt() {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <Cart onNext={nextStep} />;
      case 1:
        return <Delivery onNext={nextStep} onBack={prevStep} />;
      case 2:
        return <Payment onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <Confirmation />;
      default:
        return null;
    }
  };

  return (
    <>
      <OrderBox activeStep={activeStep}>{renderStepContent()}</OrderBox>
    </>
  );
}
