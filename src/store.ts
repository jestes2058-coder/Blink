import type { BloodBank, BloodGroup, BloodRequest, CurrentUser, Donor, DonorBadge, Match, SentEmailAlert, EmailOtpRecord, PhoneOtpRecord, SmsOtpRecord } from './types'
import { supabase, isSupabaseConfigured, broadcastEmergencyRequest } from './supabase'
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
  DEFAULT_STATE,
  DEFAULT_DISTRICT,
  KERALA_DISTRICTS,
} from './data/indianLocations'
import { computeScheduleDetails, formatRequestSchedule } from './utils/dateSchedule'

// Strict Email Validator
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length < 5 || trimmed.length > 254) return false
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  return emailRegex.test(trimmed)
}

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const DISTRICTS = KERALA_DISTRICTS

export const DEMO_USERS: (CurrentUser & { roleDesc?: string })[] = [
  { id: 'demo-1', name: 'Dr. Arjun Nair', phone: '+91 98470 12345', email: 'arjun@bloodlink.org', bloodGroup: 'O+', district: 'Ernakulam', state: 'Kerala', isDonor: true, roleDesc: 'O+ Voluntary Donor · Ernakulam' },
  { id: 'demo-2', name: 'Priya Varma', phone: '+91 94460 54321', email: 'priya@bloodlink.org', bloodGroup: 'A+', district: 'Thiruvananthapuram', state: 'Kerala', isDonor: true, roleDesc: 'A+ Life Saver · Trivandrum' },
  { id: 'demo-3', name: 'Mohammed Basil', phone: '+91 97450 99887', email: 'basil@bloodlink.org', bloodGroup: 'B+', district: 'Kozhikode', state: 'Kerala', isDonor: true, roleDesc: 'B+ Hospital Requester · Calicut' },
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
  { level: 'Bronze', title: 'Life Saver Initiate', minDonations: 1, color: '#B45309', bgLight: '#FEF3C7', description: 'Saved 3 lives through blood donation' },
  { level: 'Silver', title: 'Community Guardian', minDonations: 3, color: '#4B5563', bgLight: '#F3F4F6', description: 'Saved 9+ lives with consistent donations' },
  { level: 'Gold', title: 'District Hero', minDonations: 5, color: '#D97706', bgLight: '#FFFBEB', description: 'Saved 15+ lives - a true community champion' },
  { level: 'Platinum', title: 'Legendary Lifesaver', minDonations: 8, color: '#9333EA', bgLight: '#FAF5FF', description: 'Saved 24+ lives - exemplary civic champion' },
]

export function getDonorBadge(donations: number): DonorBadge | null {
  if (!donations || donations <= 0) return null
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
  if (!request.bloodGroup) return []
  const compatible = COMPATIBLE_DONORS[request.bloodGroup] || []
  const targetDistrict = (request.district || '').trim().toLowerCase()
  const targetState = (request.state || '').trim().toLowerCase()
  const isCritical = request.urgency === 'critical'

  return donors.filter(d => {
    if (!d.bloodGroup || !compatible.includes(d.bloodGroup)) return false
    if (d.id === request.requestorId || (request.requestorPhone && d.phone === request.requestorPhone)) return false
    if (d.available === false) return false
    if (!canDonate(d)) return false

    const donorDistrict = (d.district || '').trim().toLowerCase()
    const donorState = (d.state || '').trim().toLowerCase()

    // 1. Same District Match (Primary)
    if (targetDistrict && donorDistrict && (donorDistrict === targetDistrict || donorDistrict.includes(targetDistrict) || targetDistrict.includes(donorDistrict))) {
      return true
    }

    // 2. Critical SOS Emergency: Alert all matching donors in the same State or if district is unspecified
    if (isCritical && (targetState === donorState || !targetDistrict || !donorDistrict)) {
      return true
    }

    // 3. Fallback: if no district was specified, match all compatible donors
    if (!targetDistrict) {
      return true
    }

    return false
  })
}

