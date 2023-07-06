"use client"

import { useState, useEffect } from "react"
import { WebR } from "@r-wasm/webr"
import { RDataFrameToObject } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js"
import { Chart } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
)

const webR = new WebR()

export const CorrelationPlot = () => {
  const [sampleSize, setSampleSize] = useState(100)
  const [correlation, setCorrelation] = useState(0.5)
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>()
  const [lineData, setLineData] = useState<{ x: number; y: any }[]>()

  async function simulate() {
    await webR.init()
    const webRData = await webR.evalR(
      `
        scale_values <- function(x) {(x-min(x)) / (max(x) - min(x))}

        N <- ${sampleSize}
        rho <- ${correlation}
        x1 <- rnorm(n = N, mean = 0, sd = 1)
        x2 <- (rho * x1) + sqrt(1 - rho * rho) * rnorm(n = N, mean = 0, sd = 1)

        x1 <- scale_values(x1)
        x2 <- scale_values(x2)

        model <- lm(x2 ~ x1)
        fit <- predict(model)

        data.frame(
          x = x1,
          y = x2,
          fit = fit
        )
      `
    )
    try {
      const df = await RDataFrameToObject(webRData)

      const x = df.x as number[]
      const y = df.y as number[]
      const fit = df.fit as number[]

      const chartScatterData = x.map((_value, i) => {
        return {
          x: x[i],
          y: y[i],
        }
      })
      setScatterData(chartScatterData)

      const indexMin = x.indexOf(Math.min(...x))
      const indexMax = x.indexOf(Math.max(...x))

      const chartLineData = [
        {
          x: x[indexMin],
          y: fit[indexMin],
        },
        {
          x: x[indexMax],
          y: fit[indexMax],
        },
      ]
      setLineData(chartLineData)
    } finally {
      webR.destroy(webRData)
    }
  }

  useEffect(() => {
    simulate()
  }, [])

  return (
    <div>
      <Chart
        type="scatter"
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
              type: "scatter",
              label: "Dataset 1",
              data: scatterData,
              borderColor: "#1A56DB",
              backgroundColor: "#1A56DB",
            },
            {
              type: "line",
              label: "Dataset 2",
              data: lineData,
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
          onChange={(e) =>
            setSampleSize(Math.min(Math.max(e.target.valueAsNumber, 1), 1000))
          }
        />
        <Label htmlFor="correlation">Correlation</Label>
        <div className="flex space-x-3">
          <Slider
            id="correlation"
            defaultValue={[0.5]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={(number) => setCorrelation(number[0])}
          />
          <Label>{correlation}</Label>
        </div>
        <Button className="mt-3" onClick={simulate}>
          Simulate
        </Button>
      </div>
    </div>
  )
}
