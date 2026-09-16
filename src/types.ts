export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type Urgency = 'critical' | 'urgent' | 'planned'
export type MatchStatus = 'pending' | 'accepted' | 'declined'
export type RequestStatus = 'open' | 'fulfilled' | 'closed'

export type View =
  | 'welcome'
  | 'home'
  | 'register-donor'
  | 'request-blood'
  | 'notifications'
  | 'my-requests'
  | 'donors-directory'
  | 'compatibility'
  | 'eligibility-quiz'
  | 'blood-banks'
  | 'donor-card'

export interface CurrentUser {
  id: string
  name: string
  phone: string
  email?: string
}

export interface Donor {
  id: string
  name: string
  bloodGroup: BloodGroup
  district: string
  phone: string
  email: string
  lastDonation: string | null
  registeredAt: string
  totalDonations: number
  available?: boolean
}

export interface Match {
  donorId: string
  donorName: string
  donorBloodGroup: BloodGroup
  donorDistrict?: string
  status: MatchStatus
  notifiedAt: string
  respondedAt?: string
}

export interface BloodRequest {
  id: string
  requestorId: string
  requestorName: string
  requestorPhone: string
  patientName: string
  bloodGroup: BloodGroup
  district: string
  urgency: Urgency
  hospital: string
  unitsNeeded?: number
  notes: string
  createdAt: string
  status: RequestStatus
  matches: Match[]
}

export interface BloodBank {
  id: string
  name: string
  district: string
  address: string
  phone: string
  timing: string
  availableStock: Record<BloodGroup, 'high' | 'moderate' | 'low' | 'critical'>
  isEmergency24x7: boolean
}

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
}

export interface DonorBadge {
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  title: string
  minDonations: number
  color: string
  bgLight: string
  description: string
}
