interface OrderTitleProps {
  name: string;
}

export default function OrderTitle({ name }: OrderTitleProps) {
  return (
    <>
      <div className="pb-3">
        <h3 className="d-none d-sm-block">Thank you for your order, {name}!</h3>
        <h3 className="d-block d-sm-none">Thank you, {name}!</h3>
      </div>
    </>
  );
}
