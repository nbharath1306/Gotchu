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
import { CheckCircle2, MapPin, Tag, MapPinned, FileText, Loader2, Star } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.enum(["Electronics", "ID", "Keys", "Other"]),
  location_zone: z.enum(["Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels"]),
  drop_off_point: z.string().optional(),
})

export default function ReportFoundPage() {
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
      drop_off_point: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("You must be logged in to report a found item.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createItem({
        type: "FOUND",
        title: values.title,
        description: values.description,
        category: values.category,
        location_zone: values.location_zone,
        bounty_text: values.drop_off_point
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Found item reported successfully! You earned +50 Karma. ⭐")
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
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md glass border-white/10">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to report a found item.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
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
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-lg glass border-white/10 shadow-2xl shadow-green-500/5">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Report a Found Item</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            Thank you for being a good samaritan! 
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4" />
              +50 Karma
            </span>
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
                      <Tag className="h-4 w-4 text-green-500" />
                      Item Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Black Wallet, Student ID Card" 
                        {...field} 
                        className="bg-white/5 border-white/10 focus:border-green-500/50 h-11" 
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
                      <FileText className="h-4 w-4 text-green-500" />
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add details to help the owner identify their item..."
                        {...field}
                        className="bg-white/5 border-white/10 focus:border-green-500/50 min-h-[80px] resize-none"
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
                        <MapPin className="h-4 w-4 text-green-500" />
                        Found At
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
                name="drop_off_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-violet-500" />
                      Drop-off Point (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Security Desk, Library Counter" 
                        {...field} 
                        className="bg-white/5 border-white/10 focus:border-green-500/50 h-11" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Where can the owner collect this item?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Found Item Report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
