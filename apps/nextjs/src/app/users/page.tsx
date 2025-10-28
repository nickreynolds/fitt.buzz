"use client";

import { CheckCircle, Users as UsersIcon, XCircle } from "lucide-react";

import { api } from "~/trpc/react";
import { Layout } from "../_components/Layout";

export default function UsersPage() {
  const { data: users, isLoading } =
    api.auth.getAllUsersBlockingStatus.useQuery();

  return (
    <Layout>
      <main className="container py-8">
        <div className="mb-8 flex items-center gap-3">
          <UsersIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Users Blocking Status</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No users found.</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Should Block Fun
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {user.name ?? "(No name)"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.shouldBlockFun ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-destructive" />
                            <span className="font-medium text-destructive">
                              Blocked
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-green-500" />
                            <span className="font-medium text-green-500">
                              Not Blocked
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
          <h2 className="mb-2 font-semibold">About this page</h2>
          <p className="text-sm text-muted-foreground">
            This page shows all users and whether they should currently have fun
            activities blocked based on their overdue tasks. A user is blocked
            when they have tasks with "Block When Overdue" enabled that are past
            their due date.
          </p>
        </div>
      </main>
    </Layout>
  );
}
