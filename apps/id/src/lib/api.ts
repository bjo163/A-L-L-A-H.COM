/**
 * MoonWitness Canonical Identity API Client
 * Connects apps/id directly to Fastify Hub (apps/arsy)
 */

const API_BASE = process.env.NEXT_PUBLIC_ARSY_API_URL || 'http://localhost:5150';

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
  static getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('mw_session_token');
  }

  static setSessionToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mw_session_token', token);
    // Also mirror to cookie for Fastify / SSR compatibility
    document.cookie = `arsy_session=${token}; path=/; max-age=2592000; SameSite=Lax`;
  }

  static clearSessionToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('mw_session_token');
    document.cookie = `arsy_session=; path=/; max-age=0`;
  }

  static async register(data: { email: string; password: string; name: string }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  static async signIn(data: { email: string; password: string; deviceName?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data?.sessionToken) {
      this.setSessionToken(result.data.sessionToken);
    }
    return result;
  }

  static async getCurrentUser(): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
    const token = this.getSessionToken();
    if (!token) return { success: false, message: 'No session token found' };

    const res = await fetch(`${API_BASE}/api/auth/current`, {
      headers: { 'x-session-token': token },
    });
    return res.json();
  }

  static async getSessions(): Promise<{ success: boolean; data?: SessionInfo[] }> {
    const token = this.getSessionToken();
    if (!token) return { success: false, data: [] };

    const res = await fetch(`${API_BASE}/api/auth/sessions`, {
      headers: { 'x-session-token': token },
    });
    return res.json();
  }

  static async revokeSession(sessionId: number): Promise<{ success: boolean; message?: string }> {
    const token = this.getSessionToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    const res = await fetch(`${API_BASE}/api/auth/sessions/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': token,
      },
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  }

  static async signOut() {
    const token = this.getSessionToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/sign-out`, {
          method: 'POST',
          headers: { 'x-session-token': token },
        });
      } catch {
        // Ignore network errors on signout
      }
    }
    this.clearSessionToken();
  }
}
