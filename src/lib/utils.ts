import { WebRDataJsAtomic, WebRDataJsNode } from "@r-wasm/webr/robj"
import { RObject } from "@r-wasm/webr/robj-main"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function RDataFrameToObject(x: RObject) {
  const js = (await x.toJs()) as WebRDataJsNode

  const columns: { [key: string]: unknown[] } = {}

  js.names!.map((name, i) => {
    const values = js.values[i] as WebRDataJsAtomic<unknown[]>
    columns[name!] = values.values
  })

  return columns
}
