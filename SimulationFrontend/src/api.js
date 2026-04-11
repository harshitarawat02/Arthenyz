const BASE_URL = "http://127.0.0.1:8000";

export const runPipeline = async () => {
  console.log("Calling backend...");
  const res = await fetch(`${BASE_URL}/run`);
  const data = await res.json();
  console.log("Backend response:", data);
  return data;
};