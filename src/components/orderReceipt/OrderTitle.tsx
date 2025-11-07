interface OrderTitleProps {
  name: string;
}

export default function OrderTitle({ name }: OrderTitleProps) {
  return (
    <>
      <div className="pb-3">
        <h3 className="d-none d-sm-block">Tack för din beställning, {name}!</h3>
        <h3 className="d-block d-sm-none">Tack, {name}!</h3>
      </div>
    </>
  );
}
