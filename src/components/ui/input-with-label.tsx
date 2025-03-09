
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  error?: string;
  success?: string;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  label,
  className,
  error,
  success,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input
        className={cn(
          error && "border-destructive",
          success && "border-success",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}
    </div>
  );
};

export default InputWithLabel;
