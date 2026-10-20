import type {
  Access,
  FieldAccess,
  GlobalBeforeOperationHook,
  PayloadRequest,
} from "payload"

export const roles = [
  "owner",
  "editor",
  "support",
  "finance",
  "developer",
] as const

export type Role = (typeof roles)[number]

type UserWithRoles = {
  active?: boolean | null
  roles?: Role[] | null
}

function userRoles(user: unknown): Role[] {
  if (!user || typeof user !== "object" || !("roles" in user)) return []

  const candidate = user as UserWithRoles
  if (candidate.active === false) return []
  return Array.isArray(candidate.roles) ? candidate.roles : []
}

export function isActiveUser(user: unknown): boolean {
  return Boolean(
    user &&
    typeof user === "object" &&
    (!("active" in user) || (user as UserWithRoles).active !== false)
  )
}

export function hasRole(user: unknown, allowed: readonly Role[]): boolean {
  return userRoles(user).some((role) => allowed.includes(role))
}

export const authenticatedAdmin = ({ req }: { req: PayloadRequest }): boolean =>
  isActiveUser(req.user)

export const authenticatedField: FieldAccess = ({ req }) =>
  isActiveUser(req.user)

export const ownerOnly: Access = ({ req }) => hasRole(req.user, ["owner"])

export const ownerFieldOnly: FieldAccess = ({ req }) =>
  hasRole(req.user, ["owner"])

export const contentManagers: Access = ({ req }) =>
  hasRole(req.user, ["owner", "editor"])

export const contentOrDeveloper: Access = ({ req }) =>
  hasRole(req.user, ["owner", "editor", "developer"])

export const enforcePublishedGlobalRead: GlobalBeforeOperationHook = ({
  args,
  operation,
  req,
}) =>
  operation === "read" && !hasRole(req.user, ["owner", "editor", "developer"])
    ? { ...args, draft: false }
    : args

export const operationsTeam: Access = ({ req }) =>
  hasRole(req.user, ["owner", "support"])

export const financeTeam: Access = ({ req }) =>
  hasRole(req.user, ["owner", "finance"])
