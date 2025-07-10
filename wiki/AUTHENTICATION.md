# Authentication Flow Documentation

## Overview

The EasyBoard app uses Firebase Phone Authentication with OTP (One-Time Password) verification. The system supports two user types: **PWID** (Persons with Intellectual Disabilities) and **Caregiver**. Users can either register as new users or login with existing accounts.

## User Types

### PWID (Person with Intellectual Disabilities)
- **Purpose**: Primary users who need assistance with navigation and location sharing
- **Features**: 
  - Location sharing with caregivers
  - Route navigation and directions
  - Call caregiver functionality
  - Settings management
- **Screens**: Main, Introduction, Setting, GoogleMapsDirections, TransitOptions

### Caregiver
- **Purpose**: Support users who monitor and assist PWID users
- **Features**:
  - Track PWID location in real-time
  - Receive notifications when PWID shares location
  - View PWID on map
- **Screens**: CaregiverMain, TrackPWIDMap

## Authentication Flow

### 1. App Startup Flow

```
App.tsx
├── Check for existing user session (getUserStorage)
├── If session exists → Set authentication state
├── If no session → Show AuthStack
└── Render appropriate stack based on authentication state
```

**Navigation Logic:**
```typescript
// App.tsx - Main navigation logic
{!hasAuthen ? (
  <AuthStack />
) : userType === 'PWID' ? (
  <PWIDStack />
) : (
  <CaregiverStack />
)}
```

### 2. New User Registration Flow

```
Registration Screen
├── Enter phone number (8 digits)
├── Select user type (PWID or Caregiver)
├── Validate phone number format
├── Check if user already exists
├── Send OTP via Firebase Auth
├── Navigate to OTP Verification
└── After verification → Create user in database
```

**Registration Process:**
1. **Phone Number Input**: User enters 8-digit Singapore phone number
2. **User Type Selection**: Radio buttons for PWID or Caregiver
3. **Validation**: 
   - Phone number must be exactly 8 digits
   - Check if phone number already registered
4. **OTP Send**: Firebase Phone Auth sends OTP to `+65{phoneNumber}`
5. **Navigation**: Redirect to OTP Verification with registration flag

### 3. Existing User Login Flow

```
Authentication Screen
├── Enter phone number (8 digits)
├── Validate phone number format
├── Check if user exists in database
├── Send OTP via Firebase Auth
├── Navigate to OTP Verification
└── After verification → Login user
```

**Login Process:**
1. **Phone Number Input**: User enters 8-digit phone number
2. **Validation**: 
   - Phone number must be exactly 8 digits
   - Check if user exists in database
3. **OTP Send**: Firebase Phone Auth sends OTP
4. **Navigation**: Redirect to OTP Verification

### 4. OTP Verification Flow

```
OTP Verification Screen
├── Enter 6-digit OTP code
├── Validate OTP format
├── Verify OTP with Firebase Auth
├── If registration → Create user in database
├── Store user data in local storage
├── Set authentication state
└── Navigate to appropriate stack
```

**Verification Process:**
1. **OTP Input**: User enters 6-digit code received via SMS
2. **Validation**: OTP must be exactly 6 digits
3. **Firebase Verification**: Confirm OTP with Firebase Auth
4. **User Creation** (Registration only): Create user record in Firebase Database
5. **Local Storage**: Save user data to device storage
6. **Authentication State**: Update app context with user info
7. **Navigation**: Redirect to appropriate user stack

## Database Schema

### User Data Structure

```typescript
// PWID User
interface PWIDUser {
  uid: string;                    // Firebase Auth UID
  userType: 'PWID';
  deviceName: string;             // Device name for identification
  caregiverPhone?: string;        // Associated caregiver phone number
  location?: Location;            // Current location data
  fcmToken?: string;              // FCM token for notifications
  createdAt: number;              // Timestamp when user was created
  updatedAt: number;              // Timestamp of last update
}

// Caregiver User
interface CaregiverUser {
  uid: string;                    // Firebase Auth UID
  userType: 'CAREGIVER';
  deviceName: string;             // Device name for identification
  fcmToken?: string;              // FCM token for notifications
  createdAt: number;              // Timestamp when user was created
  updatedAt: number;              // Timestamp of last update
}
```

### Local Storage Structure

```typescript
interface UserStorage {
  phoneNumber: string;            // User's phone number
  userType: UserType;             // 'PWID' or 'CAREGIVER'
  loggedAt: number;               // Unix timestamp of last login
}
```

## Navigation Stacks

### AuthStack (Unauthenticated Users)
```
AuthStack
├── Authentication (Login Screen)
├── Registration (New User Registration)
└── OTPVerification (OTP Verification)
```

### PWIDStack (Authenticated PWID Users)
```
PWIDStack
├── Introduction (First-time user setup)
├── Main (Primary PWID interface)
├── Setting (User settings and preferences)
├── GoogleMapsDirections (Route navigation)
└── TransitOptions (Route selection)
```

### CaregiverStack (Authenticated Caregiver Users)
```
CaregiverStack
├── CaregiverMain (Caregiver dashboard)
└── TrackPWIDMap (Real-time PWID tracking)
```

## Screen Navigation Logic

### After Successful Authentication

