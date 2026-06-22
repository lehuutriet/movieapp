/**
 * Combines ticket booking amounts with the F&B cart subtotal.
 * Used by CheckoutPage to display a single grand total at payment time.
 */

export interface OrderSummaryTotals {
  ticketSubtotal: number;
  ticketDiscount: number;
  /** Ticket amount after discount (`booking.totalAmount`). */
  ticketTotal: number;
  concessionSubtotal: number;
  grandTotal: number;
}

export function computeOrderTotals(
  booking: { subtotal: number; discount: number; totalAmount: number },
  concessionSubtotal: number,
): OrderSummaryTotals {
  return {
    ticketSubtotal: booking.subtotal,
    ticketDiscount: booking.discount,
    ticketTotal: booking.totalAmount,
    concessionSubtotal,
    grandTotal: booking.totalAmount + concessionSubtotal,
  };
}
