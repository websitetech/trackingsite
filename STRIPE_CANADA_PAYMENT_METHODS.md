# Stripe Payment Methods in Canada - Complete Guide

## Overview

This document provides a comprehensive overview of all payment methods supported by Stripe for Canadian businesses, including pricing, fees, and implementation considerations.

## Supported Payment Methods in Canada

### 1. Credit and Debit Cards

**Supported Networks:**
- Visa
- Mastercard
- American Express
- Discover
- JCB
- UnionPay

**Pricing:**
- **Domestic (Canadian) cards:** 2.9% + 30¢ CAD
- **International cards:** 3.9% + 30¢ CAD
- **American Express:** 3.5% + 30¢ CAD (additional 0.3% fee)

**Processing Time:** 2-3 business days

### 2. Interac e-Transfer

**Availability:** Canada only
**Pricing:** 1.5% + 30¢ CAD
**Processing Time:** 1-2 business days
**Limits:** Up to $10,000 CAD per transaction

**Requirements:**
- Canadian bank account
- Interac e-Transfer enabled
- Customer must have online banking

### 3. Bank-to-Bank Transfers (ACH Debit)

**Availability:** Canada and US
**Pricing:** 0.8% + 30¢ CAD (capped at $5.00 CAD)
**Processing Time:** 3-5 business days
**Limits:** Up to $25,000 CAD per transaction

**Features:**
- Direct bank account debiting
- Lower fees than credit cards
- No chargeback risk
- Ideal for recurring payments
- Supports both one-time and recurring transfers

**Requirements:**
- Customer must provide bank account details
- Requires customer authorization
- Available for verified Stripe accounts

### 4. Apple Pay

**Availability:** iOS devices, Safari on macOS
**Pricing:** Same as underlying payment method (card fees apply)
**Processing Time:** Same as underlying payment method
**Security:** Tokenized payments, enhanced security

### 5. Google Pay

**Availability:** Android devices, Chrome browser
**Pricing:** Same as underlying payment method (card fees apply)
**Processing Time:** Same as underlying payment method
**Security:** Tokenized payments, enhanced security

### 6. Microsoft Pay

**Availability:** Windows devices, Edge browser
**Pricing:** Same as underlying payment method (card fees apply)
**Processing Time:** Same as underlying payment method

### 7. WeChat Pay

**Availability:** Limited availability in Canada
**Pricing:** 3.5% + 30¢ CAD
**Processing Time:** 2-3 business days
**Requirements:** WeChat account with payment enabled

### 8. Alipay

**Availability:** Limited availability in Canada
**Pricing:** 3.5% + 30¢ CAD
**Processing Time:** 2-3 business days
**Requirements:** Alipay account with international payments enabled

## Pricing Structure

### Standard Pricing (Most Common)

| Payment Method | Domestic Fee | International Fee | Processing Time |
|----------------|--------------|-------------------|-----------------|
| Credit/Debit Cards | 2.9% + 30¢ | 3.9% + 30¢ | 2-3 days |
| Interac e-Transfer | 1.5% + 30¢ | N/A | 1-2 days |
| Bank-to-Bank Transfers | 0.8% + 30¢ (capped at $5.00) | N/A | 3-5 days |
| Apple Pay | 2.9% + 30¢ | 3.9% + 30¢ | 2-3 days |
| Google Pay | 2.9% + 30¢ | 3.9% + 30¢ | 2-3 days |
| American Express | 3.5% + 30¢ | 3.5% + 30¢ | 2-3 days |

### Volume Discounts

**Stripe offers volume-based pricing for high-volume merchants:**

- **$80K+ monthly volume:** 2.6% + 30¢ CAD (domestic)
- **$250K+ monthly volume:** 2.4% + 30¢ CAD (domestic)
- **$1M+ monthly volume:** 2.2% + 30¢ CAD (domestic)

### Additional Fees

- **Failed payment retry:** $0.50 CAD per attempt
- **Dispute fee:** $15.00 CAD
- **Refund fee:** $0.50 CAD (refunded if original charge is disputed)
- **International currency conversion:** 1% fee

## Implementation Considerations

### 1. Payment Element Setup

