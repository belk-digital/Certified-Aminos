import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AgeGate } from '@/components/shared/AgeGate'

// Mock lenis
vi.mock('lenis/react', () => ({
  useLenis: () => ({
    start: vi.fn(),
    stop: vi.fn(),
  }),
}))

describe('AgeGate Component — 21+ Verification Gating', () => {
  beforeEach(() => {
    cleanup()
    // Clear cookies
    document.cookie = 'ca_age_verified=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    document.cookie = 'ca_age_verified=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  })

  it('1. Appears on first visit when no cookie is set with exact copy verbatim', () => {
    render(<AgeGate />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()

    // Verbatim Eyebrow
    expect(screen.getByText('AGE VERIFICATION')).toBeTruthy()

    // Verbatim Heading
    expect(screen.getByRole('heading', { name: 'RESEARCH PURPOSES ONLY' })).toBeTruthy()

    // Verbatim Body
    expect(
      screen.getByText(
        'The products on this website are strictly for in-vitro laboratory research use only. By entering, you confirm you are 21 years of age or older and understand these compounds are not for human or veterinary use.'
      )
    ).toBeTruthy()

    // Verbatim Buttons
    expect(screen.getByRole('button', { name: 'I AM 21 OR OLDER — ENTER' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'I AM UNDER 21' })).toBeTruthy()

    // No close X button
    expect(screen.queryByLabelText(/close/i)).toBeNull()

    // Locks body background scroll
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overflow).toBe('hidden')
  })

  it('2. Dismissible ONLY via buttons — ESC key and click-outside do not bypass', () => {
    render(<AgeGate />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()

    // Attempt ESC bypass
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()

    // Attempt click outside dialog card (on the backdrop)
    fireEvent.click(dialog)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('3. Confirm sets ca_age_verified=21 remember cookie and closes modal without reload', () => {
    const triggerBtn = document.createElement('button')
    triggerBtn.textContent = 'Trigger Page Element'
    document.body.appendChild(triggerBtn)
    triggerBtn.focus()

    render(<AgeGate />)

    const confirmBtn = screen.getByRole('button', { name: 'I AM 21 OR OLDER — ENTER' })
    fireEvent.click(confirmBtn)

    // Modal closes
    expect(screen.queryByRole('dialog')).toBeNull()

    // Cookie is set with ca_age_verified=21
    expect(document.cookie).toContain('ca_age_verified=21')

    // Scroll is unlocked
    expect(document.body.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')

    // Focus restored
    expect(document.activeElement).toBe(triggerBtn)
    document.body.removeChild(triggerBtn)
  })

  it('4. If cookie ca_age_verified=21 is already present, modal NEVER renders', () => {
    document.cookie = 'ca_age_verified=21; path=/;'

    render(<AgeGate />)

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('RESEARCH PURPOSES ONLY')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('5. Decline swaps to denied state with exact copy and Go back button calling history.back', () => {
    const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)

    render(<AgeGate />)

    const declineBtn = screen.getByRole('button', { name: 'I AM UNDER 21' })
    fireEvent.click(declineBtn)

    // Modal is still in DOM (not redirected off-site)
    expect(screen.getByRole('dialog')).toBeTruthy()

    // Denied Heading
    expect(screen.getByRole('heading', { name: 'ACCESS RESTRICTED' })).toBeTruthy()

    // Denied Body
    expect(
      screen.getByText('You must be 21 years of age or older to enter this site.')
    ).toBeTruthy()

    // Single Go back button
    const goBackBtn = screen.getByRole('button', { name: 'Go back' })
    expect(goBackBtn).toBeTruthy()

    // Clicking Go back calls history.back()
    fireEvent.click(goBackBtn)
    expect(historyBackSpy).toHaveBeenCalledTimes(1)

    historyBackSpy.mockRestore()
  })

  it('6. Focus trap keeps keyboard focus cycled inside modal', () => {
    render(<AgeGate />)

    const confirmBtn = screen.getByRole('button', { name: 'I AM 21 OR OLDER — ENTER' })
    const declineBtn = screen.getByRole('button', { name: 'I AM UNDER 21' })

    // Simulate Tab from declineBtn (last element) -> should wrap to confirmBtn
    declineBtn.focus()
    expect(document.activeElement).toBe(declineBtn)

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(confirmBtn)

    // Simulate Shift+Tab from confirmBtn (first element) -> should wrap to declineBtn
    confirmBtn.focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(declineBtn)
  })

  it('7. i18n bundle: old 18+ copy is fully superseded and replaced with verbatim 21+ copy', async () => {
    const fs = await import('fs')
    const enJson = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))

    expect(enJson.ageGate).toBeDefined()
    expect(enJson.ageGate.eyebrow).toBe('AGE VERIFICATION')
    expect(enJson.ageGate.heading).toBe('RESEARCH PURPOSES ONLY')
    expect(enJson.ageGate.body).toBe(
      'The products on this website are strictly for in-vitro laboratory research use only. By entering, you confirm you are 21 years of age or older and understand these compounds are not for human or veterinary use.'
    )
    expect(enJson.ageGate.confirmButton).toBe('I AM 21 OR OLDER — ENTER')
    expect(enJson.ageGate.declineButton).toBe('I AM UNDER 21')
    expect(enJson.ageGate.deniedHeading).toBe('ACCESS RESTRICTED')
    expect(enJson.ageGate.deniedBody).toBe('You must be 21 years of age or older to enter this site.')
    expect(enJson.ageGate.goBack).toBe('Go back')

    // Ensure none of the old 18+ keys remain
    expect(enJson.ageGate['confirmButton']).not.toContain('18+')
    expect(enJson.ageGate['deniedText']).toBeUndefined()
    expect(enJson.ageGate['denyButton']).toBeUndefined()
  })

  it('8. Mobile 360px & Layering: meets z-index, 90vw width, >=48px tap targets, and vertical stack', async () => {
    const fs = await import('fs')
    const ageGateCode = fs.readFileSync('src/components/shared/AgeGate.tsx', 'utf8')

    // Layer above announcement bar
    expect(ageGateCode).toContain('z-[999999]')

    // Mobile 360px card sizing
    expect(ageGateCode).toContain('max-w-[90vw]')

    // Tap targets at least 48px
    expect(ageGateCode).toContain('min-h-[48px]')

    // Stacked vertically
    expect(ageGateCode).toContain('flex flex-col gap-3')

    // Transparent backdrop overlay styling
    expect(ageGateCode).toContain('backdrop-blur')
  })

  it('9. SEO safety: layout never conditionally wraps or hides <main>, no noindex, no bot sniffing', async () => {
    const fs = await import('fs')
    const layoutCode = fs.readFileSync('src/app/(frontend)/layout.tsx', 'utf8')

    // AgeGate is an overlay sibling, not wrapping children/main
    expect(layoutCode).toContain('<AgeGate />')
    expect(layoutCode).toContain('{children}')
    expect(layoutCode).not.toContain('display: none')
    expect(layoutCode).not.toContain('display:none')

    // No noindex added because of gate
    expect(layoutCode).not.toContain('noindex')
    expect(layoutCode).not.toContain('nofollow')

    // No bot sniffing in AgeGate
    const ageGateCode = fs.readFileSync('src/components/shared/AgeGate.tsx', 'utf8')
    expect(ageGateCode).not.toContain('navigator.userAgent')
    expect(ageGateCode).not.toContain('googlebot')
  })
})

