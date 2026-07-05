'use client'

import type { JSX } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useLogin } from '@/generated/sessions/sessions'
import { tokenStorage } from '@/lib/token'
import type { LoginRequest } from '@/generated/model'

export default function LoginPage(): JSX.Element {
  const router = useRouter()
  const { mutate: login, isPending } = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>()

  return (
    <main className="max-w-sm mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <form
        onSubmit={handleSubmit((values) =>
          login(
            { data: values },
            {
              onSuccess: (res) => {
                if (res.status === 200) {
                  tokenStorage.set(res.data.accessToken)
                  router.replace('/')
                }
              },
              onError: () => {
                setError('root', { message: 'メールアドレスまたはパスワードが違います' })
              },
            },
          )
        )}
        className="space-y-4"
      >
        <div>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">必須です</p>}
        </div>
        <div>
          <input
            {...register('password', { required: true })}
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2 w-full"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">必須です</p>}
        </div>
        {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full disabled:opacity-50"
        >
          {isPending ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="text-sm text-center">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="underline">
          こちら
        </Link>
      </p>
    </main>
  )
}
