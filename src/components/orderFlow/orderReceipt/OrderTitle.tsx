interface OrderTitleProps {
  name: string | null;
}

export default function OrderTitle({ name }: OrderTitleProps) {
  return (
    <div className="pb-3">
      <h3>
        {name
          ? `Tack för din beställning, ${name}!`
          : "Tack för din beställning!"}
      </h3>
    </div>
  );
}
