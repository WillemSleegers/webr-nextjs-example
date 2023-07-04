"use client"

import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Line } from "react-chartjs-2"

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

type ScatterPlotProps = {
  path: string
}

export const ScatterPlot = ({ path }: ScatterPlotProps) => {
  const [columns, setColumns] = useState<string[]>()
  const [xColumn, setXColumn] = useState<string>()
  const [yColumn, setYColumn] = useState<string>()
  const [data, setData] = useState<{ x: any; y: any }[]>()

  useEffect(() => {
    async function loadColumns() {
      await webR.init()
      const columnsR = await webR.evalRRaw(
        `
          data <- read.csv("${path}", nrows = 1)
          colnames(data)
        `,
        "string[]"
      )
      setColumns(columnsR)
      setXColumn(columnsR[0])
      setYColumn(columnsR[1])
    }
    loadColumns()
  }, [])

  useEffect(() => {
    async function loadData() {
      await webR.init()
      const webRData = await webR.evalR(
        `
          data <- read.csv("${path}")

          data.frame(
            x = data["${xColumn}"],
            y = data["${yColumn}"]
          )
        `
      )
      try {
        const webRDataJs = (await webRData.toJs()) as WebRDataJsNode

        const xDataJs = webRDataJs.values[0] as WebRDataJsAtomic<any[]>
        const yDataJs = webRDataJs.values[1] as WebRDataJsAtomic<any[]>

        const chartData = xDataJs.values.map((value, i) => {
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

    if (xColumn && yColumn) {
      loadData()
    }
  }, [path, xColumn, yColumn])

  return (
    <div>
      {data && xColumn && yColumn && (
        <Line
          options={{
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: xColumn,
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
                  text: yColumn,
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
      )}
      {columns && (
        <div className="flex gap-3">
          <Select onValueChange={(x) => setXColumn(x)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="x-axis" />
            </SelectTrigger>
            <SelectContent>
              {columns?.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(y) => setYColumn(y)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="y-axis" />
            </SelectTrigger>
            <SelectContent>
              {columns?.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
