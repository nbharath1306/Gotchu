import { useState, useRef, useEffect, useCallback } from 'react';

// Define explicit types for Worker messages to avoid 'any'
type WorkerStatus = "STARTING" | "CREATING" | "READY" | "ALIVE" | "ERROR" | "CRASHED" | "TERMINATED";

interface WorkerMessage {
    status: string;
    task?: string;
    file?: string;
    progress?: number;
    output?: unknown; // output can vary (vision vs nlp)
    error?: string;
}

export function useWorkerAI() {
    const workerRef = useRef<Worker | null>(null);
    const [result, setResult] = useState<unknown>(null);
    const [embedding, setEmbedding] = useState<number[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
        setLogs((prev: string[]) => [msg, ...prev].slice(0, 5));
    }, []);

    const [progress, setProgress] = useState<{ status: string; task?: string; progress?: number; file?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [workerStatus, setWorkerStatus] = useState<WorkerStatus>("READY");

    useEffect(() => {
        if (!workerRef.current) {
            try {
                // Initialize Worker
                const worker = new Worker('/ai-worker.js', { type: "module" });
                workerRef.current = worker;

                // addLog("Worker Created"); // Removed to avoid setState in effect warning

                worker.onerror = (err) => {
                    const msg = err instanceof Event ? "Worker load failed (404/CORS)" : (err as Error).message || String(err);
                    console.error("AI Worker Startup Error:", err);
                    // Defer state update to avoid synchronous effect warning
                    setTimeout(() => {
                        setError(msg);
                        addLog("Worker Error: " + msg);
                        setWorkerStatus("ERROR");
                        setIsLoading(false);
                    }, 0);
                };

                worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
                    const { status, task } = event.data;
                    // console.log("Worker Message:", status); // Reduced noise

                    if (status === 'init_alive') {
                        addLog("Worker Alive Signal Received");
                        setWorkerStatus("ALIVE");
                        return;
                    }

                    if (status !== 'error') {
                        setError(null);
                    }

                    if (status === 'progress') {
                        const { file, progress: p } = event.data;
                        if (p !== undefined) {
                            if (Math.round(p) % 10 === 0) addLog(`Progress: ${Math.round(p)}%`);
                        }
                        setProgress({ status: 'loading', task, file, progress: p });
                        setIsLoading(true);
                    } else if (status === 'complete') {
                        addLog(`Complete: ${task}`);
                        if (task === 'vision' || !task) {
                            setResult(event.data.output);
                        } else if (task === 'nlp') {
                            setEmbedding(event.data.output as number[]);
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
            } catch (e: unknown) {
                const errMsg = e instanceof Error ? e.message : String(e);
                console.error("Worker Init Failed", e);
                // Defer state update
                setTimeout(() => {
                    setError("Worker Init Failed: " + errMsg);
                    addLog("Crash: " + errMsg);
                    setWorkerStatus("CRASHED");
                }, 0);
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
    }, [addLog]); // Added addLog to inputs (it's memoized)

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
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error("PostMessage Failed", e);
            setError("PostMessage Failed: " + errMsg);
            addLog("PostMessage Crash");
            setIsLoading(false);
        }
    }, [addLog]);

    const embedText = useCallback((text: string) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'embed', payload: text });
        }
    }, []);

    return { result, embedding, classifyImage, embedText, progress, isLoading, error, workerStatus, logs };
}
