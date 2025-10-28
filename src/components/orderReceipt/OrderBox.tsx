import React from "react";
import { Step } from "./Step";

interface OrderBoxProps {
  activeStep: number;
  children: React.ReactNode;
}

const steps = [
  { iconClass: "bi bi-bag" },
  { iconClass: "bi bi-truck" },
  { label: "Payment", iconClass: "bi bi-credit-card" },
  { label: "Confirmation", iconClass: "bi bi-check2" },
];

export default function OrderBox({ activeStep, children }: OrderBoxProps) {
  return (
    <div className="orderbox mt-5 pt-5">
      <div className="orderbox-steps">
        {steps.map((step, index) => {
          const status =
            index === activeStep
              ? "active"
              : index < activeStep
              ? "completed"
              : "inactive";

          return (
            <Step key={step.label} iconClass={step.iconClass} status={status} />
          );
        })}
      </div>

      <div className="orderbox-content">{children}</div>
    </div>
  );
}
