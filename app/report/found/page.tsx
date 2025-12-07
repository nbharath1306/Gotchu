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
      router.push("/")
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Report a Found Item</CardTitle>
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
                    <FormLabel>What did you find?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Blue Water Bottle" {...field} />
                    </FormControl>
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
                    <FormLabel>Where did you find it?</FormLabel>
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
                name="drop_off_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drop-off Point / Current Location</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Handed over to Security Gate 1, or 'It is with me'"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Let the owner know where they can collect it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                Submit Found Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
