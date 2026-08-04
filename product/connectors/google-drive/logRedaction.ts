const OAUTH_CODE_REPLACEMENT = "[REDACTED_OAUTH_CODE]";
const OAUTH_STATE_REPLACEMENT = "[REDACTED_OAUTH_STATE]";
const CREDENTIAL_REPLACEMENT = "[REDACTED_CREDENTIAL]";
const AUTHORIZATION_REPLACEMENT = "[REDACTED_AUTHORIZATION]";
const MAX_BUFFERED_LOG_LINE_CHARS = 64 * 1024;
const OVERSIZED_LOG_LINE_REPLACEMENT = "[REDACTED_OVERSIZED_LOG_LINE]\n";

const replacement = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized === "code") return OAUTH_CODE_REPLACEMENT;
  if (normalized === "state") return OAUTH_STATE_REPLACEMENT;
  if (normalized === "authorization") return AUTHORIZATION_REPLACEMENT;
  return CREDENTIAL_REPLACEMENT;
};

export function redactGoogleDriveOAuthLogText(value: string): string {
  let redacted = value;
  redacted = redacted.replace(
    /([?&](code|access_token|refresh_token|id_token|client_secret|state)=)([^&#\s]*)/gi,
    (_match, prefix: string, name: string) => `${prefix}${replacement(name)}`,
  );
  redacted = redacted.replace(
    /((?:%3F|%26)(code|access_token|refresh_token|id_token|client_secret|state)%3D)(.*?)(?=%26|\s|$)/gi,
    (_match, prefix: string, name: string) => `${prefix}${encodeURIComponent(replacement(name))}`,
  );
  redacted = redacted.replace(
    /([?&](code|access_token|refresh_token|id_token|client_secret|state)%3D)(.*?)(?=%26|&|\s|$)/gi,
    (_match, prefix: string, name: string) => `${prefix}${encodeURIComponent(replacement(name))}`,
  );
  redacted = redacted.replace(
    /(%22(code|access_token|refresh_token|id_token|client_secret|state|authorization|cookie|set-cookie|session|session[_-]?(?:id|token))%22%3A%22)(.*?)(%22)/gi,
    (_match, prefix:string, name:string, _secret:string, suffix:string)=>`${prefix}${encodeURIComponent(replacement(name))}${suffix}`,
  );
  redacted = redacted.replace(
    /(["'](code|access_token|refresh_token|id_token|client_secret|state|authorization|cookie|set-cookie|session|session[_-]?(?:id|token))["']\s*:\s*["'])(.*?)(["'])/gi,
    (_match, prefix: string, name: string, _secret: string, suffix: string) => `${prefix}${replacement(name)}${suffix}`,
  );
  redacted = redacted.replace(
    /((?:authorization|cookie|set-cookie|session|session[_-]?(?:id|token)|x-session[_-]?(?:id|token))\s*:\s*)([^\r\n]+)/gi,
    (_match, prefix: string, name: string) => `${prefix}${replacement(prefix.trim().replace(/:$/, ""))}`,
  );
  return redacted;
}

export function redactGoogleDriveOAuthLogValue(value: unknown): unknown {
  const seen = new WeakSet<object>();
  const visit = (candidate: unknown): unknown => {
    if (typeof candidate === "string") return redactGoogleDriveOAuthLogText(candidate);
    if (candidate === null || typeof candidate !== "object") return candidate;
    if (seen.has(candidate)) return "[Circular]";
    seen.add(candidate);
    if (candidate instanceof Error) {
      return {
        name: candidate.name,
        message: redactGoogleDriveOAuthLogText(candidate.message),
        ...(candidate.stack ? { stack: redactGoogleDriveOAuthLogText(candidate.stack) } : {}),
        ...(candidate.cause !== undefined ? { cause: visit(candidate.cause) } : {}),
      };
    }
    if (Array.isArray(candidate)) return candidate.map(visit);
    return Object.fromEntries(Object.entries(candidate).map(([key, nested]) => [
      key,
      /^(code|access_token|refresh_token|id_token|client_secret|state|authorization|cookie|set-cookie|session|session[_-]?(?:id|token)|x-session[_-]?(?:id|token))$/i.test(key)
        ? replacement(key)
        : visit(nested),
    ]));
  };
  return visit(value);
}

export function createGoogleDriveOAuthLogSanitizer(write:(value:string)=>void){
  let buffered="";
  let discardingOversizedLine=false;
  return {
    write(chunk:string){
      if(discardingOversizedLine){
        const newline=chunk.indexOf("\n");
        if(newline<0) return;
        discardingOversizedLine=false;
        chunk=chunk.slice(newline+1);
      }
      buffered+=chunk;
      const lines=buffered.split(/(?<=\n)/);
      buffered=lines.pop()??"";
      for(const line of lines) write(redactGoogleDriveOAuthLogText(line));
      if(buffered.length>MAX_BUFFERED_LOG_LINE_CHARS){
        write(OVERSIZED_LOG_LINE_REPLACEMENT);
        buffered="";
        discardingOversizedLine=true;
      }
    },
    end(){if(buffered&&!discardingOversizedLine) write(redactGoogleDriveOAuthLogText(buffered));buffered="";discardingOversizedLine=false;},
  };
}

export const GOOGLE_DRIVE_OAUTH_CODE_REPLACEMENT = OAUTH_CODE_REPLACEMENT;
