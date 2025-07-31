# 💰 Payment Fee Calculator for Canadian Businesses

## 🧮 **Fee Calculation Formula**

**Standard Stripe Rate**: 2.9% + 30¢ CAD per transaction

```
Fee = (Amount × 0.029) + 0.30
```

## 📊 **Fee Examples**

### **Small Transactions ($10 - $50)**
| Amount | Fee | Net Amount | Fee % |
|--------|-----|------------|-------|
| $10.00 | $0.59 | $9.41 | 5.9% |
| $20.00 | $0.88 | $19.12 | 4.4% |
| $30.00 | $1.17 | $28.83 | 3.9% |
| $50.00 | $1.75 | $48.25 | 3.5% |

### **Medium Transactions ($50 - $200)**
| Amount | Fee | Net Amount | Fee % |
|--------|-----|------------|-------|
| $75.00 | $2.48 | $72.52 | 3.3% |
| $100.00 | $3.20 | $96.80 | 3.2% |
| $150.00 | $4.65 | $145.35 | 3.1% |
| $200.00 | $6.10 | $193.90 | 3.05% |

### **Large Transactions ($200+)**
| Amount | Fee | Net Amount | Fee % |
|--------|-----|------------|-------|
| $500.00 | $14.80 | $485.20 | 2.96% |
| $1,000.00 | $29.30 | $970.70 | 2.93% |
| $5,000.00 | $145.30 | $4,854.70 | 2.91% |

## 🎯 **Your Business Examples**



### **Cart Examples**
| Cart Total | Fee | Net Amount | Fee % |
|------------|-----|------------|-------|
| $39.50 | $1.45 | $38.05 | 3.7% |
| $100.00 | $3.20 | $96.80 | 3.2% |
| $250.00 | $7.55 | $242.45 | 3.0% |

## 💡 **Cost Optimization Tips**

### **1. Minimum Transaction Amount**
- **Set minimum** of $10-15 to avoid high fee percentages
- **Bundle services** to increase transaction value
- **Offer discounts** for larger orders

### **2. Payment Method Preferences**
- **Interac e-Transfer**: Lowest chargeback risk
- **Bank Transfer**: Best for large amounts
- **Credit Cards**: Most convenient for customers

### **3. Volume Discounts**
- **$80k+/month**: Negotiate lower rates
- **High volume**: Contact Stripe for custom pricing
- **Enterprise**: Dedicated account manager

## 🔧 **Fee Calculator JavaScript**

```javascript
function calculateStripeFee(amount) {
  const percentage = 0.029; // 2.9%
  const fixedFee = 0.30; // 30 cents
  const fee = (amount * percentage) + fixedFee;
  const netAmount = amount - fee;
  const feePercentage = (fee / amount) * 100;
  
  return {
    originalAmount: amount,
    fee: Math.round(fee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    feePercentage: Math.round(feePercentage * 100) / 100
  };
}

// Example usage
const result = calculateStripeFee(39.50);
console.log(`Amount: $${result.originalAmount}`);
console.log(`Fee: $${result.fee}`);
console.log(`Net: $${result.netAmount}`);
console.log(`Fee %: ${result.feePercentage}%`);
```

## 📈 **Break-Even Analysis**

### **Minimum Profitable Transaction**
- **Fixed costs**: $0.30 per transaction
- **Variable costs**: 2.9% of amount
- **Break-even**: Depends on your profit margin

### **Example: 20% Profit Margin**
- **Minimum transaction**: $15.00
- **Fee**: $0.74 (4.9%)
- **Profit**: $2.26 (15.1%)
- **Net profit**: $1.52 (10.1%)

## 🎯 **Recommendations**

### **For Small Transactions (< $20)**
- **Consider minimum order amounts**
- **Bundle services** to increase value
- **Offer bulk discounts**

### **For Medium Transactions ($20 - $100)**
- **Standard rates** are reasonable
- **Focus on customer convenience**
- **Offer multiple payment options**

### **For Large Transactions (> $100)**
- **Negotiate volume discounts**
- **Consider enterprise pricing**
- **Optimize for bank transfers**

## 📞 **Stripe Support for Pricing**

If you need custom pricing:
1. **Contact Stripe Sales**: [stripe.com/contact-sales](https://stripe.com/contact-sales)
2. **Provide your volume**: Monthly transaction volume
3. **Request Canadian rates**: Specific to your business type
4. **Negotiate terms**: Based on your needs

The key is finding the right balance between convenience for customers and cost-effectiveness for your business! 🇨🇦 