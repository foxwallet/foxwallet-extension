export async function get(url: URL | string) {
  try {
    const response = await fetch(url);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}

export async function post(url: URL | string, options: RequestInit) {
  try {
    options.method = "POST";
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}
