import type { GoogleDriveCredential } from "./contracts";

export type GoogleDriveOAuthConfiguration = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleDriveFile = {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  version?: string | number | null;
  md5Checksum?: string | null;
  parents?: string[] | null;
  driveId?: string | null;
  trashed?: boolean | null;
};

export type GoogleDriveListResponse = {
  data: { files?: GoogleDriveFile[] | null; nextPageToken?: string | null };
};

export interface GoogleDriveClient {
  files: {
    list(input: Record<string, unknown>): Promise<GoogleDriveListResponse>;
    get<T = GoogleDriveFile>(
      input: Record<string, unknown>,
      options?: { responseType?: "arraybuffer" | "text" },
    ): Promise<{ data: T }>;
    export(
      input: Record<string, unknown>,
      options?: { responseType?: "arraybuffer" | "text" },
    ): Promise<{ data: ArrayBuffer | string }>;
  };
}

async function checked(response: Response): Promise<Response> {
  if (!response.ok) {
    const message = (await response.text()).slice(0, 300);
    throw new Error(`Google Drive request failed (${response.status}): ${message}`);
  }
  return response;
}

export class GoogleDriveApi {
  constructor(private readonly configuration: GoogleDriveOAuthConfiguration) {}

  authorizationUrl(state: string, scopes: readonly string[]): string {
    const query = new URLSearchParams({
      client_id: this.configuration.clientId,
      redirect_uri: this.configuration.redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "false",
      scope: scopes.join(" "),
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
  }

  async exchangeCode(code: string): Promise<GoogleDriveCredential> {
    const response = await checked(await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.configuration.clientId,
        client_secret: this.configuration.clientSecret,
        redirect_uri: this.configuration.redirectUri,
        grant_type: "authorization_code",
        code,
      }),
    }));
    const token = await response.json() as {
      access_token?: string; refresh_token?: string; expires_in?: number; scope?: string;
    };
    if (!token.access_token || !token.expires_in) {
      throw new Error("Google did not return a usable access credential.");
    }
    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      scopes: (token.scope ?? "").split(" ").filter(Boolean).sort(),
    };
  }

  async accountEmail(credential: GoogleDriveCredential): Promise<string | null> {
    const response = await checked(await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { authorization: `Bearer ${credential.accessToken}` } },
    ));
    return ((await response.json()) as { email?: string }).email ?? null;
  }

  async refresh(credential: GoogleDriveCredential): Promise<GoogleDriveCredential> {
    if (Date.parse(credential.expiresAt) > Date.now() + 60_000) return credential;
    if (!credential.refreshToken) {
      throw new Error("Google Drive authorization expired without a refresh credential.");
    }
    const response = await checked(await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.configuration.clientId,
        client_secret: this.configuration.clientSecret,
        refresh_token: credential.refreshToken,
        grant_type: "refresh_token",
      }),
    }));
    const token = await response.json() as { access_token?: string; expires_in?: number };
    if (!token.access_token || !token.expires_in) {
      throw new Error("Google Drive authorization refresh did not return a usable credential.");
    }
    return {
      ...credential,
      accessToken: token.access_token,
      expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    };
  }

  async revoke(credential: GoogleDriveCredential): Promise<void> {
    await checked(await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(credential.refreshToken ?? credential.accessToken)}`,
      { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" } },
    ));
  }

  drive(credential: GoogleDriveCredential): GoogleDriveClient {
    const request = async (
      path: string,
      input: Record<string, unknown>,
      responseType: "json" | "arraybuffer" | "text",
    ) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) query.set(key, String(value));
      }
      const response = await checked(await fetch(
        `https://www.googleapis.com/drive/v3/${path}?${query}`,
        { headers: { authorization: `Bearer ${credential.accessToken}` } },
      ));
      if (responseType === "arraybuffer") return response.arrayBuffer();
      if (responseType === "text") return response.text();
      return response.json();
    };
    return {
      files: {
        list: async (input) => ({
          data: await request("files", input, "json") as GoogleDriveListResponse["data"],
        }),
        get: async <T = GoogleDriveFile>(input: Record<string, unknown>, options?: {
          responseType?: "arraybuffer" | "text";
        }) => {
          const { fileId, ...query } = input;
          return {
            data: await request(
              `files/${encodeURIComponent(String(fileId))}`,
              query,
              options?.responseType ?? "json",
            ) as T,
          };
        },
        export: async (input, options) => {
          const { fileId, ...query } = input;
          return {
            data: await request(
              `files/${encodeURIComponent(String(fileId))}/export`,
              query,
              options?.responseType ?? "text",
            ) as ArrayBuffer | string,
          };
        },
      },
    };
  }
}
