"use client"

import { WebR } from "webr"
const webR = new WebR()

import { RandomNumbers } from "@/components/random-numbers"
import { DataFrame } from "@/components/data-frame"

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div>
        <h1 className="text-4xl p-12">Next.js</h1>
      </div>
      <div className="flex gap-3">
        <div className="w-60">
          <RandomNumbers webR={webR} />
        </div>
        <DataFrame webR={webR} />
      </div>
    </main>
  )
}
