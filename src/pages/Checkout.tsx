import OrderBox from "../components/orderFlow/orderReceipt/OrderBox";
import Confirmation from "../components/orderFlow/orderReceipt/Confirmation";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Cart from "../components/orderFlow/cartParts/Cart";
import Delivery from "../components/orderFlow/deliveryParts/Delivery";
import Payment from "../components/orderFlow/orderReceipt/Payment";
import TotalBox from "../components/orderFlow/cartParts/TotalBox";
import { useOrder } from "../hooks/useOrder";

Checkout.route = {
  path: "/order",
  menuLabel: "Varukorg",
  index: 6,
  adminOnly: false,
  protected: true,
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const orderCreationAttempted = useRef(false);

  const {
    products,
    deliveryData,
    handleDeliveryChange,
    handleQuantityChange,
    createOrder,
    handleRemoveProduct,
    cartId,
  } = useOrder();

  const getButtonLabel = () => {
    if (activeStep === 0) return "Leverans";
    if (activeStep === 1) return "Betala";
    if (activeStep === 2) return "Återuppta betalning";
    return "Nästa";
  };

  const handlePayNow = async () => {
    try {
      // Spara cart data OCH leveransinfo innan vi går till Stripe
      sessionStorage.setItem("checkoutProducts", JSON.stringify(products));
      sessionStorage.setItem(
        "checkoutDeliveryData",
        JSON.stringify(deliveryData)
      );

      const res = await fetch(
        "http://localhost:5001/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: products.map((p) => ({
              name: p.name,
              price: p.price,
              quantity: p.quantity,
            })),
            deliveryPrice: deliveryData.deliveryPrice,
          }),
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

  const [isDeliveryValid, setIsDeliveryValid] = useState(false);

  const stepsContent = [
    <Cart
      products={products}
      onQuantityChange={handleQuantityChange}
      onRemoveProduct={handleRemoveProduct}
    />,
    <Delivery
      onDeliveryChange={handleDeliveryChange}
      savedData={deliveryData}
      onFormValidChange={setIsDeliveryValid}
    />,
    <Payment />,
    <Confirmation
      products={products}
      deliveryData={deliveryData}
      cartId={cartId || undefined}
    />,
  ];

  const totalSteps = stepsContent.length;
  const nextStep = () => {
    setCompletedSteps((prev) => {
      const newCompleted = new Set([...prev, activeStep]);
      for (let i = 0; i <= activeStep; i++) newCompleted.add(i);
      return Array.from(newCompleted);
    });

    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  useEffect(() => {
    const status = searchParams.get("status");
    const step = searchParams.get("step");

    if (!orderCreationAttempted.current) {
      if (status === "success" && step === "confirmation") {
        orderCreationAttempted.current = true;

        const savedProductsJson = sessionStorage.getItem("checkoutProducts");
        const savedDeliveryJson = sessionStorage.getItem(
          "checkoutDeliveryData"
        );
        const savedProducts = savedProductsJson
          ? JSON.parse(savedProductsJson)
          : products;
        const savedDelivery = savedDeliveryJson
          ? JSON.parse(savedDeliveryJson)
          : deliveryData;

        createOrder(savedProducts, savedDelivery)
          .then(() => {
            setCompletedSteps([0, 1, 2]);
            setActiveStep(3);
          })
          .catch((error) => {
            console.error(error);
            orderCreationAttempted.current = false;
          });
      } else if (status === "cancelled" && step === "payment") {
        setCompletedSteps([0, 1]);
        setActiveStep(2);
      }
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
          isDisabled={
            (activeStep === 0 && products.length === 0) ||
            (activeStep === 1 && !isDeliveryValid)
          }
        />
      )}
    </OrderBox>
  );
}