```javascript
// Example Payment Element configuration for Canada
const options = {
  mode: 'payment',
  amount: 2000, // Amount in cents
  currency: 'cad',
  payment_method_types: [
    'card',
    'interac_present',
    'us_bank_account', // For bank-to-bank transfers
    'apple_pay',
    'google_pay'
  ],
  payment_method_options: {
    card: {
      request_three_d_secure: 'automatic'
    },
    us_bank_account: {
      financial_connections: {
        permissions: ['payment_method', 'balances']
      }
    }
  }
};
```

### 2. Required Fields for Canadian Payments

- **Business Information:**
  - Canadian Business Number (BN)
  - GST/HST registration (if applicable)
  - Business address in Canada

- **Banking Information:**
  - Canadian bank account
  - Transit number
  - Institution number
  - Account number

### 3. Tax Considerations

- **GST/HST:** Must be collected on applicable transactions
- **PST:** Provincial sales tax requirements vary by province
- **Tax Reporting:** Quarterly or annual reporting required

## Regional Variations

### Province-Specific Requirements

| Province | PST Rate | Tax Registration Required |
|----------|----------|---------------------------|
| Alberta | 0% | No |
| British Columbia | 7% | Yes |
| Manitoba | 7% | Yes |
| New Brunswick | 15% (HST) | Yes |
| Newfoundland | 15% (HST) | Yes |
| Nova Scotia | 15% (HST) | Yes |
| Ontario | 13% (HST) | Yes |
| PEI | 15% (HST) | Yes |
| Quebec | 9.975% | Yes |
| Saskatchewan | 6% | Yes |
| Northwest Territories | 0% | No |
| Nunavut | 0% | No |
| Yukon | 0% | No |

## Security and Compliance

### 1. PCI Compliance

- Stripe handles PCI compliance for card data
- No card data stored on your servers
- Tokenized payments for enhanced security

### 2. 3D Secure

- Automatic 3D Secure authentication for international cards
- Reduces fraud and chargeback risk
- Required for some European transactions

### 3. Fraud Prevention

- Stripe Radar for fraud detection
- Machine learning-based risk assessment
- Customizable fraud rules

## Testing

### Test Cards for Canadian Payments

```javascript
// Canadian test cards
const testCards = {
  visa: '4000 0000 0000 0002',
  mastercard: '5555 5555 5555 4444',
  amex: '3782 822463 10005',
  interac: '4000 0000 0000 0002' // Simulated
};
```

### Test Scenarios

1. **Successful payment:** Use test cards with sufficient funds
2. **Declined payment:** Use test cards with insufficient funds
3. **3D Secure:** Use cards requiring authentication
4. **Interac e-Transfer:** Test with Canadian bank accounts

## Best Practices

### 1. User Experience

- Display accepted payment methods clearly
- Show pricing in CAD with tax included
- Provide clear error messages for declined payments
- Offer multiple payment options

### 2. Error Handling

```javascript
// Example error handling
stripe.confirmPayment({
  // ... payment configuration
}).then((result) => {
  if (result.error) {
    // Handle specific error types
    switch (result.error.type) {
      case 'card_error':
        // Handle card-specific errors
        break;
      case 'validation_error':
        // Handle validation errors
        break;
      default:
        // Handle other errors
    }
  }
});
```

### 3. Mobile Optimization

- Ensure payment forms work on mobile devices
- Test Apple Pay and Google Pay on actual devices
- Optimize for touch interactions

## Support and Resources

### Stripe Documentation

- [Stripe Canada Documentation](https://stripe.com/docs/canada)
- [Payment Methods Guide](https://stripe.com/docs/payments/payment-methods)
- [Tax Calculation Guide](https://stripe.com/docs/tax)

### Canadian Regulatory Resources

- [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency.html)
- [Financial Consumer Agency of Canada](https://www.canada.ca/en/financial-consumer-agency.html)
- [Bank of Canada](https://www.bankofcanada.ca/)

### Contact Information

- **Stripe Support:** Available 24/7 via chat and email
- **Canadian Business Support:** Dedicated support for Canadian businesses
- **Developer Support:** Technical support for integration issues

## Updates and Changes

This document should be updated regularly to reflect:
- New payment methods
- Pricing changes
- Regulatory updates
- Feature additions

**Last Updated:** December 2024
**Next Review:** March 2025

---

*Note: All pricing information is current as of the last update. Please verify current rates with Stripe before implementation, as pricing may change.* 