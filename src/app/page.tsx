"use client"

import { ScatterPlot } from "@/components/webr/scatter-plot"

export default function Home() {
  return (
    <main className="m-auto min-h-screen max-w-4xl p-10 flex flex-col gap-10 items-center">
      <h1 className="font-semibold text-2xl">WebR + Next.js Example</h1>
      <div className="w-full p-10">
        <ScatterPlot path="http://localhost:3000/brabanders.csv" />
      </div>
    </main>
  )
}
