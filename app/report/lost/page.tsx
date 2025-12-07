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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  category: z.enum(["Electronics", "ID", "Keys", "Other"]),
  location_zone: z.enum(["Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels"]),
  bounty_text: z.string().optional(),
})

export default function ReportLostPage() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Other",
      location_zone: "Innovation_Labs",
      bounty_text: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to report a lost item.")
        // In a real app, redirect to login
        return
      }

      const { error } = await supabase.from("items").insert({
        type: "LOST",
        title: values.title,
        category: values.category,
        location_zone: values.location_zone,
        bounty_text: values.bounty_text,
        user_id: user.id,
        status: "OPEN"
      })

      if (error) {
        console.error(error)
        toast.error("Failed to submit report. Please try again.")
        return
      }

      toast.success("Lost item reported successfully!")
      router.push("/") // Redirect to home or feed
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Report a Lost Item</CardTitle>
          <CardDescription>
            Help us help you find your item. Fill out the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Black Leather Wallet" {...field} />
                    </FormControl>
                    <FormDescription>
                      Be specific. Include brand or color if possible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="ID">ID / Docs</SelectItem>
                        <SelectItem value="Keys">Keys</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    <FormLabel>Last Seen Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
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

              <FormField
                control={form.control}
                name="bounty_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bounty (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. I'll buy you a coffee!"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Offer a small reward to motivate the finder.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
