'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { COUNTRIES } from '@/lib/countries'

export interface AddressItem {
  id: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface AccountAddressesProps {
  addresses: AddressItem[];
}

export function AddressesClient({ addresses }: AccountAddressesProps) {
  const t = useTranslations('account.addresses')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  
  const editingAddress = editingId ? addresses.find(a => a.id === editingId) : null

  async function handleAddSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editingId) {
          const { updateAddress } = await import('./actions')
          const result = await updateAddress(editingId, formData)
          if (!result?.success) {
            toast.error(result?.error || t('toastUpdateFailed'))
            return
          }
          toast.success(t('toastUpdateSuccess'))
        } else {
          const { addAddress } = await import('./actions')
          const result = await addAddress(formData)
          if (!result?.success) {
            toast.error(result?.error || t('toastSaveFailed'))
            return
          }
          toast.success(t('toastSaveSuccess'))
        }
        setOpen(false)
        setEditingId(null)
      } catch (error: any) {
        toast.error(error.message || t('toastUnexpectedError'))
      }
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const { deleteAddress } = await import('./actions')
      await deleteAddress(id)
      toast.success(t('toastDeleteSuccess'))
    })
  }

  function handleEdit(id: string) {
    setEditingId(id)
    setOpen(true)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setEditingId(null)
      }, 300)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col w-full font-sans"
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1 max-w-lg text-sm">{t('subtitle')}</p>
        </div>

        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <button
              onClick={() => setEditingId(null)}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-navy-deep hover:bg-navy text-white rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all font-heading"
            >
              <Plus size={16} />
              {t('addNewAddress')}
            </button>
          </SheetTrigger>

          {/* Sleek Slide-out Drawer */}
          <SheetContent side="right" className="sm:max-w-[500px] w-full p-0 bg-white border-l border-gray-100 flex flex-col shadow-2xl">
            <form action={handleAddSubmit} key={editingId || 'new'} className="flex flex-col h-full">
              
              <div className="px-8 py-10 pb-6 border-b border-gray-100 pr-16">
                <SheetHeader className="p-0 text-left">
                  <SheetTitle className="text-4xl font-light tracking-tight text-black">
                    {editingId ? t('editAddressTitle') : t('addAddressTitle')}
                  </SheetTitle>
                  <SheetDescription className="text-sm text-gray-500 mt-2 font-light">
                    {editingId ? t('editAddressDescription') : t('addAddressDescription')}
                  </SheetDescription>
                </SheetHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 pr-12 custom-scrollbar" data-lenis-prevent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                  
                  {/* Clean Inputs */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('firstName')}</Label>
                    <Input name="firstName" id="firstName" defaultValue={editingAddress?.firstName || ''} required placeholder={t('firstName')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('lastName')}</Label>
                    <Input name="lastName" id="lastName" defaultValue={editingAddress?.lastName || ''} required placeholder={t('lastName')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="line1" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('streetAddress')}</Label>
                    <Input name="line1" id="line1" defaultValue={editingAddress?.line1 || ''} required placeholder={t('streetAddress')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="line2" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('apartmentOptional')}</Label>
                    <Input name="line2" id="line2" defaultValue={editingAddress?.line2 || ''} placeholder={t('apartmentPlaceholder')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="city" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('city')}</Label>
                    <Input name="city" id="city" defaultValue={editingAddress?.city || ''} required placeholder={t('city')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="state" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('state')}</Label>
                    <Input name="state" id="state" defaultValue={editingAddress?.state || ''} required placeholder={t('state')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="zip" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('zipCode')}</Label>
                    <Input name="zip" id="zip" defaultValue={editingAddress?.postalCode || ''} required placeholder={t('zipCode')} className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('phone')}</Label>
                    <Input name="phone" id="phone" defaultValue={editingAddress?.phone || ''} required type="tel" placeholder="(555) 555-5555" className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-navy-deep font-light text-base" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="country" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('country')}</Label>
                    <Select name="country" defaultValue={editingAddress?.country || 'US'} required>
                      <SelectTrigger id="country" className="h-12 bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 focus-visible:ring-0 font-light text-base w-full">
                        <SelectValue placeholder={t('country')} />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        className="max-h-72 rounded-2xl border-gray-100 bg-white p-2 shadow-xl shadow-black/[0.06]"
                      >
                        {COUNTRIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="rounded-xl py-3 px-3 text-sm cursor-pointer font-light data-[highlighted]:bg-gray-50 data-[state=checked]:bg-gray-50"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
                    <Checkbox name="isDefault" id="default" defaultChecked={editingAddress?.isDefault || false} className="border-gray-300 data-[state=checked]:bg-navy-deep data-[state=checked]:border-navy-deep" />
                    <label
                      htmlFor="default"
                      className="text-sm font-light text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('setAsDefault')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-white flex justify-start gap-3 shrink-0 pb-12 pr-24">
                <button disabled={isPending} type="submit" className="px-8 py-3 rounded-full bg-navy-deep text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-navy transition-all disabled:opacity-50 font-heading">
                  {isPending ? t('saving') : t('saveAddress')}
                </button>
                <SheetClose asChild>
                  <button type="button" className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-ink hover:bg-gray-50 transition-colors font-heading">
                    {t('cancel')}
                  </button>
                </SheetClose>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Address Ledger */}
      <div className="flex flex-col bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {addresses.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 text-center">
            <MapPin size={48} className="text-gray-200 mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-2">No Addresses Found</h2>
            <p className="text-gray-500 font-light max-w-sm mb-8">You haven't saved any addresses yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {addresses.map((address, i) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col md:flex-row md:items-start justify-between py-8 transition-colors hover:bg-gray-50/50 -mx-4 px-4 rounded-2xl relative"
              >
                <div className="flex gap-6 md:gap-12 flex-1">
                  
                  {/* Icon & Default Badge */}
                  <div className="flex flex-col items-center gap-4 shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <MapPin size={18} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col flex-1 max-w-xl text-base text-gray-500 font-light leading-loose">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl text-black font-light tracking-tight">{address.firstName} {address.lastName}</span>
                      {address.isDefault && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-navy-deep/5 text-navy-deep px-3 py-1 rounded-full font-heading">
                          {t('default')}
                        </span>
                      )}
                    </div>
                    <span>{address.line1}</span>
                    {address.line2 && <span>{address.line2}</span>}
                    <span>{address.city}, {address.state} {address.postalCode}</span>
                    <span>{address.country}</span>
                    <span className="mt-4 text-sm text-gray-400">{address.phone}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6 md:mt-0 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button disabled={isPending} onClick={() => handleEdit(address.id)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 hover:text-black transition-colors font-heading disabled:opacity-50">
                    <Edit2 size={12} />
                    {t('edit')}
                  </button>
                  <span className="text-gray-200">|</span>
                  <button disabled={isPending} onClick={() => handleDelete(address.id)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 hover:text-red-600 transition-colors font-heading disabled:opacity-50">
                    <Trash2 size={12} />
                    {t('delete')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
