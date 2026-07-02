const formatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
})

const formatTimestamp = (value) => {
  if (!value) {
    return 'Sin fecha'
  }

  return formatter.format(new Date(value))
}

export { formatTimestamp }
