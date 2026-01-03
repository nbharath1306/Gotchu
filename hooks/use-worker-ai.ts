import { useState, useRef, useEffect, useCallback } from 'react';

export function useWorkerAI() {
    const workerRef = useRef<Worker | null>(null);
    const [result, setResult] = useState<any>(null);
    const [embedding, setEmbedding] = useState<number[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const [progress, setProgress] = useState<{ status: string; task?: string; progress?: number; file?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [workerStatus, setWorkerStatus] = useState<string>("STARTING");

    useEffect(() => {
        if (!workerRef.current) {
            try {
                // Load from public folder to avoid Webpack bundling weirdness
                setWorkerStatus("CREATING");
                addLog("Creating Worker...");
                workerRef.current = new Worker('/ai-worker.js', { type: "module" });
                setWorkerStatus("READY");

                workerRef.current.onerror = (err) => {
                    const msg = err instanceof Event ? "Worker load failed (404/CORS)" : (err as any).message || String(err);
                    console.error("AI Worker Startup Error:", err);
                    setError(msg);
                    addLog("Worker Error: " + msg);
                    setWorkerStatus("ERROR");
                    setIsLoading(false);
                };

                workerRef.current.addEventListener('message', (event) => {
                    const { status, task } = event.data;
                    console.log("Worker Message:", status);

                    if (status === 'init_alive') {
                        addLog("Worker Alive Signal Received");
                        setWorkerStatus("ALIVE");
                        return;
                    }

                    if (status !== 'error') {
                        setError(null);
                    }

                    if (status === 'progress') {
                        const { file, progress } = event.data;
                        if (progress !== undefined) {
                            // Only log sporadic progress to avoid spam
                            if (Math.round(progress) % 10 === 0) addLog(`Progress: ${Math.round(progress)}%`);
                        }
                        setProgress({ status: 'loading', task, file, progress });
                        setIsLoading(true);
                    } else if (status === 'complete') {
                        addLog(`Complete: ${task}`);
                        if (task === 'vision' || !task) {
                            setResult(event.data.output);
                        } else if (task === 'nlp') {
                            setEmbedding(event.data.output);
                        }
                        setProgress(null);
                        setIsLoading(false);
                    } else if (status === 'error') {
                        console.error("AI Worker Error:", event.data);
                        setError(event.data.error || "Processing failed");
                        addLog("Error: " + (event.data.error || "Unknown"));
                        setIsLoading(false);
                        setProgress(null);
                    }
                });
            } catch (e: any) {
                console.error("Worker Init Failed", e);
                setError("Worker Init Failed: " + e.message);
                addLog("Crash: " + e.message);
                setWorkerStatus("CRASHED");
            }
        }

        return () => {
            if (workerRef.current) {
                console.log("Terminating Worker");
                workerRef.current.terminate();
                workerRef.current = null;
                setWorkerStatus("TERMINATED");
            }
        };
    }, []);

    const classifyImage = useCallback((imageUrl: string) => {
        addLog("Classify Requested");
        if (!workerRef.current) {
            console.error("Worker dead, cannot classify");
            setError("Worker is dead/null");
            addLog("Failed: Worker Dead");
            return;
        }
        try {
            setResult(null);
            setIsLoading(true);
            console.log("Posting message to worker...");
            workerRef.current.postMessage({ type: 'classify', payload: imageUrl });
            addLog("Message Posted to Worker");
        } catch (e: any) {
            console.error("PostMessage Failed", e);
            setError("PostMessage Failed: " + e.message);
            addLog("PostMessage Crash");
            setIsLoading(false);
        }
    }, []);

    const embedText = useCallback((text: string) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'embed', payload: text });
        }
    }, []);

    return { result, embedding, classifyImage, embedText, progress, isLoading, error, workerStatus, logs };
}
