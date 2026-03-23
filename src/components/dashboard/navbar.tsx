'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LogOut, User, Bell, Settings, Check, X, Loader2, Sparkles, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AccountSettingsModal from './account-settings-modal'

import { useProfile } from '@/context/profile-context'

export default function Navbar() {
  const router = useRouter()
  const { profile, updateProfileState } = useProfile()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (profile) {
      setNewBusinessName(profile.business_name || '')
    }
  }, [profile])

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setIsSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({ business_name: newBusinessName })
      .eq('id', user.id)

    if (!error) {
      updateProfileState({ ...profile!, business_name: newBusinessName })
      setIsEditModalOpen(false)
    }
    setIsSaving(false)
  }

  return (
    <>
      <header className="h-20 flex items-center justify-between px-10 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30 dark:bg-slate-950/70 dark:border-slate-800/50">
        <div className="flex-1" />
        
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all relative group active:scale-95"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                   <Sparkles size={16} className="text-indigo-600" />
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notificaciones</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium italic">No tienes notificaciones pendientes.</p>
              </div>
            )}
          </div>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2" />
          
          {/* Profile Button */}
          <div className="relative">
            <button 
              onClick={() => setIsEditModalOpen(!isEditModalOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center dark:bg-indigo-900/40 dark:border-indigo-800/50 group-hover:scale-105 transition-transform overflow-hidden">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[140px] tracking-tight">
                  {profile?.business_name || 'Mi Negocio'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate max-w-[140px] uppercase tracking-widest">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
            </button>

            {/* Edit Modal / Dropdown */}
            {isEditModalOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-8 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Perfil del Negocio</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)} 
                    className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <label className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-3 block">Nombre de Empresa</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newBusinessName}
                        onChange={(e) => setNewBusinessName(e.target.value)}
                        className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                        placeholder="Ej: BizTracker HQ"
                      />
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2 block">Email de Acceso</label>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{user?.email}</span>
                      <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Verificado</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        setIsSettingsModalOpen(true)
                        setIsEditModalOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <Settings size={16} />
                      Configuración de Cuenta
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            disabled={loading}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl dark:hover:bg-red-900/20 transition-all group disabled:opacity-50 active:scale-95"
            title="Cerrar Sesión"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </header>

      <AccountSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onUpdate={(newProfile) => {
          updateProfileState(newProfile)
          setNewBusinessName(newProfile.business_name || '')
        }}
      />
    </>
  )
}