**For PWID Users:**
- **First-time users** (`firstTimeUser: true`): Navigate to `Introduction`
- **Returning users**: Navigate to `Main`

**For Caregiver Users:**
- Always navigate to `CaregiverMain`

### Navigation Implementation

```typescript
// PWIDStack.tsx
<Stack.Navigator initialRouteName={firstTimeUser ? "Introduction" : "Main"}>
  <Stack.Screen name="Introduction" component={Introduction} />
  <Stack.Screen name="Main" component={Main} />
  // ... other screens
</Stack.Navigator>
```

## Security Features

### Phone Number Validation
- **Format**: Must be exactly 8 digits (Singapore format)
- **Storage**: Stored in E.164 format (`+65{phoneNumber}`)
- **Uniqueness**: Each phone number can only be registered once

### OTP Security
- **Length**: 6-digit codes
- **Expiration**: Firebase-managed expiration
- **Rate Limiting**: Firebase handles rate limiting for OTP requests

### Session Management
- **Local Storage**: User data stored securely using Expo SecureStore
- **Session Expiry**: Configurable session expiration (currently disabled)
- **Auto-logout**: Can be implemented for session expiry

## Error Handling

### Common Error Scenarios

1. **Invalid Phone Number**
   - Alert: "Please enter a valid phone number"
   - Validation: Must be exactly 8 digits

2. **User Already Exists** (Registration)
   - Alert: "This phone number is already registered"
   - Action: Prevent registration, suggest login

3. **User Not Found** (Login)
   - Alert: "This phone number is not registered. Please register first."
   - Action: Redirect to registration

4. **OTP Send Failure**
   - Alert: "Failed to send OTP. Please try again."
   - Action: Allow retry

5. **OTP Verification Failure**
   - Alert: "Failed to verify OTP. Please try again."
   - Action: Allow retry

6. **Network Errors**
   - Generic error messages for network-related issues
   - Retry mechanisms available

## User Experience Flow

### New PWID User Journey
1. **App Launch** → Authentication Screen
2. **Registration** → Select "PWID" user type
3. **Phone Verification** → Enter phone number and receive OTP
4. **OTP Verification** → Enter 6-digit code
5. **Introduction** → First-time setup screen
6. **Settings** → Configure caregiver phone number and preferences
7. **Main** → Primary app interface

### New Caregiver User Journey
1. **App Launch** → Authentication Screen
2. **Registration** → Select "Caregiver" user type
3. **Phone Verification** → Enter phone number and receive OTP
4. **OTP Verification** → Enter 6-digit code
5. **CaregiverMain** → Caregiver dashboard

### Returning User Journey
1. **App Launch** → Check for existing session
2. **Auto-login** → If session exists, go directly to appropriate stack
3. **Manual Login** → If no session, follow login flow

## Implementation Files

### Core Authentication Files
- **`src/pages/Authentication.tsx`**: Login screen
- **`src/pages/Registration.tsx`**: Registration screen
- **`src/pages/OTPVerification.tsx`**: OTP verification screen
- **`src/contexts/AppContext.tsx`**: Authentication state management
- **`src/services/userService.ts`**: User data operations
- **`src/services/storageService.ts`**: Local storage operations

### Navigation Files
- **`src/navigation/AuthStack.tsx`**: Authentication navigation
- **`src/navigation/PWIDStack.tsx`**: PWID user navigation
- **`src/navigation/CaregiverStack.tsx`**: Caregiver user navigation
- **`App.tsx`**: Main app navigation logic

### Type Definitions
- **`src/types/RootStackParamList.type.ts`**: Navigation type definitions
- **`src/services/userService.ts`**: User type definitions

## Testing Checklist

### Registration Flow
- [ ] New PWID user can register successfully
- [ ] New Caregiver user can register successfully
- [ ] Duplicate phone number registration is prevented
- [ ] Invalid phone number format is rejected
- [ ] OTP is sent and received correctly
- [ ] User is created in database after verification

### Login Flow
- [ ] Existing user can login successfully
- [ ] Non-existent user is redirected to registration
- [ ] Invalid phone number format is rejected
- [ ] OTP verification works correctly
- [ ] User session is restored correctly

### Navigation Flow
- [ ] New PWID users see Introduction screen
- [ ] Returning PWID users go directly to Main
- [ ] Caregiver users go to CaregiverMain
- [ ] Authentication state persists across app restarts

### Error Handling
- [ ] Network errors are handled gracefully
- [ ] Invalid OTP codes are rejected
- [ ] Session expiry works correctly (when enabled)
- [ ] User can logout and clear session

## Future Enhancements

### Planned Features
1. **Session Expiry**: Automatic logout after configurable time
2. **Biometric Authentication**: Fingerprint/Face ID support
3. **Multi-factor Authentication**: Additional security layers
4. **Account Recovery**: Password reset functionality
5. **Profile Management**: User profile editing capabilities
6. **Account Linking**: PWID-Caregiver relationship management

### Security Improvements
1. **Token Refresh**: Automatic token refresh mechanism
2. **Device Verification**: Device fingerprinting for security
3. **Audit Logging**: Track authentication events
4. **Rate Limiting**: Enhanced rate limiting for OTP requests

## Additional Notes

To get all PWIDs for a caregiver, query users where caregiverPhone equals the caregiver's phone number. 