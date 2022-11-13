async function post(
  procedureName: string,
  ...args: string[]
): Promise<Array<any>> {
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
  const data = await response.json();
  if (data.ERROR)
    return new Promise((resolve, reject) => reject(data.ERROR[0]));
  if (!data.RESULTS) return new Promise((resolve, reject) => reject("No data"));
  return data.RESULTS[0];
}

export default post;
