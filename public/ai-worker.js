
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0';

// Skip local model checks (we use CDN for browser)
env.allowLocalModels = false;
env.useBrowserCache = true;

self.postMessage({ status: 'init_alive', message: 'Worker script loaded' });

// The "Menu" of things we expect to find.
// This restricts the AI to relevant items, preventing hallucinations like "Ostrich".
const CANDIDATE_LABELS = [
    "keys", "car key", "keychain",
    "wallet", "purse", "handbag", "credit card", "id card", "passport",
    "smartphone", "iphone", "android phone", "phone case",
    "laptop", "macbook", "laptop bag", "tablet", "ipad", "kindle",
    "headphones", "earbuds", "airpods", "speaker",
    "smartwatch", "apple watch", "wristwatch",
    "glasses", "sunglasses", "case",
    "backpack", "rucksack", "tote bag", "luggage", "suitcase",
    "jacket", "coat", "clothing", "shoe", "sneaker", "hat", "umbrella",
    "water bottle", "tumbler", "thermos",
    "jewelry", "ring", "necklace", "bracelet", "watch",
    "document", "book", "notebook", "textbook",
    "camera", "lens",
    "musical instrument", "guitar",
    "bicycle", "scooter", "skateboard", "helmet",
    "toy", "plushie",
    "tool", "charger", "cable",
    "pet", "dog", "cat"
];

// Singleton for Vision (CLIP Zero-Shot)
class VisionPipeline {
    static task = 'zero-shot-image-classification';
    static model = 'Xenova/clip-vit-base-patch32';
    static instance = null;

    static async getInstance(progressCallback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
        }
        return this.instance;
    }
}

// Singleton for NLP (Embeddings)
class EmbeddingPipeline {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance = null;

    static async getInstance(progressCallback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, payload, image } = event.data;

    try {
        if (image || type === 'classify') {
            const imgData = image || payload;

            // Re-use VisionPipeline but now it's CLIP
            const classifier = await VisionPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', task: 'vision', ...x });
            });

            // Zero-Shot call needs candidates
            const output = await classifier(imgData, CANDIDATE_LABELS, {
                hypothesis_template: "A photo of a {}"
            });

            // Output is usually [{ label: 'keys', score: 0.9 }, ...]
            // Should be compatible with existing UI which expects array of { label, score }
            self.postMessage({ status: 'complete', task: 'vision', output });
        }

        else if (type === 'embed') {
            const extractor = await EmbeddingPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', task: 'nlp', ...x });
            });

            const output = await extractor(payload, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);

            self.postMessage({ status: 'complete', task: 'nlp', output: embedding });
        }

    } catch (e) {
        self.postMessage({ status: 'error', error: e.message });
    }
});
