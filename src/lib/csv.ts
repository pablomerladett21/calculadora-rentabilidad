export function parseCsv(text: string) {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current.trim())
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++
      }
      row.push(current.trim())
      current = ''
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      row = []
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim())
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row)
    }
  }

  if (rows.length === 0) return []

  const [headers, ...dataRows] = rows
  return dataRows
    .filter((dataRow) => dataRow.some((cell) => cell.length > 0))
    .map((dataRow) => {
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header.trim().toLowerCase()] = (dataRow[index] || '').trim()
      })
      return record
    })
}
