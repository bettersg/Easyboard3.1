import * as admin from 'firebase-admin'
import { onCall, onRequest } from 'firebase-functions/v2/https'

// Load environment variables from .env file in development
// In production, Firebase Functions uses its own environment variable system
// Only load dotenv when not in production Firebase Functions runtime
if (!process.env.K_SERVICE && !process.env.FUNCTION_TARGET) {
  // K_SERVICE and FUNCTION_TARGET are set by Cloud Functions runtime
  // If they're not set, we're likely in local development
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config()
    console.log('[Functions] Loaded environment variables from .env file')
  } catch (error) {
    // dotenv is optional, only needed for local development
    console.log(
      '[Functions] dotenv not available, using system environment variables',
      error
    )
  }
}

admin.initializeApp()

/**
 * Verify Firebase Auth token from request header (for onRequest functions)
 * @param req Express request object
 * @returns Decoded token if valid, null otherwise
 * @internal Keep for potential future use with onRequest functions
 */
// async function verifyAuthToken(req: {
//   headers: { authorization?: string }
// }): Promise<admin.auth.DecodedIdToken | null> {
//   try {
//     const authHeader = req.headers.authorization
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return null
//     }

//     const token = authHeader.split('Bearer ')[1]
//     if (!token) {
//       return null
//     }

//     const decodedToken = await admin.auth().verifyIdToken(token)
//     return decodedToken
//   } catch (error) {
//     console.error('[verifyAuthToken] Error verifying token:', error)
//     return null
//   }
// }

// Define the structure of the incoming request body
interface NotificationPayload {
  to: string
  notification: {
    title: string
    body: string
  }
  data?: { [key: string]: string }
  priority?: 'high' | 'normal'
}

// Define the structure for Google Route request
interface GoogleRouteRequest {
  originLatLng: {
    latitude: number
    longitude: number
  }
  destinationLatLng: {
    latitude: number
    longitude: number
  }
}

/**
 * An HTTPS-triggered function that sends a push notification.
 * Enables CORS to be called from the client app.
 */
export const sendNotification = onRequest(
  { cors: ['https://easyboard-sg.web.app', 'http://localhost:3001', 'https://easyboard3.vercel.app'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' })
      return
    }

    try {
      const { to, notification, data, priority } =
        req.body as NotificationPayload

      // Validate required fields
      if (!to || !notification || !notification.title || !notification.body) {
        res
          .status(400)
          .json({ error: 'Missing required fields in notification payload' })
        return
      }

      // Create the FCM message payload
      const message: admin.messaging.Message = {
        token: to,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: data || {},
        android: {
          priority: priority || 'high',
          notification: {
            channelId: 'location-share-cn' // Ensure this channel is created on the Android client
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      }

      // Send the message using the Firebase Admin SDK
      const response = await admin.messaging().send(message)

      console.log('Successfully sent message:', response)
      res.status(200).json({ success: true, messageId: response })
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Failed to send notification',
          details: error.message
        })
      } else {
        res.status(500).json({ error: 'An unknown error occurred' })
      }
    }
  }
)

/**
 * A callable function that fetches Google Routes.
 * Can be called from React Native using httpsCallable.
 * Authentication is automatically handled by Firebase.
 */
export const getGoogleRoute = onCall(
  {
    cors: ['https://easyboard-sg.web.app', 'http://localhost:3001', 'https://easyboard3.vercel.app']
  },
  async (request) => {
    // For callable functions, authentication is automatically verified
    // request.auth contains the decoded token if user is authenticated
    if (!request.auth) {
      throw new Error('Unauthorized: Authentication required')
    }

    try {
      const { originLatLng, destinationLatLng } =
        request.data as GoogleRouteRequest

      // Validate required fields
      if (!originLatLng || !destinationLatLng) {
        throw new Error(
          'Missing required fields: originLatLng and destinationLatLng are required'
        )
      }

      if (
        typeof originLatLng.latitude !== 'number' ||
        typeof originLatLng.longitude !== 'number'
      ) {
        throw new Error('Invalid originLatLng format')
      }

      if (
        typeof destinationLatLng.latitude !== 'number' ||
        typeof destinationLatLng.longitude !== 'number'
      ) {
        throw new Error('Invalid destinationLatLng format')
      }

      // Get Google Maps API key from environment
      const apiKey = process.env.GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error(
          'Google Maps API key not configured in Firebase Functions'
        )
        throw new Error('Google Maps API key not configured')
      }

      // Prepare request parameters for Google Routes API
      const params = {
        origin: {
          location: {
            latLng: originLatLng
          }
        },
        destination: {
          location: {
            latLng: destinationLatLng
          }
        },
        travelMode: 'TRANSIT',
        computeAlternativeRoutes: true,
        languageCode: 'en-US',
        transitPreferences: {
          allowedTravelModes: ['TRAIN', 'BUS']
        },
        units: 'METRIC'
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes'
      }

      console.log('[getGoogleRoute] Fetching route from Google Routes API')

      // Make request to Google Routes API
      const result = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(params)
        }
      )

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({
          error: `HTTP ${result.status}: ${result.statusText}`
        }))
        console.error('[getGoogleRoute] API error:', result.status, errorData)
        throw new Error(`Failed to fetch route: ${JSON.stringify(errorData)}`)
      }

      const data = await result.json()
      if (data) {
        return data
      } else {
        throw new Error('No data received from Google Routes API')
      }
    } catch (error) {
      console.error('[getGoogleRoute] Error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to fetch route: ${error.message}`)
      } else {
        throw new Error('An unknown error occurred')
      }
    }
  }
)
