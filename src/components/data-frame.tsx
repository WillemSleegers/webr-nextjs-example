"use client"

import { useState, useEffect } from "react"
import { WebR } from "webr"

type DataFrameProps = {
  webR: WebR
}

export const DataFrame = ({ webR }: DataFrameProps) => {
  const [status, setStatus] = useState("Loading webR...")
  const [values, setValues] = useState<any>()

  async function createDataFrame() {
    await webR.init()

    const data = [
      { a: 0, b: "x" },
      { a: 1, b: "y" },
    ]
    const result = await new webR.RObject(data)
    await webR.objs.globalEnv.bind("foo", result)
    await webR.evalR("print(class(foo))")

    return result
  }

  useEffect(() => {
    ;(async () => {
      setStatus("Creating data frame")
      const values = await createDataFrame()
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
        </div>
      )}
    </div>
  )
}
