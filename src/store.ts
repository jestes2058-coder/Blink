import type { BloodBank, BloodGroup, BloodRequest, CurrentUser, Donor, DonorBadge, Match } from './types'
import { supabase, isSupabaseConfigured } from './supabase'

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const DISTRICTS = [
  'Central District',
  'North District',
  'South District',
  'East District',
  'West District',
  'Riverside',
  'Hillside',
  'Lakewood',
  'Greenville',
  'Mapleton',
  'Oakridge',
  'Sunnydale',
]

// Who can donate to a given recipient blood group
export const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
}

// Who a given donor blood group can donate to
export const COMPATIBLE_RECIPIENTS: Record<BloodGroup, BloodGroup[]> = {
  'A+':  ['A+', 'AB+'],
  'A-':  ['A+', 'A-', 'AB+', 'AB-'],
  'B+':  ['B+', 'AB+'],
  'B-':  ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+':  ['A+', 'B+', 'AB+', 'O+'],
  'O-':  ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
}

export const DONOR_BADGES: DonorBadge[] = [
  { level: 'Bronze', title: 'Life Saver Initiate', minDonations: 1, color: '#B45309', bgLight: '#FEF3C7', description: 'Saved up to 3 lives through blood donation' },
  { level: 'Silver', title: 'Community Guardian', minDonations: 3, color: '#4B5563', bgLight: '#F3F4F6', description: 'Saved up to 9 lives with consistent donations' },
  { level: 'Gold', title: 'District Hero', minDonations: 5, color: '#D97706', bgLight: '#FFFBEB', description: 'Saved over 15 lives - a true community champion' },
  { level: 'Platinum', title: 'Legendary Lifesaver', minDonations: 8, color: '#9333EA', bgLight: '#FAF5FF', description: 'Saved over 24 lives - exemplary civic champion' },
]

export function getDonorBadge(donations: number): DonorBadge | null {
  if (donations <= 0) return null
  for (let i = DONOR_BADGES.length - 1; i >= 0; i--) {
    if (donations >= DONOR_BADGES[i].minDonations) {
      return DONOR_BADGES[i]
    }
  }
  return DONOR_BADGES[0]
}

export const DONATION_INTERVAL_DAYS = 90

export function daysSinceLastDonation(donor: Donor): number | null {
  if (!donor.lastDonation) return null
  return Math.floor((Date.now() - new Date(donor.lastDonation).getTime()) / (1000 * 60 * 60 * 24))
}

export function canDonate(donor: Donor): boolean {
  const days = daysSinceLastDonation(donor)
  if (days === null) return true
  return days >= DONATION_INTERVAL_DAYS
}

export function nextEligibleDate(donor: Donor): Date | null {
  if (!donor.lastDonation) return null
  return new Date(new Date(donor.lastDonation).getTime() + DONATION_INTERVAL_DAYS * 86400000)
}

export function findEligibleDonors(request: Partial<BloodRequest>, donors: Donor[]): Donor[] {
  if (!request.bloodGroup || !request.district) return []
  const compatible = COMPATIBLE_DONORS[request.bloodGroup] || []
  const alreadyMatched = new Set((request.matches || []).map(m => m.donorId))
  return donors.filter(d =>
    d.district === request.district &&
    compatible.includes(d.bloodGroup) &&
    !alreadyMatched.has(d.id) &&
    d.id !== request.requestorId &&
    d.phone !== request.requestorPhone &&
    canDonate(d),
  )
}

export function createMatches(donors: Donor[], now: string): Match[] {
  return donors.map(d => ({
    donorId: d.id,
    donorName: d.name,
    donorBloodGroup: d.bloodGroup,
    donorDistrict: d.district,
    status: 'pending' as const,
    notifiedAt: now,
  }))
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Default initial blood banks
export const SEED_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-1',
    name: 'Central Red Cross Blood Center',
    district: 'Central District',
    address: '450 Healthcare Ave, Medical Enclave',
    phone: '+1-555-8001',
    timing: 'Open 24/7 (Emergency Service)',
    isEmergency24x7: true,
    availableStock: { 'O+': 'moderate', 'O-': 'critical', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'low', 'AB+': 'high', 'AB-': 'low' },
  },
  {
    id: 'bb-2',
    name: 'North General Hospital Blood Bank',
    district: 'North District',
    address: '12 Hospital Way, North Valley',
    phone: '+1-555-8002',
    timing: 'Open 24/7',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'low', 'A+': 'moderate', 'A-': 'critical', 'B+': 'moderate', 'B-': 'moderate', 'AB+': 'high', 'AB-': 'moderate' },
  },
  {
    id: 'bb-3',
    name: 'South District Rotary Blood Care',
    district: 'South District',
    address: '89 Civic Center Blvd, Southside',
    phone: '+1-555-8003',
    timing: '8:00 AM – 10:00 PM',
    isEmergency24x7: false,
    availableStock: { 'O+': 'moderate', 'O-': 'moderate', 'A+': 'high', 'A-': 'high', 'B+': 'critical', 'B-': 'low', 'AB+': 'moderate', 'AB-': 'critical' },
  },
  {
    id: 'bb-4',
    name: 'Riverside Community Blood Foundation',
    district: 'Riverside',
    address: '304 Riverfront Road',
    phone: '+1-555-8004',
    timing: 'Open 24/7',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'low', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'low', 'AB+': 'moderate', 'AB-': 'low' },
  },
]

