import { OrderCard } from "../components/orders/OrderCard";

MyOrdersPage.route = {
  path: "/MyOrders",
  menuLabel: "My Orders",
  index: 15,
};

export default function MyOrdersPage() {
  const ordersMock = [
    {
      id: 3325,
      status: "Delivered",
      items: [
        { name: "Ägg", quantity: 2, price: 3 },
        { name: "Mjölk", quantity: 1, price: 12 },
      ],
    },
    {
      id: 3387,
      status: "New order",
      items: [
        { name: "Bröd", quantity: 1, price: 25 },
        { name: "Smör", quantity: 1, price: 30 },
      ],
    },
    {
      id: 3809,
      status: "In progress",
      items: [
        { name: "Tomater", quantity: 3, price: 5 },
        { name: "Gurka", quantity: 2, price: 7 },
      ],
    },
    {
      id: 3905,
      status: "New order",
      items: [
        { name: "Ost", quantity: 1, price: 40 },
        { name: "Juice", quantity: 2, price: 15 },
      ],
    },
    {
      id: 3906,
      status: "Delivered",
      items: [
        { name: "Ost", quantity: 1, price: 40 },
        { name: "Juice", quantity: 2, price: 15 },
        { name: "Äpplen", quantity: 2, price: 10 },
      ],
    },
  ];

  return (
    <div className="container my-5 pt-5" >
      <h1 className="mb-4">My Orders</h1>

      <div className="row">
        {ordersMock.map((order) => (
          <div key={order.id} className="col-12 mb-3">
            <OrderCard order={order} />
          </div>
        ))}
      </div>
    </div>
  );
}
