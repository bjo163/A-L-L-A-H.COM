import { mwClient } from "@allah/sdk";
import type { UserSubject } from "@moonwitness/types";

/** The hub already owns this shape; the app only names it locally. */
export type GateUser = UserSubject;

export async function getCurrentUser(): Promise<GateUser | null> {
  try {
    const { user } = await mwClient.auth.getCurrentUser();
    return user ?? null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await mwClient.auth.signOut();
}
