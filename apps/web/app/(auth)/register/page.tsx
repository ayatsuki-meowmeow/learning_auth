'use client'

import type { JSX } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useRegisterAuth } from '@/generated/auth/auth'
import type { RegisterAuthRequest } from '@/generated/model'

export default function RegisterPage(): JSX.Element {
  const router = useRouter()
  const { mutate: registerAuth, isPending } = useRegisterAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterAuthRequest>()

  return (
    <main className="max-w-sm mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Register</h1>
      <form
        onSubmit={handleSubmit((values) =>
          registerAuth(
            { data: values },
            {
              onSuccess: () => {
                router.replace('/login')
              },
              onError: () => {
                setError('root', { message: '登録に失敗しました' })
              },
            },
          )
        )}
        className="space-y-4"
      >
        <div>
          <input
            {...register('name', { required: true })}
            placeholder="Name"
            className="border rounded px-3 py-2 w-full"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">必須です</p>}
        </div>
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
          {isPending ? 'Loading...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-center">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="underline">
          こちら
        </Link>
      </p>
    </main>
  )
}
