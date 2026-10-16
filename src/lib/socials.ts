export const SOCIAL_LINKS = [
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/certified-aminos-628748442/' },
  { platform: 'Reddit', url: 'https://www.reddit.com/user/belkdigital/' },
] as const

export const SOCIAL_URLS: string[] = SOCIAL_LINKS.map((s) => s.url)
