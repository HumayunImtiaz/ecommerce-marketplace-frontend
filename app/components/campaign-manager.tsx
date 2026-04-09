"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Mail, MessageSquare, BarChart3 } from "lucide-react"

// Mock campaign data
const campaigns = [
  {
    id: 1,
    name: "Welcome Series",
    type: "email",
    status: "active",
    sent: 1250,
    opened: 875,
    clicked: 234,
    converted: 45,
    revenue: 2250.5,
  },
  {
    id: 2,
    name: "Flash Sale Alert",
    type: "sms",
    status: "completed",
    sent: 500,
    opened: 450,
    clicked: 123,
    converted: 67,
    revenue: 3340.25,
  },
  {
    id: 3,
    name: "Product Launch",
    type: "email",
    status: "draft",
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
  },
]

export function CampaignManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marketing Campaigns</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{campaign.name}</CardTitle>
              <div className="flex items-center gap-2">
                {campaign.type === "email" ? (
                  <Mail className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge
                  variant={
                    campaign.status === "active" ? "default" : campaign.status === "completed" ? "secondary" : "outline"
                  }
                >
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sent</p>
                    <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Opened</p>
                    <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicked</p>
                    <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Converted</p>
                    <p className="font-medium">{campaign.converted.toLocaleString()}</p>
                  </div>
                </div>

                {campaign.sent > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Open Rate</span>
                      <span>{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(campaign.opened / campaign.sent) * 100} />
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-medium text-green-600">${campaign.revenue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
