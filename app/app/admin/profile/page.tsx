

import { getAdminFromCookies } from "@/lib/cookies"
import AdminProfileClient from "@/components/admin-profile-client"

export default async function ProfilePage() {
  // Server pe cookies se admin data lo
  const admin = await getAdminFromCookies()

  return (
    <AdminProfileClient
      initialData={{
        name:      admin.name      ?? "",
        email:     admin.email     ?? "",
        bio:       admin.bio       ?? "",
        lastLogin: admin.lastLogin ?? null,
      }}
    />
  )
}