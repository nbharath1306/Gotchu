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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createItem } from "@/app/actions"
import { useUser } from '@auth0/nextjs-auth0/client'
import { AlertCircle, MapPin, Tag, Gift, FileText, Loader2, ArrowLeft } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Please provide a descriptive title.",
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

      toast.success("Report submitted. We'll help you find it.")
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 mb-8">Please sign in to report a lost item. This helps us keep the community safe.</p>
          <Link href="/api/auth/login">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base rounded-xl">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">What did you lose?</h1>
            <p className="text-slate-400">Don't worry. Fill out the details below and we'll help the community find it.</p>
          </div>

          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Blue Hydro Flask" {...field} className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-teal-500" />
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
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-teal-500">
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
                        <FormLabel>Last Seen Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-teal-500">
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any distinguishing marks, stickers, or details..." 
                            className="min-h-[120px] bg-slate-50 border-slate-200 focus-visible:ring-teal-500 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bounty_text"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-teal-600" />
                          Reward (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Coffee on me!" {...field} className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-teal-500" />
                        </FormControl>
                        <FormDescription>
                          Offering a small reward can encourage faster returns.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Report Lost Item"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
