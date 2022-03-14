import conversableUnits, { makeConversableKey } from "@/sdk/unitConversion/conversableUnits"
import scalableUnits from "@/sdk/unitConversion/scalableUnits"
import convert from "@/sdk/unitConversion"

const scalable = (units, min, max, desiredUnits) => {
  const scales = scalableUnits[units]

  if (desiredUnits !== "auto") {
    return desiredUnits in scales ? ["divide", scales[desiredUnits], desiredUnits] : ["original"]
  }

  const absMin = Math.abs(min)
  const absMax = Math.abs(max)
  const delta = absMin > absMax ? absMin : absMax

  const scale = Object.keys(scales)
    .reverse()
    .find(scale => delta > scales[scale])

  return scale ? ["divide", scales[scale], scale] : ["original"]
}

const conversable = (chart, units, max, desiredUnits) => {
  const scales = conversableUnits[units]

  if (desiredUnits !== "auto") {
    return desiredUnits in scales
      ? [makeConversableKey(units, desiredUnits), undefined, desiredUnits]
      : ["original"]
  }

  const scaleKeys = Object.keys(scales)
  const scaleIndex = scaleKeys.findIndex(scale => scales[scale].check(chart, max))

  if (scaleIndex === -1) return ["original"]

  const key = scaleKeys[scaleIndex]
  return [makeConversableKey(units, key), undefined, key]
}

const getMethod = (chart, units, min, max) => {
  const { desiredUnits } = chart.getAttributes()

  if (desiredUnits === "original") return ["original"]

  if (scalableUnits[units]) return scalable(units, min, max, desiredUnits)

  if (conversableUnits[units]) return conversable(chart, units, max, desiredUnits)

  return ["original"]
}

const decimals = [1000, 10, 1, 0.1, 0.01, 0.001, 0.0001]

const getFractionDigits = value => {
  const index = decimals.findIndex(d => value > d)
  return index === -1 ? decimals.length : getFilteredIndex(index)
}

const getFilteredIndex = index => (index === 3 ? 2 : index)

export default (chart, min, max) => {
  const { units: metadataUnits } = chart.getMetadata()
  const { units: attributeUnits } = chart.getAttributes()
  const units = attributeUnits || metadataUnits

  const [method, divider, unitsConversion = units] = getMethod(chart, units, min, max)

  const cMin = convert(chart, method, min, divider)
  const cMax = convert(chart, method, max, divider)

  const delta = Math.abs(cMin === cMax ? cMin : cMax - cMin)

  const fractionDigits =
    method === "original" || method === "divide" ? getFractionDigits(delta) : -1

  return { method, divider, units: unitsConversion, fractionDigits }
}
