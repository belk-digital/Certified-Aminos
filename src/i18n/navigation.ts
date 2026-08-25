import NextLink from 'next/link'
import { useRouter as useNextRouter, usePathname as useNextPathname, redirect as nextRedirect } from 'next/navigation'

export const Link = NextLink
export const useRouter = useNextRouter
export const usePathname = useNextPathname
export const redirect = nextRedirect
export const getPathname = () => useNextPathname()
