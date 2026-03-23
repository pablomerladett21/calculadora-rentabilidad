'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  X, 
  Upload, 
  Globe, 
  Instagram, 
  Phone, 
  MapPin, 
  Check, 
  Loader2, 
  Image,
  Hash,
  Link as LinkIcon,
  MessageCircle
} from 'lucide-react'

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  onUpdate: (newProfile: any) => void
}

export default function AccountSettingsModal({ isOpen, onClose, profile, onUpdate }: AccountSettingsModalProps) {
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    currency_symbol: profile?.currency_symbol || '$',
    business_address: profile?.business_address || '',
    business_phone: profile?.business_phone || '',
    website_url: profile?.website_url || '',
    instagram_handle: profile?.instagram_handle || '',
    whatsapp_phone: profile?.whatsapp_phone || '',
  })
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        currency_symbol: profile.currency_symbol || '$',
        business_address: profile.business_address || '',
        business_phone: profile.business_phone || '',
        website_url: profile.website_url || '',
        instagram_handle: profile.instagram_handle || '',
        whatsapp_phone: profile.whatsapp_phone || '',
      })
      setLogoUrl(profile.logo_url || '')
    }
  }, [profile])

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business_logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business_logos')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)
    } catch (err: any) {
      setError('Error al subir la imagen: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...formData,
          logo_url: logoUrl,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      onUpdate({ ...profile, ...formData, logo_url: logoUrl })
      onClose()
    } catch (err: any) {
      setError('Error al guardar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configuración de Cuenta</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personaliza tu perfil de negocio</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500 shadow-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-slate-300" size={32} />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Upload size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Logo del Negocio</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Recomendado: Cuadrado (800x800px)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Comercial</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Hash size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.business_name}
                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Ej: Bazar El Sol"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Símbolo de Moneda</label>
                <div className="flex gap-2">
                  {['$', '€', 'S/', 'Gs', 'U$D'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, currency_symbol: s })}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                        formData.currency_symbol === s 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teléfono</label>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.business_phone}
                    onChange={e => setFormData({ ...formData, business_phone: e.target.value })}
                    placeholder="Ej: +54 9 11..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dirección</label>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.business_address}
                    onChange={e => setFormData({ ...formData, business_address: e.target.value })}
                    placeholder="Ej: Av. Principal 123"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="space-y-4 pt-4">
             <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] px-1">Presencia Digital</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="relative group">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.website_url}
                      onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="Sitio Web"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative group">
                    <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.instagram_handle}
                      onChange={e => setFormData({ ...formData, instagram_handle: e.target.value })}
                      placeholder="@Instagram"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative group">
                    <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.whatsapp_phone}
                      onChange={e => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                      placeholder="WhatsApp"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs dark:text-white transition-all border border-transparent focus:border-indigo-500/20"
                    />
                  </div>
                </div>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50">
              <p className="text-xs text-red-600 font-bold tracking-tight">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 pt-4 bg-slate-50 dark:bg-slate-800/30 flex gap-4 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={onClose}
             className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
           >
             Cancelar
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSaving}
             className="flex-[2] py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
             {isSaving ? 'Guardando...' : 'Guardar Cambios'}
           </button>
        </div>
      </div>
    </div>
  )
}
