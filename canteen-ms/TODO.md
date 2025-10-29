# TODO: Fix Forbidden Error in Payment Flow

## Steps:

1. [x] Edit server/src/routes/orders.js to fix user ownership checks in GET /:id and POST /:id/notify-payment routes by using .toString() on both sides of the comparison.

2. [ ] Test the payment flow: Place an order with UPI from Cart, navigate to PaymentPage, verify no forbidden error, and confirm payment notification works.
