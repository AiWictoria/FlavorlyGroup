import { FormControl, FormGroup, FormLabel } from "react-bootstrap";
interface FormFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function FormField({
  label,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <>
      <FormGroup className="mt-4">
        <FormLabel>{label}</FormLabel>
        <FormControl
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="flavorly-shadow-inset"
          placeholder={placeholder}
        />
      </FormGroup>
    </>
  );
}
