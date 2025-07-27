# Push Notification Setup Guide

This guide explains how to set up push notifications for location sharing from a Person with Intellectual Disabilities (PWID) to a caregiver in the EasyBoard app.

## Overview

The push notification system allows caregivers to receive real-time notifications when PWID users start sharing their location. The implementation uses Firebase Cloud Messaging (FCM).

The main components are:
1.  **Firebase Cloud Functions**: A backend function (`sendNotification`) that sends push notifications using the Firebase Admin SDK.
2.  **Client-side Services**:
    *   `notificationService.ts`: Handles requesting permissions, managing FCM tokens, and listening for incoming notifications.
    *   `fcmService.ts`: A client-side service to call the `sendNotification` backend function.
3.  **App Integration**: The app initializes the notification service on startup for authenticated users and calls it when location sharing is triggered.

## Prerequisites

1.  A Firebase project with **Cloud Messaging** and **Cloud Functions** enabled.
2.  Google Services configuration files for your React Native app:
    *   `google-services.json` for Android.
    *   `GoogleService-Info.plist` for iOS.
3.  [Firebase CLI](https://firebase.google.com/docs/cli) installed and configured on your local machine to deploy functions.

## Setup Steps

### 1. Firebase Project Configuration

#### Android
1.  From your Firebase project settings, download the `google-services.json` file.
2.  Place it in the `android/app/` directory of your project.
3.  **Create a Notification Channel**: For Android 8.0 (API level 26) and higher, a notification channel is required. The backend function sends notifications to a channel with the ID `location-share-cn`. You must create this channel in the Android native code. This is typically done in the `MainApplication.java` or `MainActivity.java` file.

    Example for `android/app/src/main/java/org/engineeringgood/EasyBoard/RN/MainApplication.kt`:
    ```java
    import android.app.NotificationChannel
    import android.app.NotificationManager
    import android.os.Build

    // ... inside the Application class

    override fun onCreate() {
      super.onCreate()
      // ... other initializations
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val notificationManager: NotificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val locationChannelId = "location-share-cn"
        val locationChannelName = "Location Sharing"
        val locationChannelDescription = "Notifications for when location is shared."
        val locationChannelImportance = NotificationManager.IMPORTANCE_HIGH
        val locationChannel = NotificationChannel(locationChannelId, locationChannelName, locationChannelImportance).apply {
            description = locationChannelDescription
        }
        notificationManager.createNotificationChannel(locationChannel)
      }
    }
    ```

#### iOS
1.  From your Firebase project settings, download the `GoogleService-Info.plist` file.
2.  Add it to your iOS project in Xcode.
3.  In Xcode, enable the "Push Notifications" capability for your app target.

### 2. Environment Variables

The client-side `fcmService.ts` needs the URL of your deployed Firebase Function. Create a `.env` file in the root of your project (if it doesn't exist) and add the following:

```env
EXPO_PUBLIC_FCM_API_URL=https://<your-region>-<your-project-id>.cloudfunctions.net/sendNotification
```
Replace `<your-region>` and `<your-project-id>` with your Firebase project's details. You can find the function URL in the Firebase console after deployment.

### 3. Backend Setup (Firebase Cloud Functions)

The backend logic resides in the `functions` directory.

1.  **Install Dependencies**: Navigate to the `functions` directory and install the necessary npm packages.
    ```bash
    cd functions
    npm install
    ```
2.  **Deploy the Function**: From the `functions` directory, deploy the `sendNotification` function using the Firebase CLI.
    ```bash
    firebase deploy --only functions
    ```
    The `firebase.json` configuration will automatically run `npm run build` to transpile the TypeScript code before deployment.

### 4. Testing the Implementation

#### Test Location Sharing
1.  Run the app on a PWID device and log in.
2.  In the app, start sharing the location with a caregiver.
3.  Check the device console logs for "Notification service initialized successfully" and for the FCM token.

#### Test Notifications
1.  Run the app on a caregiver's device and log in. Ensure this caregiver is associated with the PWID account.
2.  When the PWID user starts sharing their location, the caregiver device should receive a push notification.

## Implementation Details

### Files Modified/Created

1.  **`functions/src/index.ts`**: The backend Cloud Function that sends notifications.
2.  **`src/services/notificationService.ts`**: Main client-side service for handling notification logic.
3.  **`src/services/fcmService.ts`**: Client-side service to make HTTP requests to the backend function.
4.  **`src/contexts/LocationSharingContext.tsx`**: Updated to call `notificationService.sendLocationShareNotification` when location sharing starts.
5.  **`src/services/userService.ts`**: Includes functions to store and retrieve the user's FCM token from the database.
6.  **`App.tsx`**: Initializes the notification service for authenticated users.
7.  **`android/app/build.gradle`**: Ensure Firebase dependencies are correctly included.
8.  **`firebase.json` & `.firebaserc`**: Configuration for Firebase projects and Cloud Functions deployment.

### Database Schema Updates

The user objects in the Firebase Realtime Database are updated to include an `fcmToken` field:
```json
{
  "users": {
    "phone_number": {
      "uid": "firebase_auth_uid",
      "userType": "PWID" | "CAREGIVER",
      "fcmToken": "fcm_token_here",
      // ... other user fields
    }
  }
}
```

## Troubleshooting

### Common Issues

1.  **Notifications Not Received**:
    *   Verify that the FCM token is generated and correctly stored in the database for the caregiver user.
    *   Check the Firebase Function logs for any errors. You can view these in the Firebase Console.
    *   Ensure the `EXPO_PUBLIC_FCM_API_URL` in your `.env` file is correct.
    *   On Android, verify the `location-share-cn` notification channel has been created.
    *   Check the notification settings for the app on the device.

2.  **Permission Denied**:
    *   Ensure the user has granted notification permissions within the app.
    *   Check the app's notification settings in the device's system settings.

3.  **Function Deployment Fails**:
    *   Make sure you are authenticated with the Firebase CLI (`firebase login`).
    *   Check for any errors in the `functions/src/index.ts` file and ensure all dependencies are installed.

## Next Steps

After implementing the PWID side, you'll need to:

1. **Caregiver Side Implementation**: Handle incoming notifications
2. **Notification Actions**: Add actions like "View Location" or "Call PWID"
3. **Notification History**: Store and display notification history
4. **Settings**: Allow users to configure notification preferences

## Security Considerations

1. **API Key Protection**: Keep FCM API keys secure
2. **Token Validation**: Validate FCM tokens on backend
3. **Rate Limiting**: Implement rate limiting for notification sending
4. **User Consent**: Ensure users consent to notifications

## Performance Optimization

1. **Batch Notifications**: Group multiple location updates
2. **Token Cleanup**: Remove invalid FCM tokens
3. **Caching**: Cache caregiver data to reduce database calls
4. **Background Processing**: Use background tasks for notification sending 