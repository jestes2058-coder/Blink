import {
  FileCheck,
  AlertTriangle,
  Scale,
  ShieldAlert,
  ArrowLeft,
  Heart,
  Building2,
  PhoneCall,
} from "lucide-react"
import type { View } from "../types"

interface Props {
  setView: (v: View) => void
}

export default function TermsConditions({ setView }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-2 text-xs font-bold text-red-700 hover:text-red-800 transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-semibold backdrop-blur-md">
            <Scale className="w-4 h-4 text-yellow-300" />
            <span>Public Health Terms of Service & Legal Disclaimers</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Terms & Conditions of Use
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Effective Date: September 19, 2026 · Version 2.1 · B-Link Community
            Health Foundation
          </p>
        </div>
      </div>

      {/* Main Terms Content */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-800 text-sm leading-relaxed">
        {/* Critical Emergency Disclaimer */}
        <section
          aria-labelledby="emergency-disclaimer-heading"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2"
        >
          <h2
            id="emergency-disclaimer-heading"
            className="font-bold text-amber-950 text-base flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            EMERGENCY MEDICAL DISCLAIMER — NOT AN EMERGENCY DISPATCH SERVICE
          </h2>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>
              B-Link is a peer-to-peer communication network, not a government
              emergency service, hospital, or licensed ambulance dispatch.
            </strong>{" "}
            In life-threatening medical emergencies, acute trauma, or critical
            shock, immediately call your local emergency services (
            <strong>108 / 112 in India, 911 in North America</strong>) or
            proceed directly to an emergency department. Never delay certified
            medical care while awaiting volunteer donor responses.
          </p>
        </section>

        {/* 1. Strict Prohibition of Commercial Sale of Blood */}
        <section aria-labelledby="prohibition-heading" className="space-y-3">
          <h2
            id="prohibition-heading"
            className="text-lg font-bold text-gray-900 flex items-center gap-2"
          >
            <ShieldAlert className="w-5 h-5 text-red-700" /> 1. Strict
            Prohibition of Commercial Sale or Purchase of Blood
          </h2>
          <p>
            Under the National Blood Policy, the Drugs and Cosmetics Act
            (India), the US Food and Drug Administration (FDA) standards, and
            the World Health Organization (WHO) Guidelines,{" "}
            <strong>
              the commercial sale, purchase, brokering, or trading of human
              blood and blood components is strictly illegal and constitutes a
              criminal offense
            </strong>
            .
          </p>
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 space-y-2 text-xs text-red-950 font-medium">
            <p>
              • All blood donation coordination on B-Link is 100% voluntary and
              free of charge.
            </p>
            <p>
              • Demanding financial remuneration, transport kickbacks, or
              payment for blood units is strictly prohibited.
            </p>
            <p>
              • Any user attempting to monetize blood requests or donor matches
              will face permanent account termination and immediate referral to
              law enforcement authorities.
            </p>
          </div>
        </section>

        {/* 2. Nature of Platform & Role as Intermediary */}
        <section aria-labelledby="nature-heading" className="space-y-3">
          <h2 id="nature-heading" className="text-lg font-bold text-gray-900">
            2. Platform Role & Medical Intermediary Scope
          </h2>
          <p>
            B-Link acts solely as a technological communication platform
            connecting prospective volunteer donors with individuals seeking
            blood for hospitalized patients.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              B-Link is{" "}
              <strong>
                not a medical diagnostic entity, blood bank, or healthcare
                provider
              </strong>
              .
            </li>
            <li>
              B-Link does not collect, draw, store, screen, or test blood units.
            </li>
            <li>
              All physical blood donations, compatibility cross-matching,
              infectious disease screenings (HIV, Hepatitis B/C, Syphilis,
              Malaria), and blood component preparations must be conducted
              exclusively by authorized hospital laboratories and
              government-licensed blood transfusion centers.
            </li>
          </ul>
        </section>

        {/* 3. Donor Eligibility & Medical Prudence */}
        <section aria-labelledby="eligibility-heading" className="space-y-3">
          <h2
            id="eligibility-heading"
            className="text-lg font-bold text-gray-900"
          >
            3. Donor Eligibility & Good Faith Participation
          </h2>
          <p>
            By registering as a volunteer donor on B-Link, you confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              You are at least 18 years of age and meet the baseline physical
              donation criteria (minimum 50 kg body weight, good general
              health).
            </li>
            <li>
              You will honestly disclose your medical status to the certified
              phlebotomist at the blood collection center.
            </li>
            <li>
              You adhere to the mandatory 90-day minimum interval between whole
              blood donations (or physician-directed platelet intervals).
            </li>
            <li>
              You participate voluntarily under Good Samaritan principles with
              no expectation of financial reward.
            </li>
          </ul>
        </section>

        {/* 4. Limitation of Liability */}
        <section aria-labelledby="liability-heading" className="space-y-3">
          <h2
            id="liability-heading"
            className="text-lg font-bold text-gray-900"
          >
            4. Limitation of Liability & Good Samaritan Protection
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            To the maximum extent permitted by applicable law, B-Link Community
            Health Foundation, its trustees, volunteers, and technical
            contributors shall not be liable for any direct, indirect,
            incidental, or consequential damages resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              The availability, response time, punctuality, or medical
              suitability of any volunteer donor.
            </li>
            <li>
              Medical complications arising from transfusions conducted at
              third-party clinical institutions.
            </li>
            <li>
              Network downtimes, telecommunication delays, or undelivered
              SMS/email notifications.
            </li>
          </ul>
        </section>

        {/* 5. User Conduct & Zero-Tolerance Abuse Policy */}
        <section aria-labelledby="conduct-heading" className="space-y-3">
          <h2 id="conduct-heading" className="text-lg font-bold text-gray-900">
            5. User Conduct & Abuse Prevention
          </h2>
          <p>Users agree NOT to:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              Submit fake, deceptive, or speculative emergency blood requests.
            </li>
            <li>
              Harass, spam, solicit, or threaten any registered volunteer donor.
            </li>
            <li>
              Scrape, bulk-extract, or republish donor phone numbers or
              directory listings.
            </li>
            <li>Use automated bots or scripts to query the platform.</li>
          </ul>
        </section>

        {/* 6. Governing Law & Dispute Resolution */}
        <section aria-labelledby="governing-heading" className="space-y-3">
          <h2
            id="governing-heading"
            className="text-lg font-bold text-gray-900"
          >
            6. Governing Law & Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes arising in connection with the
            platform shall be subject to the exclusive jurisdiction of the
            competent courts in Ernakulam, Kerala, India.
          </p>
        </section>

        {/* 7. Contact Information */}
        <section
          aria-labelledby="contact-terms-heading"
          className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2"
        >
          <h2
            id="contact-terms-heading"
            className="font-bold text-gray-900 text-base"
          >
            7. Legal Department & Queries
          </h2>
          <p className="text-xs text-gray-700">
            For questions concerning these Terms, contact{" "}
            <a
              href="mailto:legal@blink-blood.org"
              className="text-red-700 underline font-bold"
            >
              legal@blink-blood.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
