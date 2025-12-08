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
import { AlertCircle, MapPin, Tag, MapPinned, FileText, Loader2, Star, ArrowLeft, CheckCircle2 } from "lucide-react"
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
        type: "found",
        ...values
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Thank you for your honesty!")
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
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 text-center border border-slate-200">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 mb-6">Please sign in to report a found item.</p>
          <Button asChild className="w-full">
            <a href="/api/auth/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-dot-pattern flex flex-col">
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/feed" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Feed
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Found Something?</h1>
              </div>
              <p className="text-slate-300 max-w-md">
                You're a hero! Help us return this item to its owner.
              </p>
            </div>

            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">What did you find?</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder="e.g. Blue Water Bottle, Calculus Textbook" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select category" />
                                </div>
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
                          <FormLabel className="text-slate-700 font-medium">Found Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select zone" />
                                </div>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any distinguishing features..."
                            className="min-h-[120px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drop_off_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Drop-off Point (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPinned className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder="e.g. Security Desk, Lost & Found Office" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where can the owner pick this up?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
