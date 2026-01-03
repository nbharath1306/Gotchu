import { z } from "zod";

export const ReportSchema = z.object({
    title: z
        .string()
        .min(3, "Item name must be at least 3 characters long")
        .max(50, "Item name must be under 50 characters"),
    description: z
        .string()
        .min(10, "Please provide at least 10 characters of description to help identification")
        .max(500, "Description is too long (max 500 characters)"),
    category: z.enum(["Electronics", "ID", "Keys", "Other"], {
        message: "Please select a valid category",
    }),
    location: z.enum(
        ["Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels", "Other"],
        {
            message: "Please select a valid location zone",
        }
    ),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    type: z.enum(["LOST", "FOUND"]),
    image_url: z.string().optional().or(z.literal("")),
});

export type ReportType = z.infer<typeof ReportSchema>;
