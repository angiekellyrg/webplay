import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function useRouteTracker(onRouteChange) {
  const location = useLocation()

  useEffect(() => {
    onRouteChange({
      path: location.pathname,
      visitedAt: new Date().toISOString(),
    })
  }, [location.pathname, onRouteChange])
}

export { useRouteTracker }
