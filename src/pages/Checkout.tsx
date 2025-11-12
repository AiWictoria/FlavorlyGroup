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
  menuLabel: "Kassa",
  index: 6,
  adminOnly: false,
  protected: true,
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [orderCreated, setOrderCreated] = useState(false);
  const orderCreationAttempted = useRef(false);

  const { products, deliveryData, handleDeliveryChange, handleQuantityChange, createOrder, handleRemoveProduct } = useOrder();

  const getButtonLabel = () => {
    if (activeStep === 0) return "Leverans";
    if (activeStep === 1) return "Betala";
    if (activeStep === 2) return "Återuppta betalning";
    return "Nästa";
  };

  const handlePayNow = async () => {
    try {
      // Spara cart data OCH leveransinfo innan vi går till Stripe
      sessionStorage.setItem('checkoutProducts', JSON.stringify(products));
      sessionStorage.setItem('checkoutDeliveryData', JSON.stringify(deliveryData));
      
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

  const stepsContent = [
    <Cart
      products={products}
      onQuantityChange={handleQuantityChange}
      onRemoveProduct={handleRemoveProduct}
    />,
    <Delivery
      onDeliveryChange={handleDeliveryChange}
      savedData={deliveryData}
    />,
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

    console.log("🔍 Checkout URL params:", { status, step, orderCreated });

    if (status === "success" && step === "confirmation" && !orderCreated && !orderCreationAttempted.current) {
      // Create order when payment succeeds (only once)
      console.log("💳 Betalning lyckades! Skapar order...");
      orderCreationAttempted.current = true;
      setOrderCreated(true);
      // Hämta sparade produkter OCH leveransinfo från sessionStorage
      const savedProductsJson = sessionStorage.getItem('checkoutProducts');
      const savedDeliveryJson = sessionStorage.getItem('checkoutDeliveryData');
      const savedProducts = savedProductsJson ? JSON.parse(savedProductsJson) : products;
      const savedDelivery = savedDeliveryJson ? JSON.parse(savedDeliveryJson) : deliveryData;
      console.log("📦 Använder produkter:", savedProducts);
      console.log("📍 Använder leveransinfo:", savedDelivery);
      createOrder(savedProducts, savedDelivery)
        .then((order) => {
          console.log("✅ Order skapad från cart:", order);
          // Rensa sparade produkter och leveransinfo
          sessionStorage.removeItem('checkoutProducts');
          sessionStorage.removeItem('checkoutDeliveryData');
          setCompletedSteps([0, 1, 2]);
          setActiveStep(3);
        })
        .catch((error) => {
          console.error("❌ Kunde inte skapa order:", error);
          orderCreationAttempted.current = false;
          setOrderCreated(false); // Reset så användaren kan försöka igen
        });
    } else if (status === "cancelled" && step === "payment") {
      setCompletedSteps([0, 1]);
      setActiveStep(2);
    }
  }, [searchParams, orderCreated, createOrder, products, deliveryData]);

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
