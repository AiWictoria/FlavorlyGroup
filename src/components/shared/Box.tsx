interface BoxProps {
  children: React.ReactNode;
  size?: "s" | "m" | "l" | "xl";
  className?: string;
}

export default function Box({
  children,
  size = "s",
  className = "",
}: BoxProps) {
  return (
    <>
      <div className={`px-3 orderbox orderbox-${size} ${className}`}>
        {children}
      </div>
    </>
  );
}

/* USAGE EXAMPLES:

<Box>Small box (default)</Box>
<Box size="m">Medium box</Box>
<Box size="l" className="custom-class">Large box with extra class</Box>

*/
