interface DividerProps {
  color?: "orange" | "gray";
}
export default function Divider({ color = "gray" }: DividerProps) {
  return <hr className={`my-3 flavorly-divider-${color}`} />;
}
