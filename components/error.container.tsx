export default function ErrorContainer({
  errorMessage,
  children,
}: {
  errorMessage: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h1>Error</h1>
      <p>{errorMessage}</p>
      {children && <>{children}</>}
    </div>
  );
}
