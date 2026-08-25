import React from 'react'
import Image from 'next/image'
import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import { CalloutBox } from './CalloutBox'

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const value = node.value as any
    if (!value?.url) return null
    return (
      <figure>
        <Image
          src={value.url}
          alt={value.alt || ''}
          width={value.width || 1200}
          height={value.height || 800}
          className="w-full h-auto"
        />
        {value.caption && (
          <figcaption className="text-body-sm italic text-ink-muted mt-3">
            {value.caption}
          </figcaption>
        )}
      </figure>
    )
  },
  blocks: {
    calloutBox: ({ node }: { node: any }) => (
      <CalloutBox style={node.fields.style as any} text={node.fields.text as string} />
    ),
  },
  table: ({ node, nodesToJSX }) => (
    <div className="overflow-x-auto my-8 -mx-1 [-webkit-overflow-scrolling:touch]">
      <table className="min-w-full w-max border-collapse text-sm sm:text-base">
        <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
      </table>
    </div>
  ),
  tablerow: ({ node, nodesToJSX }) => (
    <tr className="border-b border-ink/10 last:border-0">
      {nodesToJSX({ nodes: node.children })}
    </tr>
  ),
  tablecell: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const isHeader = (node as any).headerState > 0
    const Tag = isHeader ? 'th' : 'td'
    return (
      <Tag
        colSpan={(node as any).colSpan > 1 ? (node as any).colSpan : undefined}
        className={
          isHeader
            ? 'text-left font-heading font-bold text-ink uppercase tracking-wide text-xs sm:text-sm bg-ink/[0.03] px-3 sm:px-4 py-3 whitespace-nowrap'
            : 'px-3 sm:px-4 py-3 align-top whitespace-nowrap'
        }
      >
        {children}
      </Tag>
    )
  },
})

export function PostRichText({ content }: { content: any }) {
  if (!content) return null
  return <RichText data={content} converters={jsxConverters} className="prose-article" />
}
