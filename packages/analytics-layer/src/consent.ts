import type { ConsentLevel } from './types';

const DEFAULT_COOKIE_NAME = 'cookie_consent';

export function getConsentLevel(
  cookieString: string,
  cookieName: string = DEFAULT_COOKIE_NAME
): ConsentLevel | null {
  const match = cookieString.match(
    new RegExp(`(?:^|; )${cookieName}=([^;]*)`)
  );
  if (!match) return null;

  const value = decodeURIComponent(match[1]);
  if (value === 'all' || value === 'necessary') {
    return value;
  }
  return null;
}

export function hasAnalyticsConsent(
  cookieString: string,
  cookieName: string = DEFAULT_COOKIE_NAME
): boolean {
  const level = getConsentLevel(cookieString, cookieName);
  return level === 'all';
}

export function hasAnyConsent(
  cookieString: string,
  cookieName: string = DEFAULT_COOKIE_NAME
): boolean {
  return getConsentLevel(cookieString, cookieName) !== null;
}
