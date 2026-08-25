export function splitFirstParagraph(content: any): { first: any; rest: any } {
  const children = content?.root?.children || []
  if (children.length === 0) {
    return { first: null, rest: content }
  }
  const [firstNode, ...restNodes] = children
  return {
    first: { root: { ...content.root, children: [firstNode] } },
    rest: { root: { ...content.root, children: restNodes } },
  }
}
