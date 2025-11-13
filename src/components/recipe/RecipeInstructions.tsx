import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";

interface RecipeInstructionsProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  onChange?: (field: string, value: string) => void;
}

export function RecipeInstructions({
  mode,
  recipe,
  onChange,
}: RecipeInstructionsProps) {
  const isView = mode === "view";
  const isEditOrCreate = mode === "edit" || mode === "create";

  const [instructionsList, setInstructionsList] = useState<string[]>([]);

  useEffect(() => {
    const value: any = recipe?.instructions as any;
    if (Array.isArray(value)) {
      setInstructionsList(
        value.map((instr: any) => instr?.text ?? String(instr ?? ""))
      );
      return;
    }
    if (typeof value === "string") {
      const parts = value.split("\n");
      setInstructionsList(parts.length > 0 ? parts : [""]);
      return;
    }
    setInstructionsList([""]);
  }, [recipe]);

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructionsList];
    updated[index] = value;
    setInstructionsList(updated);
    onChange?.("instructions", updated.join("\n"));
  };

  const addInstruction = () => {
    setInstructionsList([...instructionsList, ""]);
  };

  const removeInstruction = (index: number) => {
    const updated = instructionsList.filter((_, i) => i !== index);
    setInstructionsList(updated);
    onChange?.("instructions", updated.join("\n"));
  };

  return (
    <div className="py-4 text-lg-start">
      <h2 className="py-4 text-lg-start">Instruktioner</h2>

      {isView && instructionsList.length > 0 && (
        <ul className="list-unstyled">
          {instructionsList.map((instr, i) => (
            <li key={i} className="d-flex align-items-center unstyled mb-3 p-1">
              <Form.Check
                type="checkbox"
                id={`step-${i}`}
                className="m-2 fs-4"
              />
              {instr}
            </li>
          ))}
        </ul>
      )}

      {isEditOrCreate && (
        <>
          {instructionsList.map((instr, i) => (
            <Form.Group key={i} className="d-flex align-items-center mb-2">
              <Form.Control
                required
                placeholder="Lägg till steg"
                value={instr}
                onChange={(e) => handleInstructionChange(i, e.target.value)}
              />
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={() => removeInstruction(i)}
              >
                -
              </Button>
            </Form.Group>
          ))}

          <Button
            className="mt-2"
            variant="success"
            size="sm"
            onClick={addInstruction}
          >
            + Lägg till steg
          </Button>
        </>
      )}
    </div>
  );
}
