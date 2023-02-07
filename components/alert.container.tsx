import styles from "../styles/Alert.module.scss";

export default function AlertContainer({
  alertMessage,
  children,
  header = "Error",
}: {
  alertMessage: string;
  children?: React.ReactNode;
  header?: string;
}) {
  return (
    <div className={styles.alert}>
      <h1>{header}</h1>
      <p>{alertMessage}</p>
      {children && <>{children}</>}
    </div>
  );
}
