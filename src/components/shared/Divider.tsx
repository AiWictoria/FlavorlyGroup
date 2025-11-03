interface DividerProps {
  color?: "orange" | "gray";
}
export default function Divider({ color = "gray" }: DividerProps) {
  return <hr className={`flavorly-divider-${color}`} />;
}
