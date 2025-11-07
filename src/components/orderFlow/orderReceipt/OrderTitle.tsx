interface OrderTitleProps {
  name: string;
}

export default function OrderTitle({ name }: OrderTitleProps) {
  return (
    <>
      <div className="pb-3">
        <h3 className="">Tack för din beställning, {name}!</h3>
      </div>
    </>
  );
}
