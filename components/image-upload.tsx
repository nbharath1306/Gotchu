"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"
import { nanoid } from "nanoid"

interface ImageUploadProps {
    onUploadComplete: (url: string) => void
    onUploadStart?: () => void
    className?: string
}

export function ImageUpload({ onUploadComplete, onUploadStart, className = "" }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const supabase = createClient()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size too large (Max 5MB)")
            return
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }

        // Set preview
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        setUploading(true)
        setProgress(0)

        if (onUploadStart) onUploadStart()

        try {
            const fileExt = file.name.split(".").pop()
            const fileName = `${nanoid()}.${fileExt}`
            const filePath = `${fileName}` // Upload to root of bucket or organize by date if needed

            // Simulate progress (since Supabase JS v2 doesn't expose strict XHR progress easily in one go, 
            // but we can fake it reasonably well for small files, or just show 'Uploading...')
            // A better way with Supabase is usually just await upload. 
            // For real progress checking, we'd need TUS or carefully observing network, but a fake progress interval feels better than static.
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return prev + 10
                })
            }, 500)

            const { error: uploadError } = await supabase.storage
                .from("items")
                .upload(filePath, file)

            clearInterval(interval)

            if (uploadError) {
                throw uploadError
            }

            setProgress(100)

            const { data: { publicUrl } } = supabase.storage
                .from("items")
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
            toast.success("Image uploaded successfully")

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error)
            console.error("Upload failed:", error)
            toast.error("Upload failed: " + msg)
            setPreview(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } finally {
            setUploading(false)
        }
    }

    const clearImage = () => {
        setPreview(null)
        setProgress(0)
        if (fileInputRef.current) fileInputRef.current.value = ""
        onUploadComplete("") // Clear in parent
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666]">
                Evidence (Image)
            </label>

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#E5E5E5] p-8 text-center hover:bg-[#FFFFFF] hover:border-[#111111] transition-all group"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#F2F2F2] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-[#666666]" />
                        </div>
                        <span className="text-sm font-mono text-[#666666] group-hover:text-[#111111]">
                            CLICK TO UPLOAD IMAGE
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative border-2 border-[#111111] bg-white p-2">
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                            <div className="w-48 h-2 bg-[#E5E5E5] rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-[#111111] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono font-bold animate-pulse">
                                UPLOADING... {progress}%
                            </span>
                        </div>
                    )}

                    <div className="relative aspect-video bg-[#F2F2F2] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />

                        {!uploading && (
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-2 bg-[#111111] text-white hover:bg-[#FF4F4F] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
