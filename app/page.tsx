import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24 bg-zinc-950 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-16 flex w-full justify-center border-b border-zinc-800 bg-zinc-950 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-zinc-900/30 lg:p-4 lg:dark:bg-zinc-800/30">
          Gotchu - Project Loop
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-violet-600 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-violet-900 after:to-transparent after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-violet-700 before:dark:opacity-10 after:dark:from-violet-900 after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-bold text-center">Gotchu</h1>
      </div>

      <div className="mt-8">
        <Link href="/feed">
          <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-violet-500 text-violet-400 hover:bg-violet-950 hover:text-violet-300">
            Browse Campus Feed
          </Button>
        </Link>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left mt-20 gap-8">
        <Link href="/report/lost" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/30">
          <h2 className=`mb-3 text-2xl font-semibold`>
            Lost Something?{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className=`m-0 max-w-[30ch] text-sm opacity-50`>
            Report a lost item and let the community help you find it.
          </p>
        </Link>

        <Link href="/report/found" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/30">
          <h2 className=`mb-3 text-2xl font-semibold`>
            Found Something?{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className=`m-0 max-w-[30ch] text-sm opacity-50`>
            Report a found item and earn Karma points.
          </p>
        </Link>
      </div>
    </main>
  );
}
