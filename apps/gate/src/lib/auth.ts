import { mwClient } from "@allah/sdk";

export interface GateUser {
  id: number;
  email: string;
  name: string;
  status: string;
}

export async function getCurrentUser(): Promise<GateUser | null> {
  try {
    const result = await mwClient.auth.getCurrentUser();
    if (result?.user) {
      return {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        status: result.user.status,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await mwClient.auth.signOut();
}
