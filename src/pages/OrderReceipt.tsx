import OrderBox from "../components/orderReceipt/OrderBox";
import Confirmation from "../components/orderReceipt/Confirmation";

OrderReceipt.route = {
  path: "/order",
  menuLabel: "Order",
  index: 6,
};

export default function OrderReceipt() {
  return (
    <>
      <OrderBox activeStep={1}>
        <Confirmation />
      </OrderBox>
    </>
  );
}
