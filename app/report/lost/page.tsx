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
import { AlertCircle, MapPin, Tag, Gift, FileText, Loader2, ArrowLeft, Search } from "lucide-react"
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
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 bg-noise">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 mb-8">Please sign in to report a lost item.</p>
          <Button asChild className="w-full h-12 text-lg rounded-xl bg-teal-600 hover:bg-teal-700">
            <a href="/api/auth/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 bg-noise flex flex-col">
      <div className="flex-1 pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/feed" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Feed
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Lost Something?</h1>
                <p className="text-rose-50 text-lg max-w-md">
                  Don't worry, we'll help you find it. Provide as many details as possible to help others identify your item.
                </p>
              </div>
            </div>

            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">What did you lose?</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder="e.g. Black Leather Wallet, iPhone 13" 
                              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" 
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
                              <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
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
                          <FormLabel className="text-slate-700 font-medium">Last Seen Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select location" />
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
                    name="bounty_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Reward (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Gift className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder="e.g. Coffee on me, $20 reward" 
                              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-400">
                          Offering a small reward can encourage people to help.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any distinctive features, scratches, or stickers..." 
                            className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl resize-none p-4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Report"
                      )}
                    </Button>
                    <p className="text-center text-sm text-slate-400 mt-4">
                      By submitting, you agree to our community guidelines.
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
