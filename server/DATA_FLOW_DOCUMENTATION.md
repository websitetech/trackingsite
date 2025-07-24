# Data Flow Documentation: Shipment → Package → Tracking

## Overview
When a shipment is created, the system automatically creates corresponding package records and initial tracking history. This ensures complete data integrity and tracking capabilities.

## Complete Data Flow

### 1. Shipment Creation Process

#### **Single Shipment Creation** (`POST /api/ship`)
```javascript
// 1. Create shipment record
const newShipment = await dbHelpers.createShipment(shipmentData);

// 2. Generate tracking number
const tracking_number = dbHelpers.generateTrackingNumber();

// 3. Create package record linked to shipment
const packageData = {
  user_id,
  shipment_id: newShipment.id,  // Link to shipment
  tracking_number,
  origin_zip: origin_postal,
  destination_zip: destination_postal,
  weight,
  status: 'pending',
  recipient_name,
  recipient_address,
  contact_number
};
const newPackage = await dbHelpers.createPackage(packageData);

// 4. Add initial tracking history
const initialTrackingData = {
  status: 'Shipment Created',
  location: 'Origin',
  description: `Shipment ${shipment_number} created and package ${tracking_number} assigned`
};
await dbHelpers.addTrackingHistory(newPackage.id, initialTrackingData);
```

#### **Bulk Shipment Creation** (`POST /api/ship/bulk`)
- Same process as single shipment, but repeated for each shipment in the cart
- Each shipment gets its own package and tracking history

### 2. Database Tables Population

#### **A. Shipments Table**
```sql
INSERT INTO shipments (
  user_id, shipment_number, customer, service_type, 
  service_type_label, recipient_name, recipient_address, 
  contact_number, price, origin_postal, destination_postal, 
  weight, status, payment_status
) VALUES (...);
```

#### **B. Packages Table**
```sql
INSERT INTO packages (
  user_id, shipment_id, tracking_number, origin_zip, 
  destination_zip, weight, status, recipient_name, 
  recipient_address, contact_number
) VALUES (...);
```

#### **C. Package Tracking History Table**
```sql
INSERT INTO package_tracking_history (
  package_id, status, location, description, timestamp
) VALUES (...);
```

### 3. Table Relationships

```
users (1) → (many) shipments
shipments (1) → (1) packages
packages (1) → (many) package_tracking_history
```

### 4. Tracking Number Generation

#### **Shipment Numbers**: `SHP` + timestamp + random string
- Example: `SHP12345678ABC1`

#### **Tracking Numbers**: `TRK` + timestamp + random string  
- Example: `TRK12345678XYZ9`

### 5. Initial Tracking Status

When a shipment is created, the system automatically sets:

- **Shipment Status**: `'pending'`
- **Package Status**: `'pending'`
- **Payment Status**: `'pending'`
- **Initial Tracking Entry**: `'Shipment Created'` at `'Origin'`

### 6. Tracking Data Retrieval

#### **Package Tracking** (`POST /api/track`)
```javascript
// 1. Find package by tracking number
const packageData = await dbHelpers.getPackageByTrackingNumber(tracking_number);

// 2. Get all tracking history for the package
const trackingHistory = await dbHelpers.getPackageTrackingHistory(packageData.id);

// 3. Format response
const trackingData = {
  tracking_number: packageData.tracking_number,
  status: packageData.status,
  location: trackingHistory[0]?.location || 'Origin',
  estimated_delivery: calculateDeliveryDate(),
  history: trackingHistory.map(entry => ({
    date: entry.timestamp,
    status: entry.status,
    location: entry.location,
    description: entry.description
  }))
};
```

## API Response Examples

### Shipment Creation Response
```json
{
  "message": "Shipment and package created successfully",
  "shipment_number": "SHP12345678ABC1",
  "shipment_id": 123,
  "tracking_number": "TRK12345678XYZ9",
  "package_id": 456
}
```

### Tracking Response
```json
{
  "tracking_number": "TRK12345678XYZ9",
  "status": "pending",
  "location": "Origin",
  "estimated_delivery": "2024-01-27T10:00:00.000Z",
  "history": [
    {
      "date": "2024-01-24T10:00:00.000Z",
      "status": "Shipment Created",
      "location": "Origin",
      "description": "Shipment SHP12345678ABC1 created and package TRK12345678XYZ9 assigned"
    }
  ]
}
```

## Adding Tracking Updates

### Manual Tracking Update
```javascript
// Add new tracking entry
await dbHelpers.addTrackingHistory(packageId, {
  status: 'In Transit',
  location: 'Distribution Center',
  description: 'Package picked up and in transit'
});
```

### Automatic Status Updates
The system can be extended to automatically update package status based on tracking events:

- `'pending'` → `'in_transit'` → `'out_for_delivery'` → `'delivered'`

## Database Schema Relationships

### Foreign Key Constraints
```sql
-- Packages reference shipments
ALTER TABLE packages ADD CONSTRAINT fk_packages_shipment 
FOREIGN KEY (shipment_id) REFERENCES shipments(id);

-- Tracking history references packages
ALTER TABLE package_tracking_history ADD CONSTRAINT fk_tracking_package 
FOREIGN KEY (package_id) REFERENCES packages(id);

-- All tables reference users
ALTER TABLE shipments ADD CONSTRAINT fk_shipments_user 
FOREIGN KEY (user_id) REFERENCES users(id);
```

## Benefits of This Approach

### ✅ **Data Integrity**
- Every shipment has exactly one package
- Every package has complete tracking history
- No orphaned records

### ✅ **Complete Tracking**
- Full audit trail from creation to delivery
- Real-time status updates
- Historical tracking data

### ✅ **Scalability**
- Supports bulk operations
- Efficient database queries
- Proper indexing on tracking numbers

### ✅ **User Experience**
- Immediate tracking number generation
- Real tracking data (not mock)
- Complete shipment lifecycle management

## Testing the Flow

### 1. **Create Shipment**
```bash
curl -X POST http://localhost:5000/api/ship \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "APS",
    "service_type": "exclusive",
    "service_type_label": "Exclusive Service",
    "recipient_name": "John Doe",
    "recipient_address": "123 Main St",
    "contact_number": "555-1234",
    "price": 43.50
  }'
```

### 2. **Track Package**
```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "TRK12345678XYZ9",
    "zip_code": "12345"
  }'
```

### 3. **Add Tracking Update**
```bash
curl -X POST http://localhost:5000/api/packages/456/tracking \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Transit",
    "location": "Distribution Center",
    "description": "Package picked up and in transit"
  }'
```

This complete flow ensures that every shipment creates the necessary package and tracking records automatically! 🚀 