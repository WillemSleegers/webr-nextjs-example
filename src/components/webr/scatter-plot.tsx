"use client"

import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { useState, useEffect, ChangeEvent } from "react"
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

  const handleXColumn = (e: ChangeEvent<HTMLSelectElement>) => {
    setXColumn(e.target.value)
  }
  const handleYColumn = (e: ChangeEvent<HTMLSelectElement>) => {
    setYColumn(e.target.value)
  }

  useEffect(() => {
    async function loadColumns() {
      await webR.init()
      console.log("loading columns init")
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
      console.log("single line chart init")
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

        console.log(chartData)
        setData(chartData)
      } finally {
        webR.destroy(webRData)
      }
    }

    if (xColumn && yColumn) {
      loadData()
    }
  }, [xColumn, yColumn])

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
          <div>
            <label
              htmlFor="columnX"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              X-axis
            </label>
            {columns && (
              <select
                id="columnX"
                onChange={handleXColumn}
                defaultValue={xColumn}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {columns?.map((column) => (
                  <option key={column}>{column}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label
              htmlFor="columnY"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Y-axis
            </label>

            <select
              id="columnY"
              onChange={handleYColumn}
              defaultValue={yColumn}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {columns?.map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
