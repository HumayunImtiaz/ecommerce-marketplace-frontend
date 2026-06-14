"use client"

import { useState, useEffect } from "react"
import { 
  Send, 
  Users, 
  History, 
  Mail, 
  Search, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AdminLoader } from "@/components/admin-loader"

interface NewsletterLog {
  id: string
  subject: string
  body: string
  recipientCount: number
  sentAt: string
}

export default function NewsletterPage() {
  const [logs, setLogs] = useState<NewsletterLog[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/newsletter/logs")
      const result = await res.json()
      if (result.success) {
        setLogs(result.data.logs)
        setSubscriberCount(result.data.subscriberCount)
      } else {
        toast.error("Failed to load newsletter data")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return toast.error("Please fill in both subject and body")

    try {
      setIsSending(true)
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body })
      })
      const result = await res.json()
      if (result.success) {
        toast.success(result.message)
        setSubject("")
        setBody("")
        fetchData()
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error("Failed to send broadcast")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading && logs.length === 0) return <div className="h-[60vh] flex items-center justify-center"><AdminLoader /></div>

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Newsletter Broadcast</h1>
          <p className="text-muted-foreground">Send mass emails to your active subscribers.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-2xl font-bold text-slate-900">{subscriberCount}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Subscribers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Broadcast Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Send className="w-5 h-5 text-blue-600" />
                Compose Broadcast
              </CardTitle>
              <CardDescription>Write your message below. It will be sent to all active subscribers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subject Line</label>
                  <Input 
                    placeholder="e.g. Exciting News: Our Summer Collection is Here!" 
                    className="rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 h-12"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Body</label>
                  <Textarea 
                    placeholder="Type your message here... You can use basic HTML if needed." 
                    className="min-h-[300px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 p-4"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSending || subscriberCount === 0}
                  className="w-full bg-[#002147] hover:bg-[#003366] text-white rounded-xl h-14 font-bold text-lg shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-100"
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 animate-spin" /> Sending to {subscriberCount} subscribers...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5" /> Send to All Subscribers
                    </div>
                  )}
                </Button>
                {subscriberCount === 0 && (
                  <p className="text-center text-sm text-red-500 font-medium">No active subscribers to send to.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
          <Card className="rounded-3xl border shadow-sm h-full">
            <CardHeader className="p-6 border-b">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <History className="w-5 h-5 text-slate-400" />
                Recent Broadcasts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No broadcast history found.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-slate-900 line-clamp-1">{log.subject}</p>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> {log.recipientCount}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(log.sentAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
