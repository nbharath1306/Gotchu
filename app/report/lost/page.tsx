"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createItem } from "@/app/actions"
import { useUser } from '@auth0/nextjs-auth0/client'
import { AlertCircle, MapPin, Tag, Gift, FileText, Loader2 } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.enum(["Electronics", "ID", "Keys", "Other"]),
  location_zone: z.enum(["Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels"]),
  bounty_text: z.string().optional(),
})

export default function ReportLostPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      location_zone: "Innovation_Labs",
      bounty_text: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("You must be logged in to report a lost item.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createItem({
        type: "LOST",
        ...values
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Lost item reported successfully!")
      router.push("/feed")
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md glass border-white/10">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to report a lost item.</p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <a href="/auth/login">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-lg glass border-white/10 shadow-2xl shadow-red-500/5">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Report a Lost Item</CardTitle>
          <CardDescription>
            Help us help you find your item. Fill out the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-violet-500" />
                      Item Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Blue Hydro Flask, iPhone 15 Pro" 
                        {...field} 
                        className="bg-white/5 border-white/10 focus:border-violet-500/50 h-11" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add more details like color, brand, distinguishing marks..."
                        {...field}
                        className="bg-white/5 border-white/10 focus:border-violet-500/50 min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Electronics">📱 Electronics</SelectItem>
                          <SelectItem value="ID">🪪 ID Cards</SelectItem>
                          <SelectItem value="Keys">🔑 Keys</SelectItem>
                          <SelectItem value="Other">📦 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-violet-500" />
                        Last Seen
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 h-11">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Innovation_Labs">Innovation Labs</SelectItem>
                          <SelectItem value="Canteen">Canteen</SelectItem>
                          <SelectItem value="Bus_Bay">Bus Bay</SelectItem>
                          <SelectItem value="Library">Library</SelectItem>
                          <SelectItem value="Hostels">Hostels</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bounty_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-amber-500" />
                      Reward (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Coffee on me! ☕" 
                        {...field} 
                        className="bg-white/5 border-white/10 focus:border-violet-500/50 h-11" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Offering a small reward can encourage people to help.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Lost Item Report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
