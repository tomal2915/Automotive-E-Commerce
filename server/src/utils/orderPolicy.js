// An order can only be cancelled by the customer while it hasn't shipped
// yet, and only within a reasonable window after payment — prevents
// cancelling something that's already on its way or long settled
const CANCELLABLE_STATUSES = ["pending", "paid"];
const CANCEL_WINDOW_HOURS = 24;

export const canCancelOrder = (order) => {
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return {
      allowed: false,
      reason:
        "This order can no longer be cancelled — it has already shipped or been processed further.",
    };
  }

  const hoursSinceOrder =
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceOrder > CANCEL_WINDOW_HOURS) {
    return {
      allowed: false,
      reason: `Orders can only be cancelled within ${CANCEL_WINDOW_HOURS} hours of placing them.`,
    };
  }

  return { allowed: true };
};

// Returns can only be requested for delivered orders, within a return window
const RETURN_WINDOW_DAYS = 7;

export const canRequestReturn = (order) => {
  if (order.status !== "delivered") {
    return {
      allowed: false,
      reason: "Only delivered orders are eligible for return.",
    };
  }

  if (order.returnRequest?.status) {
    return {
      allowed: false,
      reason: "A return has already been requested for this order.",
    };
  }

  const daysSinceOrder =
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > RETURN_WINDOW_DAYS) {
    return {
      allowed: false,
      reason: `Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery.`,
    };
  }

  return { allowed: true };
};
