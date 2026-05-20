'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Check, Globe, Hash, Instagram, Loader2, MapPin, MessageCircle, Phone, Upload } from 'lucide-react'
import type { BusinessProfileRecord } from '@/lib/app-types'

interface BusinessProfileFormProps {
  profile: BusinessProfileRecord | null
  onSaved: (profile: BusinessProfileRecord) => void
}

export default function BusinessProfileForm({ profile, onSaved }: BusinessProfileFormProps) {
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
    if (!profile) return
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
  }, [profile])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('business_logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business_logos')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError('Error al subir la imagen: ' + message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
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

      onSaved({
        id: profile?.id || user.id,
        business_name: formData.business_name || null,
        currency_symbol: formData.currency_symbol || '$',
        business_address: formData.business_address || null,
        business_phone: formData.business_phone || null,
        website_url: formData.website_url || null,
        instagram_handle: formData.instagram_handle || null,
        whatsapp_phone: formData.whatsapp_phone || null,
        logo_url: logoUrl || null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError('Error al guardar: ' + message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
        <div className="space-y-4">
          <Field label="Nombre Comercial" icon={<Hash size={16} />} value={formData.business_name} onChange={(value) => setFormData({ ...formData, business_name: value })} placeholder="Ej: Bazar El Sol" />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Símbolo de Moneda</label>
            <div className="flex gap-2">
              {['$', '€', 'S/', 'Gs', 'U$D'].map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => setFormData({ ...formData, currency_symbol: symbol })}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                    formData.currency_symbol === symbol
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Teléfono" icon={<Phone size={16} />} value={formData.business_phone} onChange={(value) => setFormData({ ...formData, business_phone: value })} placeholder="Ej: +54 9 11..." />
          <Field label="Dirección" icon={<MapPin size={16} />} value={formData.business_address} onChange={(value) => setFormData({ ...formData, business_address: value })} placeholder="Ej: Av. Principal 123" />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] px-1">Presencia Digital</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Sitio Web" icon={<Globe size={16} />} value={formData.website_url} onChange={(value) => setFormData({ ...formData, website_url: value })} placeholder="Sitio Web" compact />
          <Field label="Instagram" icon={<Instagram size={16} />} value={formData.instagram_handle} onChange={(value) => setFormData({ ...formData, instagram_handle: value })} placeholder="@Instagram" compact />
          <Field label="WhatsApp" icon={<MessageCircle size={16} />} value={formData.whatsapp_phone} onChange={(value) => setFormData({ ...formData, whatsapp_phone: value })} placeholder="WhatsApp" compact />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50">
          <p className="text-xs text-red-600 font-bold tracking-tight">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-[2] py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  compact = false,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder: string
  compact?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 ${compact ? 'py-3.5 text-xs' : 'py-3.5 text-sm'} bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold dark:text-white transition-all border border-transparent focus:border-indigo-500/20`}
        />
      </div>
    </div>
  )
}
