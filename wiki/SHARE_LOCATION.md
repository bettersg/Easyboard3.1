# Location Sharing Logic Documentation

## Overview

The location sharing feature in EasyBoard allows PWID (Persons with Intellectual Disabilities) to share their real-time location with caregivers. The system supports both manual sharing (without destination) and route-based sharing (with destination and auto-stop functionality).

## Key Components

### LocationSharingProvider
- **File:** `src/contexts/LocationSharingContext.tsx`
- **Purpose:** Manages the entire location sharing state and logic
- **Context Values:**
  - `isLocationSharing`: Boolean indicating if location sharing is active
  - `setIsLocationSharing`: Function to start/stop location sharing
  - `destination`: Current destination coordinates (null if no destination)
  - `setDestination`: Function to set/clear destination

## User Flow Scenarios

### Scenario 1: Manual Location Sharing (No Destination)

1. **PWID starts sharing:**
   ```typescript
   setIsLocationSharing(true);
   ```
   - Location sharing starts
   - **Notification sent to caregiver** (one-time)
   - Real-time location updates begin
   - **No auto-stop** - sharing continues until manually stopped

2. **PWID stops sharing:**
   ```typescript
   setIsLocationSharing(false);
   ```
   - Location sharing stops
   - **Notification sent to caregiver** (location sharing stopped)
   - Location watcher is cleaned up
   - PWID location is cleared from database

### Scenario 2: Route-Based Location Sharing (With Destination)

1. **PWID starts sharing without destination:**
   ```typescript
   setIsLocationSharing(true);
   // destination remains null
   ```
   - Same as Scenario 1

2. **PWID chooses a route and sets destination:**
   ```typescript
   setDestination({ lat: latitude, lng: longitude });
   ```
   - **No additional notification sent** (sharing already active)
   - Auto-stop logic becomes active
   - When PWID reaches within 20 meters of destination, sharing automatically stops
   - **Notification sent to caregiver** (arrived at destination)

### Scenario 3: Direct Route-Based Sharing

1. **PWID chooses route first, then starts sharing:**
   ```typescript
   setDestination({ lat: latitude, lng: longitude });
   setIsLocationSharing(true);
   ```
   - Location sharing starts with destination
   - **Notification sent to caregiver** (one-time)
   - Auto-stop logic active from the start

## Technical Implementation

### Notification Logic
- **Start notifications:** Sent when location sharing transitions from `false` to `true`
- **Stop notifications:** Sent when location sharing stops (manual stop or arrival at destination)
- **Stop reasons:** 
  - "Location sharing stopped manually" - when PWID manually stops sharing
  - "Arrived at destination" - when PWID reaches destination and auto-stops
- **When NOT sent:** When destination is set/changed while sharing is already active
- **Implementation:** Uses arrival detection ref to distinguish between manual stops and arrivals

### Auto-Stop Logic
- **Condition:** Only active when `destination` is not null
- **Threshold:** 20 meters from destination
- **Behavior:** Automatically stops sharing, clears destination, and sends notification when PWID arrives

### Location Updates
- **Frequency:** Every 3 seconds or when moving 1 meter
- **Accuracy:** High accuracy GPS
- **Storage:** Updates PWID location in Firebase database

## Usage from Outside LocationSharingProvider

### Starting Location Sharing
```typescript
const { setIsLocationSharing } = useLocationSharing();

// Start sharing (from Main page "SHARE LOCATION" button)
setIsLocationSharing(true);
```

### Stopping Location Sharing
```typescript
const { setIsLocationSharing } = useLocationSharing();

// Stop sharing manually (from "STOP SHARING" button)
setIsLocationSharing(false);
```

### Setting Destination
```typescript
const { setDestination } = useLocationSharing();

// Set destination when choosing a route
setDestination({ lat: latitude, lng: longitude });

// Clear destination (if needed)
setDestination(null);
```

## Integration Points

### Main Page (`src/pages/Main.tsx`)
- **Share Location Button:** Calls `setIsLocationSharing(true)`
- **Stop Sharing Button:** Calls `setIsLocationSharing(false)`
- **Location Selection:** Sets destination and navigates to TransitOptions

### GoogleMapsDirections (`src/pages/GoogleMapsDirections/index.tsx`)
- **Start Trip Button:** Calls both `setIsLocationSharing(true)` and `setDestination(...)`
- **Stop Sharing Button:** Calls `setIsLocationSharing(false)`

### TransitOptions (`src/pages/TransitOptions.tsx`)
- **Route Selection:** Sets destination and navigates to GoogleMapsDirections

## State Management

### Internal State Variables
- `isLocationSharing`: Boolean - whether sharing is active
- `destination`: Object | null - destination coordinates
- `pwidPhoneNumber`: String | null - PWID's phone number
- `hasArrivedRef`: Ref - tracks if PWID has arrived at destination
- `hasStartedSharingRef`: Ref - tracks if sharing has started in current session

### Effect Dependencies
```typescript
useEffect(() => {
  // Location sharing logic
}, [isLocationSharing, pwidPhoneNumber]);
```

## Error Handling

### Permission Denied
- Shows alert if location permission is not granted
- Automatically sets `isLocationSharing` to false

### Missing Phone Number
- Shows alert if PWID phone number is not available
- Automatically sets `isLocationSharing` to false

### Location Update Failures
- Logs errors but continues sharing
- Does not stop the sharing session

## Best Practices

1. **Always check if sharing is active** before setting destination
2. **Use the context values** instead of managing location state elsewhere
3. **Handle cleanup** when components unmount (automatic in provider)
4. **Test both scenarios** - manual sharing and route-based sharing

## Testing Checklist

- [ ] Manual location sharing starts correctly
- [ ] Caregiver receives notification when sharing starts
- [ ] Location updates are sent to database
- [ ] Manual stop works correctly
- [ ] **Caregiver receives notification when sharing stops manually**
- [ ] **PWID location is cleared from database when sharing stops**
- [ ] Setting destination while sharing doesn't send duplicate notification
- [ ] Auto-stop works when PWID reaches destination
- [ ] **Caregiver receives notification when PWID arrives at destination**
- [ ] Sharing stops automatically when destination is reached
- [ ] Error handling works for permission denied
- [ ] Error handling works for missing phone number 