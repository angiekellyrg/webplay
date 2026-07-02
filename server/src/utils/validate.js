const normalize = (value) => String(value || '').replace(/[\u0000-\u001F\u007F]+/g, ' ').trim()

const requireText = (value, field, maxLength) => {
  const normalized = normalize(value).slice(0, maxLength)

  if (!normalized) {
    throw new Error(`${field} es obligatorio.`)
  }

  return normalized
}

export { requireText }
