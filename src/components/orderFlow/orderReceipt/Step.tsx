export interface StepProps {
  iconClass: string;
  status: "active" | "completed" | "inactive";
  onClick?: () => void;
}

export const Step = ({ iconClass, status, onClick }: StepProps) => (
  <div className={`orderbox-step ${status}`}>
    <div className={`orderbox-circle ${status}`} onClick={onClick}>
      <i className={`${iconClass} fs-4`}></i>
    </div>
  </div>
);
