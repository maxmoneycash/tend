export type DashboardReadResult<TUser, TData> =
  | { status: "signed-out" }
  | { status: "forbidden"; user: TUser }
  | { status: "authorized"; data: TData; user: TUser };

export async function readAuthorizedDashboardData<TUser, TData>(
  user: TUser | null | undefined,
  canAccess: (user: TUser) => boolean,
  read: () => Promise<TData>,
): Promise<DashboardReadResult<TUser, TData>> {
  if (!user) return { status: "signed-out" };
  if (!canAccess(user)) return { status: "forbidden", user };

  return { status: "authorized", data: await read(), user };
}
