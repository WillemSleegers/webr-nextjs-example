"use client"

import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { useState, useEffect, ChangeEvent } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Scatter } from "react-chartjs-2"
import { Button } from "../ui/button"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const webR = new WebR()

export const ScatterPlot = () => {
  const [sampleSize, setSampleSize] = useState(100)
  const [correlation, setCorrelation] = useState(0.5)
  const [data, setData] = useState<{ x: any; y: any }[]>()

  async function simulate() {
    await webR.init()
    const webRData = await webR.evalR(
      `
        N <- ${sampleSize}
        rho <- ${correlation}
        x1 <- rnorm(n = N, mean = 0, sd = 1)
        x2 <- (rho * x1) + sqrt(1 - rho * rho) * rnorm(n = N, mean = 0, sd = 1)

        data.frame(
          x = x1,
          y = x2
        )
      `
    )
    try {
      const webRDataJs = (await webRData.toJs()) as WebRDataJsNode

      const xDataJs = webRDataJs.values[0] as WebRDataJsAtomic<any[]>
      const yDataJs = webRDataJs.values[1] as WebRDataJsAtomic<any[]>

      const chartData = xDataJs.values.map((_value, i) => {
        return {
          x: xDataJs.values[i],
          y: yDataJs.values[i],
        }
      })
      setData(chartData)
    } finally {
      webR.destroy(webRData)
    }
  }

  const handleSampleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSampleSize(Math.min(Math.max(e.target.valueAsNumber, 1), 1000))
  }

  const handleCorrelationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCorrelation(Math.min(Math.max(e.target.valueAsNumber, -1), 1))
  }

  useEffect(() => {
    simulate()
  }, [])

  return (
    <div>
      <Scatter
        options={{
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "X",
                color: "#9CA3AF",
              },
              ticks: {
                color: "#9CA3AF",
              },
              grid: {
                color: "#374151",
              },
            },
            y: {
              title: {
                display: true,
                text: "Y",
                color: "#9CA3AF",
              },
              ticks: {
                color: "#9CA3AF",
              },
              grid: {
                color: "#374151",
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {},
            },
            legend: {
              display: false,
            },
          },
        }}
        data={{
          datasets: [
            {
              label: "Dataset 1",
              data: data,
              borderColor: "#1A56DB",
              backgroundColor: "#1A56DB",
            },
          ],
        }}
      />
      <div className="max-w-xs flex flex-col gap-3">
        <Label htmlFor="sampleSize">Sample size</Label>
        <Input
          id="sampleSize"
          type="number"
          min={1}
          max={1000}
          value={sampleSize}
          onChange={handleSampleSizeChange}
        />
        <Label htmlFor="correlation">Correlation</Label>
        <Input
          id="correlation"
          type="number"
          min={-1}
          max={1}
          step={0.1}
          value={correlation}
          onChange={handleCorrelationChange}
        />
        <Button onClick={simulate}>Simulate</Button>
      </div>
    </div>
  )
}
