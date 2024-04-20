import { RandomNumbers } from "@/components/random-numbers"

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div>
        <h1 className="text-4xl p-12">Next.js</h1>
      </div>
      <RandomNumbers />
    </main>
  )
}
