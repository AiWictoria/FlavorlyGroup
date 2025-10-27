export function StatusBadge({ status }: { status: string }) {
  let variant: string;

  switch (status) {
    case "Delivered":
      variant = "success";
      break;
    case "In progress":
      variant = "warning";
      break;
    default:
      variant = "info";
  }

  return (
    <span className={`badge text-${variant} fs-6 `}>
      {status}
    </span>
  );
}
