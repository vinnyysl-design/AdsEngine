import * as XLSX from 'xlsx'

export function brl(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

export function pct(value) {
  return `${Number(value || 0).toFixed(2).replace('.', ',')}%`
}

export function parseExcel(file, onData) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const firstSheet = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
    onData(json)
  }
  reader.readAsArrayBuffer(file)
}
