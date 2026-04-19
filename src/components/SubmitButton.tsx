"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
}

export function SubmitButton({ children, loadingText, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      className={`${className} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
    >
      {pending && <Loader2 className="animate-spin" size={18} />}
      {pending && loadingText ? loadingText : children}
    </button>
  );
}
