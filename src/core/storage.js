
import { normalize } from './schema'

const KEY = 'expo-panel-config'

export function save(config) {
  localStorage.setItem(KEY, JSON.stringify(config))
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? normalize(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function clear() {
  localStorage.removeItem(KEY)
}

export function exportFile(config) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(config.title || 'panel').replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return reject(new Error('Файл не выбран'))
      const reader = new FileReader()
      reader.onload = () => {
        try {
          resolve(normalize(JSON.parse(String(reader.result))))
        } catch (e) {
          reject(new Error('Некорректный JSON: ' + e.message))
        }
      }
      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsText(file)
    }
    input.click()
  })
}
