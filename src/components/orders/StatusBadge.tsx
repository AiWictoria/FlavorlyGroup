export function StatusBadge({ status }: { status: string }) {
  let variant: string;

  switch (status) {
    case "Completed":
      variant = "success";
      break;
    case "On its way":
      variant = "warning";
      break;
    default:
      variant = "danger";
  }

  return (
    <span className={`badge bg-${variant} text-dark`}>
      {status}
    </span>
  );
}
