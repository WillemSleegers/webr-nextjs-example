"use client"

import { useState, useEffect } from "react"
import { WebR } from "webr"

type RandomNumbersProps = {
  webR: WebR
}

export const RandomNumbers = ({ webR }: RandomNumbersProps) => {
  const [status, setStatus] = useState("Loading webR...")
  const [values, setValues] = useState<number[]>([])

  async function getRandomNumbers() {
    await webR.init()
    const result = await webR.evalRRaw("rnorm(20,10,10)", "number[]")

    return result
  }

  useEffect(() => {
    ;(async () => {
      setStatus("Getting random numbers")
      const values = await getRandomNumbers()
      setValues(values)
      setStatus("Ready")
    })()
  }, [])

  return (
    <div className="App">
      <p className="mb-3">Status: {status}</p>
      {status == "Ready" && (
        <div>
          <p>Result of running R code:</p>
          {values.map((n, idx) => (
            <p key={idx}>{n}</p>
          ))}
        </div>
      )}
    </div>
  )
}
