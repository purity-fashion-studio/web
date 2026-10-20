import { Forbidden, ValidationError, type CollectionConfig } from "payload"

import {
  authenticatedAdmin,
  authenticatedField,
  hasRole,
  ownerFieldOnly,
  ownerOnly,
  roles,
} from "../access"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    group: "Administration",
    useAsTitle: "email",
    defaultColumns: ["name", "email", "roles", "active", "updatedAt"],
  },
  auth: {
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 2 * 60 * 60,
    useAPIKey: false,
  },
  access: {
    admin: authenticatedAdmin,
    create: ownerOnly,
    delete: ownerOnly,
    read: ({ req }) =>
      hasRole(req.user, ["owner"]) ||
      (req.user && typeof req.user === "object" && "id" in req.user
        ? { id: { equals: req.user.id } }
        : false),
    update: ({ req, id }) =>
      hasRole(req.user, ["owner"]) ||
      (req.user && typeof req.user === "object" && "id" in req.user
        ? String(req.user.id) === String(id)
        : false),
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (typeof data?.password === "string" && data.password.length < 14) {
          throw new ValidationError(
            {
              collection: "users",
              errors: [
                {
                  message: "Password must contain at least 14 characters.",
                  path: "password",
                },
              ],
              req,
            },
            req.t
          )
        }
        return data
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.active === false) throw new Forbidden()
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === "create" && !req.user) {
          return { ...data, active: true, roles: ["owner"] }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 120,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      options: roles.map((role) => ({ label: role, value: role })),
      access: {
        create: ownerFieldOnly,
        read: authenticatedField,
        update: ownerFieldOnly,
      },
    },
    {
      name: "active",
      type: "checkbox",
      required: true,
      defaultValue: true,
      access: {
        create: ownerFieldOnly,
        read: authenticatedField,
        update: ownerFieldOnly,
      },
    },
    {
      name: "adminLocale",
      type: "select",
      defaultValue: "uk",
      options: [
        { label: "Українська", value: "uk" },
        { label: "Русский", value: "ru" },
        { label: "English", value: "en" },
      ],
    },
  ],
  timestamps: true,
}
