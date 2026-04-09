"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CouponManager } from "@/components/coupon-manager"
import { CampaignManager } from "@/components/campaign-manager"

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">Manage your marketing campaigns and promotions</p>
        </div>
      </div>

      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coupons">Coupons & Discounts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <CouponManager />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
