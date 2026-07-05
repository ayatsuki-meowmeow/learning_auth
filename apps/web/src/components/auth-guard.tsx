'use client'

import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage } from '@/lib/token'

export function AuthGuard({ children }: { children: React.ReactNode }): JSX.Element | null {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (tokenStorage.get()) {
      setAuthenticated(true)
    } else {
      router.replace('/login')
    }
  }, [router])

  if (!authenticated) return null

  return <>{children}</>
}
