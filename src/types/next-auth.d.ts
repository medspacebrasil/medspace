import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    clinicId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      clinicId?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    clinicId?: string
  }
}