// Store with Supabase Cloud Sync + Local Optimistic Cache
export const store = {
  // Sync all data from Supabase
  async syncFromSupabase() {
    if (!isSupabaseConfigured) return

    try {
      // Sync Donors
      const { data: donorsData, error: donorsErr } = await supabase.from('donors').select('*')
      if (!donorsErr && donorsData && donorsData.length > 0) {
        const mappedDonors: Donor[] = donorsData.map(d => ({
          id: d.id,
          name: d.name,
          bloodGroup: d.blood_group as BloodGroup,
          district: d.district,
          phone: d.phone,
          email: d.email || '',
          lastDonation: d.last_donation,
          registeredAt: d.registered_at || new Date().toISOString(),
          totalDonations: d.total_donations || 0,
          available: d.available ?? true,
        }))
        this.setDonors(mappedDonors)
      }

      // Sync Requests
      const { data: reqData, error: reqErr } = await supabase.from('blood_requests').select('*')
      if (!reqErr && reqData) {
        const mappedReq: BloodRequest[] = reqData.map(r => ({
          id: r.id,
          requestorId: r.requestor_id,
          requestorName: r.requestor_name,
          requestorPhone: r.requestor_phone,
          patientName: r.patient_name,
          bloodGroup: r.blood_group as BloodGroup,
          district: r.district,
          urgency: r.urgency,
          hospital: r.hospital,
          unitsNeeded: r.units_needed,
          notes: r.notes || '',
          createdAt: r.created_at || new Date().toISOString(),
          status: r.status,
          matches: r.matches || [],
        }))
        this.setRequests(mappedReq)
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err)
    }
  },

  getDonors(): Donor[] {
    try {
      return JSON.parse(localStorage.getItem('bd_donors') || '[]')
    } catch {
      return []
    }
  },

  setDonors(d: Donor[]) {
    localStorage.setItem('bd_donors', JSON.stringify(d))
  },

  async addDonor(d: Omit<Donor, 'id' | 'registeredAt' | 'totalDonations'>): Promise<Donor> {
    const donors = this.getDonors()
    const existingIndex = donors.findIndex(existing => existing.phone === d.phone || (d.email && existing.email === d.email))
    
    let donor: Donor
    if (existingIndex >= 0) {
      donor = { ...donors[existingIndex], ...d }
      donors[existingIndex] = donor
    } else {
      donor = {
        ...d,
        id: uid(),
        registeredAt: new Date().toISOString(),
        totalDonations: 0,
        available: true
      }
      donors.push(donor)
    }
    
    this.setDonors(donors)

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('donors').upsert({
          id: donor.id,
          name: donor.name,
          blood_group: donor.bloodGroup,
          district: donor.district,
          phone: donor.phone,
          email: donor.email,
          last_donation: donor.lastDonation,
          registered_at: donor.registeredAt,
          total_donations: donor.totalDonations,
          available: donor.available ?? true,
        })
      } catch (e) {
        console.warn('Supabase addDonor error:', e)
      }
    }

    return donor
  },

  async updateDonor(updated: Donor) {
    const donors = this.getDonors().map(d => d.id === updated.id ? updated : d)
    this.setDonors(donors)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('donors').upsert({
          id: updated.id,
          name: updated.name,
          blood_group: updated.bloodGroup,
          district: updated.district,
          phone: updated.phone,
          email: updated.email,
          last_donation: updated.lastDonation,
          total_donations: updated.totalDonations,
          available: updated.available,
        })
      } catch (e) {
        console.warn('Supabase updateDonor error:', e)
      }
    }
  },

  getRequests(): BloodRequest[] {
    try {
      return JSON.parse(localStorage.getItem('bd_requests') || '[]')
    } catch {
      return []
    }
  },

  setRequests(r: BloodRequest[]) {
    localStorage.setItem('bd_requests', JSON.stringify(r))
  },

  async addRequest(r: Omit<BloodRequest, 'id' | 'createdAt' | 'status' | 'matches'>): Promise<BloodRequest> {
    const requests = this.getRequests()
    const now = new Date().toISOString()
    const req: BloodRequest = {
      ...r,
      id: uid(),
      createdAt: now,
      status: 'open',
      matches: [],
    }

    // Auto-match eligible district donors
    const donors = this.getDonors()
    const eligible = findEligibleDonors(req, donors)
    req.matches = createMatches(eligible, now)

    requests.push(req)
    this.setRequests(requests)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('blood_requests').insert({
          id: req.id,
          requestor_id: req.requestorId,
          requestor_name: req.requestorName,
          requestor_phone: req.requestorPhone,
          patient_name: req.patientName,
          blood_group: req.bloodGroup,
          district: req.district,
          urgency: req.urgency,
          hospital: req.hospital,
          units_needed: req.unitsNeeded || 1,
          notes: req.notes,
          created_at: req.createdAt,
          status: req.status,
          matches: req.matches,
        })
      } catch (e) {
        console.warn('Supabase addRequest error:', e)
      }
    }

    return req
  },

  async updateRequest(updated: BloodRequest) {
    const requests = this.getRequests().map(r => r.id === updated.id ? updated : r)
    this.setRequests(requests)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('blood_requests').update({
          status: updated.status,
          matches: updated.matches,
        }).eq('id', updated.id)
      } catch (e) {
        console.warn('Supabase updateRequest error:', e)
      }
    }
  },

  async deleteRequest(id: string) {
    const requests = this.getRequests().filter(r => r.id !== id)
    this.setRequests(requests)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('blood_requests').delete().eq('id', id)
      } catch (e) {
        console.warn('Supabase deleteRequest error:', e)
      }
    }
  },

  getCurrentUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem('bd_current_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  setCurrentUser(u: CurrentUser) {
    localStorage.setItem('bd_current_user', JSON.stringify(u))
  },

  clearCurrentUser() {
    localStorage.removeItem('bd_current_user')
  },

  getUsers(): CurrentUser[] {
    try {
      return JSON.parse(localStorage.getItem('bd_users') || '[]')
    } catch {
      return []
    }
  },

  addUser(name: string, phone: string, email?: string): CurrentUser {
    const users = this.getUsers()
    const existing = users.find(u => (email && u.email === email) || u.phone === phone)
    if (existing) {
      existing.name = name
      if (email) existing.email = email
      localStorage.setItem('bd_users', JSON.stringify(users))
      return existing
    }
    const user: CurrentUser = { id: uid(), name, phone, email }
    users.push(user)
    localStorage.setItem('bd_users', JSON.stringify(users))
    return user
  },

  getBloodBanks(): BloodBank[] {
    return SEED_BLOOD_BANKS
  },
}

