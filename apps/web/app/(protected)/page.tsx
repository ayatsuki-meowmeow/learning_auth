"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUsers,
  useDeleteUser,
  getGetUsersQueryKey,
} from "@/generated/users/users";
import type { User } from "@/generated/model";

export default function Home() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetUsers();
  const users = data?.data ?? [];

  const { mutate: deleteUser } = useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
      },
    },
  });

  return (
    <main className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Users</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users yet.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user: User) => (
            <li
              key={user.id}
              className="flex items-center justify-between border rounded px-4 py-3"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => deleteUser({ id: user.id })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
