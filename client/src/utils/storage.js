const storageKey = 'webplay-profile'

const createDefaultProfile = () => ({
  displayName: `Guest-${Math.floor(Math.random() * 900 + 100)}`,
})

const loadProfile = () => {
  if (typeof window === 'undefined') {
    return createDefaultProfile()
  }

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) {
      return createDefaultProfile()
    }

    const parsed = JSON.parse(raw)

    if (typeof parsed?.displayName !== 'string' || !parsed.displayName.trim()) {
      return createDefaultProfile()
    }

    return {
      displayName: parsed.displayName.trim(),
    }
  } catch {
    return createDefaultProfile()
  }
}

const saveProfile = (profile) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(profile))
}

export { loadProfile, saveProfile }
