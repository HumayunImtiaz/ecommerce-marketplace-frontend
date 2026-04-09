"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/general-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { SecuritySettings } from "@/components/security-settings"
import { IntegrationSettings } from "@/components/integration-settings"
import { AboutSettings } from "@/components/about-settings"
import { FooterSettings } from "@/components/footer-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="general" className="py-2">General</TabsTrigger>
          <TabsTrigger value="about" className="py-2">About Page</TabsTrigger>
          <TabsTrigger value="footer" className="py-2">Footer</TabsTrigger>
          <TabsTrigger value="notifications" className="py-2">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="py-2">Security</TabsTrigger>
          <TabsTrigger value="integrations" className="py-2">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <AboutSettings />
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <FooterSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
