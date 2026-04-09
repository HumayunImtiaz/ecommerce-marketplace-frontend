"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Zap, CreditCard, Truck, Mail } from "lucide-react"

export function IntegrationSettings() {
  // Use Sonner toast via direct import
  const [loading, setLoading] = useState(false)
  const [integrations, setIntegrations] = useState({
    stripe: { enabled: true, apiKey: "sk_test_***" },
    paypal: { enabled: false, clientId: "" },
    mailchimp: { enabled: true, apiKey: "***-us1" },
    sendgrid: { enabled: false, apiKey: "" },
    fedex: { enabled: true, accountNumber: "123456789" },
    ups: { enabled: false, accessKey: "" },
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Integration settings saved", {
        description: "Your integration preferences have been updated.",
      })
    } catch (error) {
      toast.error("Failed to save integration settings.")
    } finally {
      setLoading(false)
    }
  }

  const integrationList = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept credit card payments",
      icon: CreditCard,
      category: "Payment",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "PayPal payment processing",
      icon: CreditCard,
      category: "Payment",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing automation",
      icon: Mail,
      category: "Marketing",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Transactional email service",
      icon: Mail,
      category: "Marketing",
    },
    {
      id: "fedex",
      name: "FedEx",
      description: "Shipping and tracking",
      icon: Truck,
      category: "Shipping",
    },
    {
      id: "ups",
      name: "UPS",
      description: "Package delivery service",
      icon: Truck,
      category: "Shipping",
    },
  ]

  const categories = ["Payment", "Marketing", "Shipping"]

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {category} Integrations
            </CardTitle>
            <CardDescription>Configure {category.toLowerCase()} service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {integrationList
              .filter((integration) => integration.category === category)
              .map((integration) => (
                <div key={integration.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <integration.icon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          <Badge
                            variant={
                              integrations[integration.id as keyof typeof integrations].enabled
                                ? "default"
                                : "secondary"
                            }
                          >
                            {integrations[integration.id as keyof typeof integrations].enabled
                              ? "Connected"
                              : "Disconnected"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={integrations[integration.id as keyof typeof integrations].enabled}
                      onCheckedChange={(checked) =>
                        setIntegrations((prev) => ({
                          ...prev,
                          [integration.id]: { ...prev[integration.id as keyof typeof prev], enabled: checked },
                        }))
                      }
                    />
                  </div>

                  {integrations[integration.id as keyof typeof integrations].enabled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${integration.id}-key`}>
                          {integration.category === "Payment"
                            ? "API Key"
                            : integration.category === "Marketing"
                              ? "API Key"
                              : "Account Number"}
                        </Label>
                        <Input
                          id={`${integration.id}-key`}
                          type="password"
                          value={
                            integration.id === "stripe"
                              ? integrations.stripe.apiKey
                              : integration.id === "paypal"
                                ? integrations.paypal.clientId
                                : integration.id === "mailchimp"
                                  ? integrations.mailchimp.apiKey
                                  : integration.id === "sendgrid"
                                    ? integrations.sendgrid.apiKey
                                    : integration.id === "fedex"
                                      ? integrations.fedex.accountNumber
                                      : integrations.ups.accessKey
                          }
                          onChange={(e) => {
                            const field =
                              integration.category === "Payment"
                                ? integration.id === "stripe"
                                  ? "apiKey"
                                  : "clientId"
                                : integration.category === "Marketing"
                                  ? "apiKey"
                                  : integration.id === "fedex"
                                    ? "accountNumber"
                                    : "accessKey"

                            setIntegrations((prev) => ({
                              ...prev,
                              [integration.id]: {
                                ...prev[integration.id as keyof typeof prev],
                                [field]: e.target.value,
                              },
                            }))
                          }}
                          placeholder={`Enter your ${integration.name} credentials`}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" size="sm">
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Integration Settings
        </Button>
      </div>
    </div>
  )
}
