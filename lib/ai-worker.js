import { pipeline, env } from '@xenova/transformers';

// Skip local model checks (we use CDN for browser)
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton for Vision
class VisionPipeline {
    static task = 'image-classification';
    static model = 'Xenova/vit-base-patch16-224';
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
    const { type, payload, image } = event.data; // Added 'image' for backward compatibility

    try {
        if (image || type === 'classify') { // Handle legacy {image} or new {type: 'classify'}
            const imgData = image || payload;
            const classifier = await VisionPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', task: 'vision', ...x });
            });
            const output = await classifier(imgData);
            self.postMessage({ status: 'complete', task: 'vision', output });
        }

        else if (type === 'embed') {
            const extractor = await EmbeddingPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', task: 'nlp', ...x });
            });

            // Generate embedding (mean pooling explanation: https://huggingface.co/Xenova/all-MiniLM-L6-v2)
            const output = await extractor(payload, { pooling: 'mean', normalize: true });

            // Output is a Tensor. We need a plain array.
            const embedding = Array.from(output.data);

            self.postMessage({ status: 'complete', task: 'nlp', output: embedding });
        }

    } catch (e) {
        self.postMessage({ status: 'error', error: e.message });
    }
});
