export interface StepProps {
  iconClass: string;
  status: "active" | "completed" | "inactive";
}

export const Step = ({ iconClass, status }: StepProps) => (
  <div className={`orderbox-step ${status}`}>
    <div className={`orderbox-circle ${status}`}>
      <i className={`${iconClass} fs-4`}></i>
    </div>
  </div>
);
