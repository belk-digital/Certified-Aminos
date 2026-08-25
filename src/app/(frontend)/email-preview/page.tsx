'use client'

import React, { useState } from 'react'
import { Container } from '@/components/ui/container'

const TEMPLATES = [
  { id: 'welcome', label: 'Welcome Email' },
  { id: 'verify', label: 'Verify Email' },
  { id: 'order', label: 'Order Confirmation' },
  { id: 'forgot-password', label: 'Forgot Password' },
  { id: 'affiliate-welcome', label: 'Affiliate Welcome' },
  { id: 'affiliate-sale', label: 'Affiliate Sale' },
]

export default function EmailPreviewPage() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].id)
  const [key, setKey] = useState(0) // Used to force reload iframe

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-32">
      <Container size="page" className="px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl font-bold text-black uppercase tracking-widest">Email Template Previewer</h1>
          <p className="text-sm text-gray-500">Live preview of raw HTML email templates in development.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 overflow-y-auto">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`p-4 text-left rounded-[12px] transition-all font-bold text-sm tracking-wide uppercase ${
                  activeTemplate === t.id 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Iframe Preview */}
          <div className="flex-grow bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
            <div className="bg-gray-100 border-b border-gray-200 p-3 flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                /api/email-preview/{activeTemplate}
              </span>
              <button 
                onClick={() => setKey(prev => prev + 1)}
                className="text-xs font-bold uppercase tracking-widest text-black hover:text-primary transition-colors"
              >
                Refresh
              </button>
            </div>
            <iframe 
              key={key}
              src={`/api/email-preview/${activeTemplate}`} 
              className="w-full h-full bg-white"
              title="Email Preview"
            />
          </div>
        </div>
      </Container>
    </div>
  )
}
