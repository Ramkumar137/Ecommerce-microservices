export function formatCurrency(value: number | string | null | undefined, currency = "INR") {
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  const safeNum = isNaN(num) || value === null || value === undefined ? 0 : num;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(safeNum);
}

export function formatDate(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
