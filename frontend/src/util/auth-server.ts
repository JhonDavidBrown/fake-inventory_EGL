import { cookies } from "next/headers";

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("__session")?.value;
}
