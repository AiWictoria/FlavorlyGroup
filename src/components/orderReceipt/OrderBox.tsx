import React from "react";
import { Step } from "./Step";
import Box from "./Box";

interface OrderBoxProps {
  activeStep: number;
  children: React.ReactNode;
  onStepClick?: (stepIndex: number) => void;
}

const steps = [
  { label: "Cart", iconClass: "bi bi-bag" },
  { label: "Delivery", iconClass: "bi bi-truck" },
  { label: "Payment", iconClass: "bi bi-credit-card" },
  { label: "Confirmation", iconClass: "bi bi-check2" },
];

export default function OrderBox({
  activeStep,
  children,
  onStepClick,
}: OrderBoxProps) {
  return (
    <Box size="s">
      <div className="orderbox-steps">
        {steps.map((step, index) => {
          const status =
            index === activeStep
              ? "active"
              : index < activeStep
              ? "completed"
              : "inactive";

          return (
            <Step
              key={step.label}
              iconClass={step.iconClass}
              status={status}
              onClick={() => {
                if (onStepClick) {
                  onStepClick(index);
                }
              }}
            />
          );
        })}
      </div>

      <div className="orderbox-content">{children}</div>
    </Box>
  );
}