// Initial seed if local data is clean
export function seedIfEmpty() {
  if (store.getDonors().length > 0) return

  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

  const donors: Donor[] = [
    { id: 'donor-1', name: 'Aarav Sharma', bloodGroup: 'O+', district: 'Central District', phone: '+1-555-0101', email: 'aarav@example.com', lastDonation: daysAgo(120), registeredAt: daysAgo(400), totalDonations: 4, available: true },
    { id: 'donor-2', name: 'Priya Nair', bloodGroup: 'A-', district: 'North District', phone: '+1-555-0102', email: 'priya@example.com', lastDonation: daysAgo(95), registeredAt: daysAgo(300), totalDonations: 3, available: true },
    { id: 'donor-3', name: 'Rahul Mehta', bloodGroup: 'B+', district: 'East District', phone: '+1-555-0103', email: 'rahul@example.com', lastDonation: daysAgo(30), registeredAt: daysAgo(200), totalDonations: 2, available: false },
    { id: 'donor-4', name: 'Vikram Singh', bloodGroup: 'O-', district: 'South District', phone: '+1-555-0105', email: 'vikram@example.com', lastDonation: daysAgo(200), registeredAt: daysAgo(500), totalDonations: 8, available: true },
    { id: 'donor-5', name: 'Elena Rostova', bloodGroup: 'AB+', district: 'Central District', phone: '+1-555-0109', email: 'elena@example.com', lastDonation: daysAgo(140), registeredAt: daysAgo(220), totalDonations: 5, available: true },
  ]
  store.setDonors(donors)
}