export function createMatches(donors: Donor[], now: string): Match[] {
  return donors.map(d => ({
    donorId: d.id,
    donorName: d.name,
    donorBloodGroup: d.bloodGroup,
    donorDistrict: d.district,
    donorAvatar: d.avatar,
    status: 'pending' as const,
    notifiedAt: now,
  }))
}

// Generate contextual, situational email alert for matched donor
export function generateDonorAlertEmail(request: BloodRequest, donor: Donor): { subject: string; htmlBody: string; plainText: string } {
  const isEmergency = request.urgency === 'critical'
  const isUrgent = request.urgency === 'urgent'

  const urgencyLabel = isEmergency
    ? 'CRITICAL EMERGENCY (Need within 1–4 Hours)'
    : isUrgent
    ? 'URGENT (Need within 24 Hours)'
    : 'PLANNED (Scheduled Procedure)'

  const urgencyBadgeColor = isEmergency ? '#dc2626' : isUrgent ? '#d97706' : '#2563eb'
  const urgencyBgColor = isEmergency ? '#fef2f2' : isUrgent ? '#fffbeb' : '#eff6ff'
  const urgencyBorderColor = isEmergency ? '#fca5a5' : isUrgent ? '#fde68a' : '#bfdbfe'

  const subject = isEmergency
    ? `🚨 EMERGENCY ALERT: ${request.bloodGroup} Blood Needed for ${request.patientName} at ${request.hospital}, ${request.district}`
    : isUrgent
    ? `⚠️ URGENT REQUEST: ${request.bloodGroup} Blood Needed at ${request.hospital}, ${request.district}`
    : `📋 BLOOD REQUEST: ${request.bloodGroup} Scheduled Need at ${request.hospital}, ${request.district}`

  const plainText = `
BLOODLINK TRANSFUSION ALERT - ${urgencyLabel}
========================================================================

Hello ${donor.name},

An emergency blood request matching your blood group (${donor.bloodGroup} for patient ${request.bloodGroup}) has been broadcasted in your district (${request.district}, ${request.state || 'Kerala'}).

PATIENT & EMERGENCY DETAILS:
------------------------------------------------------------------------
- Patient Name: ${request.patientName}
- Required Blood Group: ${request.bloodGroup}
- When Needed (Schedule): ${formatRequestSchedule(request.requiredBy, request.neededDate, request.neededTime, request.urgency)}
- Units Needed: ${request.unitsNeeded || 1} Unit(s)
- Hospital/Facility: ${request.hospital}
- District & State: ${request.district}, ${request.state || 'India'}
- Urgency Level: ${urgencyLabel}
- Requestor Contact Name: ${request.requestorName}
- Medical / Emergency Notes: ${request.notes || 'Emergency transfusion required for inpatient care.'}

HOW TO RESPOND:
1. Open BloodLink App (or check Notifications tab).
2. Tap "Accept Request" to share your availability.
3. The coordinator will be notified and direct contact will be unlocked.

Thank you for being a registered volunteer donor in your community!
--
BloodLink Transfusion Matching Network
`.trim()

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px; font-size: 22px;">🩸</div>
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BloodLink Emergency Match</h1>
              <p style="margin: 0; font-size: 13px; color: #fecaca; font-weight: 500;">Rapid Community Transfusion Alert</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <!-- Urgency Pill -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; background: ${urgencyBgColor}; color: ${urgencyBadgeColor}; border: 1px solid ${urgencyBorderColor};">
                  ${urgencyLabel}
                </span>
              </div>

              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
                Dear <strong>${donor.name}</strong>,<br>
                A patient in <strong>${request.district}</strong> urgently needs a compatible donor. Your registered blood type (<strong>${donor.bloodGroup}</strong>) is compatible with this emergency request.
              </p>

              <!-- Request Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0; background: #fff1f2;">
                    <span style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Patient Required Blood Group</span>
                    <span style="display: inline-block; background: #dc2626; color: #ffffff; font-weight: 900; font-size: 24px; padding: 6px 18px; border-radius: 10px;">${request.bloodGroup}</span>
                    <span style="display: block; font-size: 12px; font-weight: 600; color: #047857; margin-top: 6px;">✓ 100% Compatible with your ${donor.bloodGroup} blood</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13.5px;">
                      <tr>
                        <td style="color: #64748b; font-weight: 600; width: 40%;">Patient Name:</td>
                        <td style="color: #0f172a; font-weight: 700; text-align: right;">${request.patientName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Hospital / Facility:</td>
                        <td style="color: #0f172a; font-weight: 700; text-align: right;">${request.hospital}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">District & State:</td>
                        <td style="color: #0f172a; font-weight: 700; text-align: right;">${request.district}, ${request.state || 'India'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">When Needed (Schedule):</td>
                        <td style="color: #b91c1c; font-weight: 800; text-align: right;">${formatRequestSchedule(request.requiredBy, request.neededDate, request.neededTime, request.urgency)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Units Required:</td>
                        <td style="color: #0f172a; font-weight: 700; text-align: right;">${request.unitsNeeded || 1} Unit(s)</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Requestor Name:</td>
                        <td style="color: #0f172a; font-weight: 700; text-align: right;">${request.requestorName}</td>
                      </tr>
                      ${request.notes ? `
                      <tr>
                        <td colspan="2" style="padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12.5px; color: #475569;">
                          <strong>Medical Notes:</strong> ${request.notes}
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 26px 0 14px 0;">
                <a href="#" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(220,38,38,0.3);">
                  Accept & Reveal Contact in App
                </a>
              </div>

              <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; margin: 0;">
                🔒 <strong>Privacy Protection:</strong> Your phone number remains completely confidential until you accept.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              This emergency message was sent to <strong>${donor.email}</strong> by BloodLink Transfusion System.<br>
              Every drop counts. Thank you for saving lives!
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return { subject, htmlBody, plainText }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Major Kerala & Indian Blood Banks Seed
export const SEED_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-1',
    name: 'IMA Blood Bank Complex & Research Centre',
    state: 'Kerala',
    district: 'Ernakulam',
    address: 'Near JLN Stadium, Palarivattom, Kochi',
    phone: '+91 484 234 6611',
    timing: 'Open 24/7 (Emergency Blood Bank)',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'critical', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'low', 'AB+': 'high', 'AB-': 'low' },
  },
  {
    id: 'bb-2',
    name: 'Government Medical College Blood Bank',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    address: 'Medical College PO, Thiruvananthapuram',
    phone: '+91 471 252 8300',
    timing: 'Open 24/7 (Emergency Service)',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'low', 'A+': 'moderate', 'A-': 'critical', 'B+': 'moderate', 'B-': 'moderate', 'AB+': 'high', 'AB-': 'moderate' },
  },
  {
    id: 'bb-3',
    name: 'Government General Hospital Blood Bank',
    state: 'Kerala',
    district: 'Kozhikode',
    address: 'Beach Road, Mananchira, Kozhikode',
    phone: '+91 495 236 5367',
    timing: 'Open 24/7 (Regional Transfusion Centre)',
    isEmergency24x7: true,
    availableStock: { 'O+': 'moderate', 'O-': 'moderate', 'A+': 'high', 'A-': 'high', 'B+': 'critical', 'B-': 'low', 'AB+': 'moderate', 'AB-': 'critical' },
  },
  {
    id: 'bb-4',
    name: 'Jubilee Mission Hospital Blood Centre',
    state: 'Kerala',
    district: 'Thrissur',
    address: 'Jubilee Mission PO, East Fort, Thrissur',
    phone: '+91 487 243 2200',
    timing: 'Open 24/7',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'low', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'low', 'AB+': 'moderate', 'AB-': 'low' },
  },
  {
    id: 'bb-5',
    name: 'Rotary Blood Bank & Transfusion Centre',
    state: 'Tamil Nadu',
    district: 'Chennai',
    address: '130 Montieth Road, Egmore, Chennai',
    phone: '+91 44 2855 4444',
    timing: 'Open 24/7 (Emergency Service)',
    isEmergency24x7: true,
    availableStock: { 'O+': 'high', 'O-': 'low', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'low', 'AB+': 'moderate', 'AB-': 'low' },
  },
  {
    id: 'bb-6',
    name: 'Victoria Hospital Blood Bank & Trauma Care',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    address: 'Fort Road, Near City Market, Bengaluru',
    phone: '+91 80 2670 1150',
    timing: 'Open 24/7',
    isEmergency24x7: true,
    availableStock: { 'O+': 'moderate', 'O-': 'critical', 'A+': 'high', 'A-': 'moderate', 'B+': 'high', 'B-': 'moderate', 'AB+': 'high', 'AB-': 'low' },
  },
]

// Play sound helper for emergency notifications & messages
export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioCtx.currentTime

    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.setValueAtTime(880, now + 0.12) // A5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1046.5, now + 0.22) // C6
    osc2.frequency.setValueAtTime(1318.5, now + 0.35) // E6

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(audioCtx.destination)

    osc1.start(now)
    osc1.stop(now + 0.22)
    osc2.start(now + 0.22)
    osc2.stop(now + 0.55)
  } catch {
    // Silent fallback
  }
}

// Play loud urgent emergency alarm siren
export function playEmergencyAlarm() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioCtx.currentTime

    // 3 alternating siren pulses
    for (let i = 0; i < 3; i++) {
      const start = now + i * 0.3
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(750, start)
      osc.frequency.linearRampToValueAtTime(1200, start + 0.14)
      osc.frequency.linearRampToValueAtTime(750, start + 0.28)

      gain.gain.setValueAtTime(0.35, start)
      gain.gain.exponentialRampToValueAtTime(0.02, start + 0.29)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start(start)
      osc.stop(start + 0.29)
    }
  } catch {
    // Silent fallback
  }
}

// Store with Real-Time Matching & Supabase Cloud Sync
export const store = {
  // Sync all data from Supabase silently in backend
  async syncFromSupabase() {
    if (!isSupabaseConfigured) return

    try {
      // Sync Real Donors from Supabase
      const { data: donorsData, error: donorsErr } = await supabase.from('donors').select('*')
      if (!donorsErr && donorsData) {
        const mappedDonors: Donor[] = donorsData.map(d => ({
          id: d.id,
          name: d.name,
          bloodGroup: d.blood_group as BloodGroup,
          state: d.state || DEFAULT_STATE,
          district: d.district,
          phone: d.phone,
          email: d.email || '',
          avatar: d.avatar,
          lastDonation: d.last_donation,
          registeredAt: d.registered_at || new Date().toISOString(),
          totalDonations: d.total_donations || 0,
          available: d.available ?? true,
        }))
        this.setDonors(mappedDonors)
      }

      // Sync Real Requests from Supabase
      const { data: reqData, error: reqErr } = await supabase.from('blood_requests').select('*')
      if (!reqErr && reqData) {
        const mappedReq: BloodRequest[] = reqData.map(r => {
          const scheduleMatch = (r.notes || '').match(/\[Schedule:\s*([^\]]+)\]/)
          const rawNotes = (r.notes || '').replace(/\[Schedule:\s*[^\]]+\]\s*/g, '').trim()
          const computedReqBy = r.required_by || (scheduleMatch ? scheduleMatch[1] : undefined)

          return {
            id: r.id,
            requestorId: r.requestor_id,
            requestorName: r.requestor_name,
            requestorPhone: r.requestor_phone,
            requestorAvatar: r.requestor_avatar,
            patientName: r.patient_name,
            bloodGroup: r.blood_group as BloodGroup,
            state: r.state || DEFAULT_STATE,
            district: r.district,
            urgency: r.urgency,
            hospital: r.hospital,
            unitsNeeded: r.units_needed,
            neededDate: r.needed_date,
            neededTime: r.needed_time,
            requiredBy: computedReqBy || formatRequestSchedule(undefined, r.needed_date, r.needed_time, r.urgency),
            notes: rawNotes,
            createdAt: r.created_at || new Date().toISOString(),
            status: r.status,
            matches: r.matches || [],
          }
        })
        this.setRequests(mappedReq)
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err)
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
    const existingIndex = donors.findIndex(
      existing => existing.phone === d.phone || (d.email && existing.email === d.email)
    )

    let donor: Donor
    if (existingIndex >= 0) {
      donor = { ...donors[existingIndex], ...d }
      donors[existingIndex] = donor
    } else {
      donor = {
        ...d,
        id: uid(),
        state: d.state || DEFAULT_STATE,
        registeredAt: new Date().toISOString(),
        totalDonations: 0,
        available: d.available ?? true,
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
          email: donor.email || null,
          last_donation: donor.lastDonation,
          registered_at: donor.registeredAt,
          total_donations: donor.totalDonations || 0,
          available: donor.available ?? true,
        })
      } catch (e) {
        console.warn('Supabase addDonor error:', e)
      }
    }

    // Auto-match this newly registered donor to any existing open requests in their district!
    const requests = this.getRequests()
    let updatedRequests = false
    requests.forEach(req => {
      if (req.status === 'open' && req.district.toLowerCase() === donor.district.toLowerCase()) {
        const compatible = COMPATIBLE_DONORS[req.bloodGroup] || []
        if (compatible.includes(donor.bloodGroup)) {
          const alreadyMatched = req.matches.some(m => m.donorId === donor.id || m.donorName === donor.name)
          if (!alreadyMatched) {
            req.matches.push({
              donorId: donor.id,
              donorName: donor.name,
              donorBloodGroup: donor.bloodGroup,
              donorDistrict: donor.district,
              donorAvatar: donor.avatar,
              status: 'pending',
              notifiedAt: new Date().toISOString(),
            })
            updatedRequests = true
          }
        }
      }
    })

    if (updatedRequests) {
      this.setRequests(requests)
    }

    return donor
  },

  async updateDonor(updated: Donor) {
    const donors = this.getDonors().map(d => (d.id === updated.id ? updated : d))
    this.setDonors(donors)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('donors').upsert({
          id: updated.id,
          name: updated.name,
          blood_group: updated.bloodGroup,
          state: updated.state,
          district: updated.district,
          phone: updated.phone,
          email: updated.email,
          avatar: updated.avatar,
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
    const requiredBy = r.requiredBy || formatRequestSchedule(undefined, r.neededDate, r.neededTime, r.urgency)

    const req: BloodRequest = {
      ...r,
      id: uid(),
      state: r.state || DEFAULT_STATE,
      district: r.district ? r.district.trim() : DEFAULT_DISTRICT,
      neededDate: r.neededDate,
      neededTime: r.neededTime,
      requiredBy,
      createdAt: now,
      status: 'open',
      matches: [],
    }

    // Auto-match all eligible district donors
    const donors = this.getDonors()
    const eligible = findEligibleDonors(req, donors)
    req.matches = createMatches(eligible, now)

    requests.unshift(req)
    this.setRequests(requests)

    // Trigger situation-based email alerts to matching donors
    this.sendDonorEmailAlerts(req)

    // Trigger loud emergency alarm sound
    playEmergencyAlarm()

    // Cross-Tab & In-App Immediate Broadcast
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bd_last_sos', JSON.stringify({ req, timestamp: Date.now() }))
        window.dispatchEvent(new CustomEvent('bloodlink_sos_broadcast', { detail: req }))
      } catch (evtErr) {
        console.warn('Broadcast event notice:', evtErr)
      }
    }

    if (isSupabaseConfigured) {
      try {
        // Embed schedule tag in notes so schema without custom columns retains schedule across any client
        const notesWithSchedule = req.requiredBy
          ? `[Schedule: ${req.requiredBy}] ${req.notes || ''}`.trim()
          : req.notes || ''

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
          notes: notesWithSchedule,
          created_at: req.createdAt,
          status: req.status,
          matches: req.matches,
        })

        // Broadcast to Supabase Realtime channel for cross-device alerts
        broadcastEmergencyRequest(req)
      } catch (e) {
        console.warn('Supabase addRequest error:', e)
      }
    }

    return req
  },

  async updateRequest(updated: BloodRequest) {
    const requests = this.getRequests().map(r => (r.id === updated.id ? updated : r))
    this.setRequests(requests)

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('blood_requests')
          .update({
            status: updated.status,
            matches: updated.matches,
          })
          .eq('id', updated.id)
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

    // Ensure this user exists in donors registry so matching & SOS notification is guaranteed
    if (u.bloodGroup && u.phone) {
      const donors = this.getDonors()
      const existingIdx = donors.findIndex(
        d => d.id === u.id || d.phone === u.phone || (u.email && d.email === u.email)
      )
      if (existingIdx >= 0) {
        donors[existingIdx] = {
          ...donors[existingIdx],
          name: u.name,
          phone: u.phone,
          email: u.email || donors[existingIdx].email,
          bloodGroup: u.bloodGroup,
          state: u.state || DEFAULT_STATE,
          district: u.district || DEFAULT_DISTRICT,
          avatar: u.avatar || donors[existingIdx].avatar,
          available: u.isDonor !== false,
        }
      } else {
        donors.push({
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email || '',
          bloodGroup: u.bloodGroup,
          state: u.state || DEFAULT_STATE,
          district: u.district || DEFAULT_DISTRICT,
          avatar: u.avatar,
          registeredAt: new Date().toISOString(),
          totalDonations: 0,
          available: true,
          lastDonation: null,
        })
      }
      this.setDonors(donors)
    }
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

  addUser(name: string, phone: string, email?: string, avatar?: string, bloodGroup?: BloodGroup, district?: string, state?: string): CurrentUser {
    const users = this.getUsers()
    const existing = users.find(u => (email && u.email === email) || u.phone === phone)
    if (existing) {
      existing.name = name
      if (email) existing.email = email
      if (avatar) existing.avatar = avatar
      if (bloodGroup) existing.bloodGroup = bloodGroup
      if (district) existing.district = district
      if (state) existing.state = state
      localStorage.setItem('bd_users', JSON.stringify(users))
      this.setCurrentUser(existing)
      return existing
    }
    const user: CurrentUser = {
      id: uid(),
      name,
      phone,
      email,
      avatar,
      bloodGroup: bloodGroup || 'O+',
      district: district || DEFAULT_DISTRICT,
      state: state || DEFAULT_STATE,
      isDonor: true,
    }
    users.push(user)
    localStorage.setItem('bd_users', JSON.stringify(users))
    this.setCurrentUser(user)
    return user
  },

  // Save complete user profile and sync with Donor record and Supabase
  async saveUserProfile(user: CurrentUser, isVolunteerDonor: boolean, isAvailable: boolean = true) {
    this.setCurrentUser(user)

    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === user.id || u.phone === user.phone)
    if (userIndex >= 0) {
      users[userIndex] = user
    } else {
      users.push(user)
    }
    localStorage.setItem('bd_users', JSON.stringify(users))

    const donors = this.getDonors()
    const donorIndex = donors.findIndex(d => d.id === user.id || d.phone === user.phone || (user.email && d.email === user.email))

    if (isVolunteerDonor && user.bloodGroup && user.district) {
      if (donorIndex >= 0) {
        const existingDonor = donors[donorIndex]
        const updatedDonor: Donor = {
          ...existingDonor,
          name: user.name,
          phone: user.phone,
          email: user.email || existingDonor.email,
          avatar: user.avatar,
          bloodGroup: user.bloodGroup,
          state: user.state || DEFAULT_STATE,
          district: user.district,
          available: isAvailable,
        }
        await this.updateDonor(updatedDonor)
      } else {
        await this.addDonor({
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          avatar: user.avatar,
          bloodGroup: user.bloodGroup,
          state: user.state || DEFAULT_STATE,
          district: user.district,
          lastDonation: null,
          available: isAvailable,
        })
      }
    } else if (!isVolunteerDonor && donorIndex >= 0) {
      // Remove from donors if unchecked
      donors.splice(donorIndex, 1)
      this.setDonors(donors)
      if (isSupabaseConfigured) {
        try {
          await supabase.from('donors').delete().eq('phone', user.phone)
        } catch (e) {
          console.warn('Supabase delete donor warning:', e)
        }
      }
    }

    // Also update profile in Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          blood_group: user.bloodGroup,
          district: user.district,
          is_donor: isVolunteerDonor,
          updated_at: new Date().toISOString(),
        })
      } catch (e) {
        console.warn('Supabase profile update warning:', e)
      }
    }
  },

  getBloodBanks(): BloodBank[] {
    return SEED_BLOOD_BANKS
  },

  // Sent Situation Email Alerts Management
  getSentEmails(): SentEmailAlert[] {
    try {
      return JSON.parse(localStorage.getItem('bd_sent_emails') || '[]')
    } catch {
      return []
    }
  },

  addSentEmail(alert: SentEmailAlert) {
    const emails = this.getSentEmails()
    emails.unshift(alert)
    // Keep last 100 alerts
    localStorage.setItem('bd_sent_emails', JSON.stringify(emails.slice(0, 100)))
  },

  getEmailsForDonor(donorEmail: string): SentEmailAlert[] {
    if (!donorEmail) return []
    const normalized = donorEmail.trim().toLowerCase()
    return this.getSentEmails().filter(e => e.recipientEmail.toLowerCase() === normalized)
  },

  getEmailForRequest(requestId: string, donorEmail?: string): SentEmailAlert | undefined {
    const emails = this.getSentEmails().filter(e => e.requestId === requestId)
    if (!emails.length) return undefined
    if (donorEmail) {
      const match = emails.find(e => e.recipientEmail.toLowerCase() === donorEmail.trim().toLowerCase())
      if (match) return match
    }
    return emails[0]
  },

  // Dispatch Situation-Based Emails to all matching eligible donors
  sendDonorEmailAlerts(request: BloodRequest): SentEmailAlert[] {
    const donors = this.getDonors()
    const eligible = findEligibleDonors(request, donors)
    const sentAlerts: SentEmailAlert[] = []

    for (const donor of eligible) {
      if (donor.email && isValidEmail(donor.email)) {
        const { subject, htmlBody, plainText } = generateDonorAlertEmail(request, donor)
        const alertRecord: SentEmailAlert = {
          id: 'email-' + uid(),
          requestId: request.id,
          recipientEmail: donor.email,
          recipientName: donor.name,
          patientName: request.patientName,
          bloodGroup: request.bloodGroup,
          urgency: request.urgency,
          hospital: request.hospital,
          district: request.district,
          state: request.state,
          subject,
          htmlBody,
          plainText,
          sentAt: new Date().toISOString(),
          status: 'delivered',
        }

        this.addSentEmail(alertRecord)
        sentAlerts.push(alertRecord)
      }
    }

    return sentAlerts
  },

  // SMS / Phone OTP Verification Helpers
  getPhoneOtps(): PhoneOtpRecord[] {
    try {
      return JSON.parse(localStorage.getItem('bd_phone_otps') || '[]')
    } catch {
      return []
    }
  },

  generatePhoneOtp(phone: string): PhoneOtpRecord {
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const otps = this.getPhoneOtps().filter(o => o.phone !== cleanPhone)
    // 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes expiry

    const record: PhoneOtpRecord = {
      phone: cleanPhone,
      code,
      expiresAt,
      verified: false,
    }

    otps.push(record)
    localStorage.setItem('bd_phone_otps', JSON.stringify(otps))
    return record
  },

  verifyPhoneOtp(phone: string, code: string): { success: boolean; error?: string } {
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const inputCode = code.trim()
    const otps = this.getPhoneOtps()
    const record = otps.find(o => o.phone === cleanPhone)

    if (!record) {
      return { success: false, error: 'No verification code found for this phone number. Please request a new SMS code.' }
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'SMS verification code has expired. Please click Resend SMS.' }
    }

    if (record.code !== inputCode) {
      return { success: false, error: 'Invalid SMS verification code. Please check the code and try again.' }
    }

    record.verified = true
    localStorage.setItem('bd_phone_otps', JSON.stringify(otps))
    return { success: true }
  },

  isPhoneVerified(phone: string): boolean {
    if (!phone) return false
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const record = this.getPhoneOtps().find(o => o.phone === cleanPhone)
    return Boolean(record?.verified)
  },

  // Email OTP Verification Helpers (for backwards compatibility)
  getOtps(): EmailOtpRecord[] {
    try {
      return JSON.parse(localStorage.getItem('bd_email_otps') || '[]')
    } catch {
      return []
    }
  },

  generateEmailOtp(email: string): EmailOtpRecord {
    const trimmed = email.trim().toLowerCase()
    const otps = this.getOtps().filter(o => o.email !== trimmed)
    // 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes expiry

    const record: EmailOtpRecord = {
      email: trimmed,
      code,
      expiresAt,
      verified: false,
    }

    otps.push(record)
    localStorage.setItem('bd_email_otps', JSON.stringify(otps))
    return record
  },

  verifyEmailOtp(email: string, code: string): { success: boolean; error?: string } {
    const trimmed = email.trim().toLowerCase()
    const inputCode = code.trim()
    const otps = this.getOtps()
    const record = otps.find(o => o.email === trimmed)

    if (!record) {
      return { success: false, error: 'No verification code found for this email. Please request a new code.' }
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please click Resend Code.' }
    }

    if (record.code !== inputCode) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' }
    }

    record.verified = true
    localStorage.setItem('bd_email_otps', JSON.stringify(otps))
    return { success: true }
  },

  isEmailVerified(email: string): boolean {
    if (!email) return false
    const trimmed = email.trim().toLowerCase()
    const record = this.getOtps().find(o => o.email === trimmed)
    return Boolean(record?.verified)
  },

  async clearAllData() {
    localStorage.removeItem('bd_donors')
    localStorage.removeItem('bd_requests')
    localStorage.removeItem('bd_users')
    localStorage.removeItem('bd_current_user')
    localStorage.removeItem('bd_sent_emails')
    localStorage.removeItem('bd_email_otps')
    localStorage.removeItem('bd_phone_otps')
    localStorage.removeItem('bd_custom_sb_url')
    localStorage.removeItem('bd_custom_sb_key')

    if (isSupabaseConfigured) {
      try {
        await Promise.allSettled([
          supabase.from('blood_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('donors').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        ])
      } catch (e) {
        console.warn('Supabase clearAllData notice:', e)
      }
    }
  },
}

// Clean initialization
export function seedIfEmpty() {
  const donors = store.getDonors()
  if (donors.some(d => d.id.startsWith('seed') || d.id.startsWith('donor-'))) {
    localStorage.removeItem('bd_donors')
    localStorage.removeItem('bd_requests')
    localStorage.removeItem('bd_users')
  }
}
