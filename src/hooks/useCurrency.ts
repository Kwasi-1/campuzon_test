import { useCallback, useMemo } from "react";

interface UseCurrencyOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function useCurrency(options: UseCurrencyOptions = {}) {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits,
        maximumFractionDigits,
      }),
    [minimumFractionDigits, maximumFractionDigits],
  );

  const shortFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

  const formatGHS = useCallback(
    (amount: number) => formatter.format(Number.isFinite(amount) ? amount : 0),
    [formatter],
  );

  const formatShort = useCallback(
    (amount: number) => shortFormatter.format(Number.isFinite(amount) ? amount : 0),
    [shortFormatter]
  );

  return {
    formatGHS,
    formatShort,
    currencyCode: "GHS" as const,
    locale: "en-GH" as const,
  };
}

export default useCurrency;