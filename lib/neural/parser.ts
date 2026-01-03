export type ParsedSignal = {
    original: string;
    category: string | null;
    location: string | null;
    color: string | null;
    confidence: number;
};

const DICTIONARIES = {
    categories: {
        Electronics: ["phone", "iphone", "laptop", "macbook", "ipad", "tablet", "airpods", "headphones", "charger", "mouse"],
        Keys: ["keys", "keychain", "fob", "car key"],
        "ID / Wallet": ["wallet", "id", "card", "license", "passport", "purse"],
        Clothing: ["jacket", "coat", "hoodie", "sweater", "scarf", "hat", "cap", "gloves", "umbrella"],
        Documents: ["notebook", "book", "folder", "paper", "assignment", "file"],
    },
    locations: {
        "Innovation_Labs": ["lab", "innovation", "maker space", "workshop"],
        "Canteen": ["canteen", "cafeteria", "food", "lunch", "dining"],
        "Bus_Bay": ["bus", "stop", "transport", "shuttle"],
        "Library": ["library", "books", "reading room", "study"],
        "Hostels": ["hostel", "dorm", "room", "block"],
        "Sports_Complex": ["gym", "court", "field", "sports", "ground"],
    },
    colors: ["red", "blue", "green", "black", "white", "silver", "grey", "gray", "gold", "pink", "purple", "yellow", "orange", "brown"]
};

export class NeuralParser {
    static parse(text: string): ParsedSignal {
        const lower = text.toLowerCase();

        let category = null;
        let location = null;
        let color = null;
        let confidence = 0;

        // 1. Extract Color
        for (const c of DICTIONARIES.colors) {
            if (lower.includes(c)) {
                color = c;
                confidence += 0.2;
                break; // Assume single color for simplicity
            }
        }

        // 2. Extract Category
        for (const [cat, keywords] of Object.entries(DICTIONARIES.categories)) {
            if (keywords.some(k => lower.includes(k))) {
                category = cat;
                confidence += 0.5;
                break;
            }
        }

        // 3. Extract Location
        for (const [loc, keywords] of Object.entries(DICTIONARIES.locations)) {
            if (keywords.some(k => lower.includes(k))) {
                location = loc;
                confidence += 0.3;
                break;
            }
        }

        return {
            original: text,
            category,
            location,
            color,
            confidence: Math.min(confidence, 1.0)
        };
    }
}
