'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  id: string
  business_name: string | null
  logo_url: string | null
  currency_symbol: string
  business_address: string | null
  business_phone: string | null
  website_url: string | null
  instagram_handle: string | null
  whatsapp_phone: string | null
}

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfileState: (newProfile: Profile) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const refreshProfile = async () => {
    setLoading(true)
    await fetchProfile()
  }

  const updateProfileState = (newProfile: Profile) => {
    setProfile(newProfile)
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, updateProfileState }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
