# 🧪 Test Canadian Payment Methods

## 🚀 **Quick Test**

### **1. Test the API**
```bash
curl -X POST http://localhost:5000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "cad"
  }'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_..._secret_..."
}
```

### **2. Check Server Logs**
Look for these log messages:
```
Creating payment intent with: { amount: 100, currency: 'cad' }
Payment intent created: {
  id: 'pi_...',
  amount: 10000,
  currency: 'cad',
  payment_method_types: ['card', 'link', 'us_bank_account']
}
```

### **3. Test Frontend**
1. Open your payment form
2. You should now see multiple tabs:
   - **💰 Link** (Interac e-Transfer) - should be first
   - **💳 Card** (Credit/Debit Cards)
   - **🏦 Bank** (Canadian Bank Transfer)

## ✅ **Success Indicators**

- [ ] Payment intent created successfully
- [ ] Server logs show all payment method types
- [ ] Payment Element shows multiple tabs
- [ ] Interac e-Transfer tab is visible and first
- [ ] No console errors

## 🔧 **If Still Only Cards Show**

### **Check Stripe Dashboard:**
1. Go to **Settings** → **Payment methods**
2. Verify **Link** is **Active**
3. Verify **Bank transfers** is **Active**

### **Check Account Settings:**
1. Go to **Settings** → **Business settings**
2. Verify **Country** is set to **Canada**
3. Go to **Settings** → **Billing** → **Currencies**
4. Verify **CAD** is enabled

### **Contact Stripe Support:**
If still not working, contact Stripe with:
- Your account ID
- Business location (Canada)
- Request to enable Link payments for Canadian customers

## 🎯 **Expected Result**

After the changes, your Payment Element should look like this:

```
┌─────────────────────────────────────┐
│ [💰 Link] [💳 Card] [🏦 Bank]     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Interac e-Transfer Form         │ │
│ │ (Email input, bank selection)   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

The key changes made:
1. **Explicit payment method types** in backend
2. **Forced Canadian location** in frontend
3. **Payment method order** with Link first
4. **Canadian postal code** to force location detection

This should force the Payment Element to show Interac e-Transfer and other Canadian payment methods! 🇨🇦 