import type { JSX } from 'react'
import { AuthGuard } from '@/components/auth-guard'

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AuthGuard>{children}</AuthGuard>
}
