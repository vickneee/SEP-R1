// ZodErrors component: displays validation error messages returned by Zod schema validation
export function ZodErrors({ error }: { error: string[] | undefined }) {
  // If there are no errors, render nothing
  if (!error || error.length === 0) return null;
  // Map through the error array and render each error message in a styled <div>
  return error.map((err: string, index: number) => (
    <div key={index} className="text-red-500 text-xs mt-1 py-2">
      {err}
    </div>
  ));
}
