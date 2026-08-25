export type DisplayOrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered'

export function getMappedStatus(payloadStatus: string): DisplayOrderStatus {
  switch (payloadStatus) {
    case 'shipped':
      return 'Shipped'
    case 'completed':
      return 'Delivered'
    case 'pending':
      return 'Placed'
    case 'refunded':
    case 'cancelled':
      return 'Placed' // Technically an edge case for the timeline
    case 'paid':
    case 'fulfilled':
    default:
      return 'Processing'
  }
}

// Same categories as above, but distinguishes cancelled/refunded as their own badge state
// (used for the order list, as opposed to the timeline-step view).
export type BadgeOrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

export function getBadgeStatus(payloadStatus: string): BadgeOrderStatus {
  switch (payloadStatus) {
    case 'shipped':
      return 'Shipped'
    case 'completed':
      return 'Delivered'
    case 'pending':
      return 'Placed'
    case 'refunded':
    case 'cancelled':
      return 'Cancelled'
    case 'paid':
    case 'fulfilled':
    default:
      return 'Processing'
  }
}
