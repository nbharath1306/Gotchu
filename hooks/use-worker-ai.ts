import { useState, useRef, useEffect, useCallback } from 'react';

export function useWorkerAI() {
    const workerRef = useRef<Worker | null>(null);
    const [result, setResult] = useState<any>(null); // Vision result
    const [embedding, setEmbedding] = useState<number[] | null>(null); // NLP result
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<{ status: string; task?: string; progress?: number; file?: string } | null>(null);

    useEffect(() => {
        if (!workerRef.current) {
            // Load from public folder to avoid Webpack bundling weirdness
            // Note: type: "module" is needed because we use import in the worker
            workerRef.current = new Worker('/ai-worker.js', { type: "module" });

            workerRef.current.addEventListener('message', (event) => {
                const { status, task } = event.data;

                if (status === 'progress') {
                    const { file, progress } = event.data;
                    setProgress({ status: 'loading', task, file, progress });
                    setIsLoading(true);
                } else if (status === 'complete') {
                    if (task === 'vision' || !task) {
                        setResult(event.data.output);
                    } else if (task === 'nlp') {
                        setEmbedding(event.data.output);
                    }
                    setProgress(null);
                    setIsLoading(false);
                } else if (status === 'error') {
                    console.error("AI Worker Error:", event.data);
                    setIsLoading(false);
                    setProgress(null);
                }
            });
        }

        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const classifyImage = useCallback((imageUrl: string) => {
        if (workerRef.current) {
            setResult(null); // Clear previous result
            setIsLoading(true);
            workerRef.current.postMessage({ type: 'classify', payload: imageUrl });
        }
    }, []);

    const embedText = useCallback((text: string) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'embed', payload: text });
        }
    }, []);

    return { result, embedding, classifyImage, embedText, progress, isLoading };
}
