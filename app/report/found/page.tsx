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
  drop_off_point: z.string().optional(),
})

export default function ReportFoundPage() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Other",
      location_zone: "Innovation_Labs",
      drop_off_point: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to report a found item.")
        return
      }

      const { error } = await supabase.from("items").insert({
        type: "FOUND",
        title: values.title,
        category: values.category,
        location_zone: values.location_zone,
        bounty_text: values.drop_off_point, // Storing drop-off point in bounty_text for now
        user_id: user.id,
        status: "OPEN"
      })

      if (error) {
        console.error(error)
        toast.error("Failed to submit report. Please try again.")
        return
      }

      toast.success("Found item reported successfully! You earned +50 Karma.")
      router.push("/feed")
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-lg glass border-white/10 shadow-2xl shadow-green-500/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gradient bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">Report a Found Item</CardTitle>
          <CardDescription>
            Thank you for being a good samaritan!
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
                      <Input placeholder="e.g. Black Wallet" {...field} className="bg-white/5 border-white/10 focus:border-green-500/50" />
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
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="ID">ID Cards</SelectItem>
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
                      <FormLabel>Found Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
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
                name="drop_off_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drop-off Point (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Security Desk" {...field} className="bg-white/5 border-white/10 focus:border-green-500/50" />
                    </FormControl>
                    <FormDescription>
                      Where can the owner collect this item?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">Submit Report</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
