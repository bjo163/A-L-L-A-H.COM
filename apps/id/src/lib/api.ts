/**
 * MoonWitness Canonical Identity API Client
 * Connects apps/id directly to Fastify Hub (apps/arsy) via the universal SDK.
 */

import { createClient } from '@allah/sdk';
import { authClient } from './auth-client';

const client = createClient();

export interface User {
  id: number;
  email: string;
  name: string;
  status: string;
}

export interface SessionInfo {
  id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_name?: string;
  created_at?: string;
  expires_at: string;
}

export class IdApiClient {
  static async register(data: { email: string; password: string; name: string }) {
    const result = await authClient.signUp.email(data);
    if (result.error) throw new Error(result.error.message);
    return result.data;
  }

  static async signIn(data: { email: string; password: string; deviceName?: string }) {
    const result = await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        fetchOptions: { headers: { 'x-device-name': data.deviceName || 'Browser Session' } },
      }
    );
    if (result.error) throw new Error(result.error.message);
    return result.data;
  }

  static async getCurrentUser(): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
    try {
      const result = await client.auth.getCurrentUser();
      return { success: true, data: { user: result.user as User } };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  static async getSessions(): Promise<{ success: boolean; data?: SessionInfo[] }> {
    try {
      const sessions = await client.auth.getSessions();
      return { success: true, data: sessions as unknown as SessionInfo[] };
    } catch (err: any) {
      return { success: false, data: [] };
    }
  }

  static async revokeSession(sessionId: number): Promise<{ success: boolean; message?: string }> {
    try {
      await client.auth.revokeSession(sessionId);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  static async signOut() {
    const result = await authClient.signOut();
    if (result.error) throw new Error(result.error.message);
  }
}
