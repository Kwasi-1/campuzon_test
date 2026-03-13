import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface InputGroupContextValue {
  hasAddonStart: boolean;
  hasAddonEnd: boolean;
  setHasAddonStart: (v: boolean) => void;
  setHasAddonEnd: (v: boolean) => void;
}

const InputGroupContext = React.createContext<InputGroupContextValue>({
  hasAddonStart: false,
  hasAddonEnd: false,
  setHasAddonStart: () => {},
  setHasAddonEnd: () => {},
});

function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const [hasAddonStart, setHasAddonStart] = React.useState(false);
  const [hasAddonEnd, setHasAddonEnd] = React.useState(false);

  return (
    <InputGroupContext.Provider
      value={{ hasAddonStart, hasAddonEnd, setHasAddonStart, setHasAddonEnd }}
    >
      <div
        className={cn("relative flex w-full items-center", className)}
        {...props}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
}

interface InputGroupAddonProps extends React.ComponentProps<"span"> {
  align?: "inline-start" | "inline-end";
}

function InputGroupAddon({
  align = "inline-start",
  className,
  children,
  ...props
}: InputGroupAddonProps) {
  const { setHasAddonStart, setHasAddonEnd } =
    React.useContext(InputGroupContext);

  React.useEffect(() => {
    if (align === "inline-start") setHasAddonStart(true);
    else setHasAddonEnd(true);
    return () => {
      if (align === "inline-start") setHasAddonStart(false);
      else setHasAddonEnd(false);
    };
  }, [align, setHasAddonStart, setHasAddonEnd]);

  return (
    <span
      className={cn(
        "pointer-events-none absolute flex items-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4",
        align === "inline-start" ? "left-3" : "right-3",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const { hasAddonStart, hasAddonEnd } = React.useContext(InputGroupContext);

  return (
    <Input
      className={cn(
        "w-full",
        hasAddonStart && "pl-9",
        hasAddonEnd && "pr-9",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
