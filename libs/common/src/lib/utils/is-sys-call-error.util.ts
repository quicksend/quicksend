export const isSysCallError = (error: unknown): error is NodeJS.ErrnoException => {
  return (
    error instanceof Error &&
    typeof (error as NodeJS.ErrnoException).code === "string" &&
    typeof (error as NodeJS.ErrnoException).errno === "number" &&
    typeof (error as NodeJS.ErrnoException).path === "string" &&
    typeof (error as NodeJS.ErrnoException).stack === "string" &&
    typeof (error as NodeJS.ErrnoException).syscall === "string"
  );
};
