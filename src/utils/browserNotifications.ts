/**
 * Browser Notification and Vibration Utilities for real-time blood transfusion alerts
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch {
      return false
    }
  }

  return false
}

export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
    requireInteraction?: boolean
  },
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return
  }

  // Trigger mobile vibration pattern if supported
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 400])
    } catch {
      // Ignore vibration error
    }
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        requireInteraction: options?.requireInteraction ?? true,
        ...options,
      })

      notification.onclick = () => {
        window.focus()
        if (options?.data?.url) {
          window.location.href = options.data.url
        }
        notification.close()
      }
    } catch (err) {
      console.warn("Native notification display error:", err)
    }
  }
}
