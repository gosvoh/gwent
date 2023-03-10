import { logger } from "./utils";

async function post<T = any>(
  procedureName: string,
  ...args: string[]
): Promise<Array<T>> {
  let params = new URLSearchParams();
  params.append("db", "265086");
  params.append("pname", procedureName);
  params.append("format", "rows");
  args.forEach((arg, index) => params.append(`p${index + 1}`, arg));
  const response = await fetch(
    "https://sql.lavro.ru/call.php" + "?" + params.toString()
  );
  if (!response.ok)
    return new Promise((resolve, reject) =>
      reject("Error: " + response.statusText)
    );
  try {
    const data = await response.json();
    logger.debug({ method: `${post.name} ${procedureName}`, args: args });
    logger.debug({ method: `${post.name} ${procedureName}`, response: data });
    if (data.Error) return new Promise((resolve, reject) => reject(data.Error));
    if (data.ERROR) return new Promise((resolve, reject) => reject(data.ERROR));
    if (!data.RESULTS)
      return new Promise((resolve, reject) => reject("No data"));
    let results: any[] = data.RESULTS;
    if (results.includes("ERROR"))
      return new Promise((resolve, reject) =>
        reject(results.find((r) => r === "ERROR"))
      );
    return results[0];
  } catch (error) {
    return new Promise((resolve, reject) => reject(error));
  }
}

export default post;
