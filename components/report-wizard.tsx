"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Laptop,
    CreditCard,
    Key,
    HelpCircle,
    MapPin,
    Calendar,
    Camera,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Loader2,
    AlertCircle
} from "lucide-react"
import type { ReportType } from "@/lib/schemas"
import { submitReportAction } from "@/app/actions"
import { ImageUpload } from "@/components/image-upload"
import { CalendarInput } from "@/components/ui/calendar-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WizardProps {
    type: "LOST" | "FOUND"
}

const steps = [
    { id: 1, title: "What kind of item is it?", description: "Categorizing helps us match you faster." },
    { id: 2, title: "When & Where?", description: "Help us narrow down the search zone." },
    { id: 3, title: "Visual Details", description: "A picture speaks a thousand words." },
    { id: 4, title: "Review Report", description: "Double check everything before we broadcast." },
]

export function ReportWizard({ type }: WizardProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [direction, setDirection] = useState(0)

    const [formData, setFormData] = useState<Partial<ReportType>>({
        type,
        category: undefined,
        location: undefined,
        date: undefined,
        title: "",
        description: "",
        image_url: ""
    })

    // Validation function checks current step before proceeding
    const canProceed = () => {
        switch (step) {
            case 1: return !!formData.category
            case 2: return !!formData.location && !!formData.date
            case 3: return !!formData.title && (formData.title.length >= 3) && !!formData.description && (formData.description.length >= 10)
            default: return true
        }
    }

    const handleNext = () => {
        if (canProceed()) {
            setDirection(1)
            setStep(s => Math.min(s + 1, 4))
        } else {
            toast.error("Please complete this step to continue.")
        }
    }

    const handleBack = () => {
        setDirection(-1)
        setStep(s => Math.max(s - 1, 1))
    }

    const updateField = (field: keyof ReportType, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        const data = new FormData()
        Object.entries(formData).forEach(([key, val]) => {
            if (val) data.append(key, val as string)
        })

        // Fallback if type is missing from state (shouldn't happen)
        if (!data.get("type")) data.append("type", type)

        const result = await submitReportAction(data)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success("We are now scanning for matches...")
            // Redirect after a short delay for calmness
            setTimeout(() => {
                router.push(`/item/${result.itemId}/matches`)
            }, 1500)
        }
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-mono text-[#999999] mb-2 uppercase tracking-widest">
                    <span>Step {step} of 4</span>
                    <span>{Math.round((step / 4) * 100)}% Complete</span>
                </div>
                <div className="h-1 bg-[#E5E5E5] w-full rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                    />
                </div>
            </div>

            <div className="card-swiss bg-white min-h-[400px] flex flex-col relative overflow-hidden">
                {/* Step Header */}
                <div className="p-8 pb-4 border-b border-[#F2F2F2]">
                    <h2 className="text-2xl font-display font-bold text-[#111111]">{steps[step - 1].title}</h2>
                    <p className="text-[#666666] mt-1">{steps[step - 1].description}</p>
                </div>

                {/* Step Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                            className="h-full"
                        >
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { val: "Electronics", icon: Laptop, label: "Electronics" },
                                        { val: "ID", icon: CreditCard, label: "ID & Cards" },
                                        { val: "Keys", icon: Key, label: "Keys" },
                                        { val: "Other", icon: HelpCircle, label: "Other" },
                                    ].map((cat) => (
                                        <button
                                            key={cat.val}
                                            onClick={() => updateField("category", cat.val as any)}
                                            className={`p-6 border text-left transition-all duration-200 flex flex-col gap-3 group
                        ${formData.category === cat.val
                                                    ? "border-black bg-black text-white"
                                                    : "border-[#E5E5E5] hover:border-black hover:bg-[#F9F9F9]"}`}
                                        >
                                            <cat.icon className={`w-6 h-6 ${formData.category === cat.val ? "text-white" : "text-[#666666] group-hover:text-black"}`} />
                                            <span className="font-mono text-sm tracking-wide uppercase font-bold">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666] block">
                                            When did you lose it?
                                        </label>
                                        <CalendarInput
                                            name="date"
                                            value={formData.date || ""}
                                            onChange={(val) => updateField("date", val)}
                                            className="input-swiss w-full bg-white"
                                            placeholder="Select date"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666] block">
                                            Where was it last seen?
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {["Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels", "Other"].map((loc) => (
                                                <button
                                                    key={loc}
                                                    onClick={() => updateField("location", loc as any)}
                                                    className={`px-3 py-3 border text-xs font-mono uppercase tracking-wide truncate transition-all
                            ${formData.location === loc
                                                            ? "border-black bg-black text-white"
                                                            : "border-[#E5E5E5] hover:border-black"}`}
                                                >
                                                    {loc.replace("_", " ")}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666]">
                                            What is it called?
                                        </label>
                                        <input
                                            value={formData.title}
                                            onChange={(e) => updateField("title", e.target.value)}
                                            placeholder="e.g. Black MacBook Air"
                                            className="input-swiss w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666]">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => updateField("description", e.target.value)}
                                            rows={4}
                                            placeholder="Specific scratches, stickers, or contents..."
                                            className="input-swiss w-full resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666] flex items-center gap-2">
                                            <Camera className="w-3 h-3" /> Photo (Optional)
                                        </label>
                                        {/* We pass a dummy name, we handle state manually */}
                                        <div className="border border-dashed border-[#E5E5E5] p-4 bg-[#F9F9F9]">
                                            <ImageUpload onUploadComplete={(url) => updateField("image_url", url)} />
                                            {formData.image_url && <p className="text-xs text-green-600 font-mono mt-2">Image attached!</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-[#F9F9F9] p-6 border border-[#E5E5E5] space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white border border-[#E5E5E5] flex items-center justify-center">
                                                {formData.category === 'Electronics' && <Laptop className="w-6 h-6" />}
                                                {formData.category === 'ID' && <CreditCard className="w-6 h-6" />}
                                                {formData.category === 'Keys' && <Key className="w-6 h-6" />}
                                                {formData.category === 'Other' && <HelpCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{formData.title}</h3>
                                                <p className="text-sm text-[#666666]">{formData.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E5E5E5] pt-4">
                                            <div>
                                                <span className="block text-xs font-mono text-[#999999] uppercase">Zone</span>
                                                <span className="font-medium">{formData.location?.replace("_", " ")}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-mono text-[#999999] uppercase">Date</span>
                                                <span className="font-medium">{formData.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>
                                            Once submitted, your report will be broadcast to the Found Item feed.
                                            We will also instantly check for existing matches.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#F2F2F2] flex justify-between bg-white z-10">
                    <button
                        onClick={handleBack}
                        disabled={step === 1 || loading}
                        className={`flex items-center gap-2 text-sm font-bold tracking-tight px-4 py-2 transition-colors
              ${step === 1 ? "text-[#E5E5E5] cursor-not-allowed" : "text-[#111111] hover:text-[#0055FF]"}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        BACK
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary py-2 px-6 text-sm"
                        >
                            NEXT STEP
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary py-2 px-6 text-sm bg-[#00C853] hover:bg-[#00B048] border-none text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    ACTIVATING PROTOCOL...
                                </>
                            ) : (
                                <>
                                    SUBMIT REPORT
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
