import { useContext } from 'react'

import { AppContext } from './AppContext'

const useAppContext = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider')
  }

  return context
}

export { useAppContext }
