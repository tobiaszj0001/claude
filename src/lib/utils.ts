import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Serializuje obiekty Prisma (Decimal/Date) do JSON-safe wartości. */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => {
      // Prisma.Decimal ma metodę toString; Date -> ISO robi JSON sam.
      if (val && typeof val === "object" && "toFixed" in val && typeof (val as any).toFixed === "function" && !(val instanceof Date)) {
        return (val as any).toString();
      }
      return val;
    })
  );
}
