import { create } from 'zustand'
import { useFinanceStore } from './useFinanceStore'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

// ── Startup token validation ──────────────────────────────────────────────────
// Decodes the JWT payload client-side (no signature verification — server does
// that). Clears localStorage immediately if the token is:
//   • missing / not a 3-part JWT string  (malformed)
//   • has an unparseable payload          (corrupted)
//   • has an `exp` claim that is in the past (expired)
// This prevents a "401 storm" when the app boots with a stale token.
function isTokenValid(token: string | null): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false   // not a JWT at all

  try {
    // Base64-decode the payload (middle segment)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    // Check expiry if present
    if (payload.exp && Date.now() >= payload.exp * 1000) return false

    return true
  } catch {
    return false   // JSON.parse or atob failed → corrupted
  }
}

// Validate once at module load time and wipe stale data before store creation
const rawToken = localStorage.getItem('token')
const rawUser  = localStorage.getItem('user')

if (!isTokenValid(rawToken)) {
  // Token is stale, malformed, or expired — clean slate
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.info('[Auth] Stale/malformed token cleared on startup.')
}

const storedToken = isTokenValid(rawToken) ? rawToken : null
const storedUser  = storedToken ? rawUser : null

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    useFinanceStore.getState().clearData()
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (data) => set((state) => {
    if (!state.user) return { user: null }
    const updatedUser = { ...state.user, ...data }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return { user: updatedUser }
  }),
}))
