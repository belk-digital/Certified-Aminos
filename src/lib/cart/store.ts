import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { syncCartToPayload, getAutoAddAccessoryItems } from '@/app/(frontend)/actions/cart'

// Slugs excluded from the "peptide" auto-add-accessories trigger — these ARE the
// accessories, so adding one shouldn't add another copy of itself alongside it.
const ACCESSORY_PRODUCT_SLUGS = ['bac-water', '10-needles'] as const

function generateLineId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15)
}

export type MinimalProduct = {
  id: string
  name: string
  imageUrl: string | null
  slug?: string | null
}

export type CartLine = {
  lineId: string
  productId: string
  variantSku: string | null
  variantTitle?: string | null
  quantity: number
  priceSnapshot: number
  product: MinimalProduct
}

interface CartState {
  items: CartLine[]
  couponCode: string | null
  isOpen: boolean

  setItems: (items: CartLine[]) => void
  addItem: (
    product: MinimalProduct,
    variantSku: string | null,
    quantity: number,
    priceSnapshot: number,
    variantTitle?: string | null
  ) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clear: () => void
  setCoupon: (code: string | null) => void
  toggleDrawer: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const maybeAutoAddAccessories = async () => {
        const state = get()
        const hasBacWater = state.items.some((i) => i.product?.slug === 'bac-water')
        const hasNeedles = state.items.some((i) => i.product?.slug === '10-needles')
        if (hasBacWater && hasNeedles) return

        const { bacWater, needles } = await getAutoAddAccessoryItems()
        const addedNames: string[] = []

        set((current) => {
          const newItems = [...current.items]
          if (!hasBacWater && bacWater) {
            newItems.push({ ...bacWater, lineId: generateLineId(), quantity: 1 })
            addedNames.push('BAC Water')
          }
          if (!hasNeedles && needles) {
            newItems.push({ ...needles, lineId: generateLineId(), quantity: 1 })
            addedNames.push('Needles')
          }
          if (addedNames.length === 0) return current

          syncCartToPayload(newItems).catch(console.error)
          return { items: newItems }
        })

        if (addedNames.length > 0) {
          toast.success(`Added ${addedNames.join(' & ')} — required for reconstitution`)
        }
      }

      return {
      items: [],
      couponCode: null,
      isOpen: false,

      setItems: (items) => set({ items }),

      addItem: (product, variantSku, quantity, priceSnapshot, variantTitle) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => String(item.productId) === String(product.id) && item.variantSku === variantSku,
          )

          if (existingItemIndex > -1) {
            const newItems = [...state.items]
            newItems[existingItemIndex].quantity += quantity
            newItems[existingItemIndex].priceSnapshot = priceSnapshot
            if (variantTitle) newItems[existingItemIndex].variantTitle = variantTitle
            syncCartToPayload(newItems).catch(console.error)
            return { items: newItems, isOpen: true }
          }

          const newItems = [
            ...state.items,
            {
              lineId: generateLineId(),
              productId: product.id,
              variantSku,
              variantTitle: variantTitle || variantSku,
              quantity,
              priceSnapshot,
              product,
            },
          ]

          syncCartToPayload(newItems).catch(console.error)

          return {
            items: newItems,
            isOpen: true,
          }
        })

        // Every product except the accessories themselves is a research peptide that needs
        // reconstituting — silently add BAC water + needles alongside it (capped at one of
        // each total, regardless of how many peptides/quantity end up in the cart) rather
        // than requiring the shopper to remember to add them separately.
        if (!product.slug || !ACCESSORY_PRODUCT_SLUGS.includes(product.slug as any)) {
          maybeAutoAddAccessories()
        }
      },

      removeItem: (lineId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.lineId !== lineId)
          syncCartToPayload(newItems).catch(console.error)
          return { items: newItems }
        })
      },

      updateQuantity: (lineId, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: Math.max(1, quantity) } : item,
          )
          syncCartToPayload(newItems).catch(console.error)
          return { items: newItems }
        })
      },

      clear: () => {
        set({ items: [], couponCode: null })
        syncCartToPayload([]).catch(console.error)
      },

      setCoupon: (code) => set({ couponCode: code }),

      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      }
    },
    {
      name: 'Helix Bio-cart-storage',
    },
  ),
)

export const useCartSubtotal = () => {
  return useCartStore((state) =>
    state.items.reduce((total, item) => total + item.priceSnapshot * item.quantity, 0),
  )
}

export const useCartItemCount = () => {
  return useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0))
}
