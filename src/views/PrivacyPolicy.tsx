import {
  ShieldCheck,
  Lock,
  Eye,
  Trash2,
  Mail,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import type { View } from "../types"

interface Props {
  setView: (v: View) => void
}

export default function PrivacyPolicy({ setView }: Props) {
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
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>GDPR, HIPAA & DPDP Act 2023 Compliant</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Effective Date: September 19, 2026 · Version 2.1 · B-Link Community
            Health Foundation
          </p>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-800 text-sm leading-relaxed">
        {/* Executive Summary */}
        <section
          aria-labelledby="summary-heading"
          className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border border-red-100"
        >
          <h2
            id="summary-heading"
            className="font-bold text-red-950 text-base mb-2 flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-red-700" /> Executive Privacy
            Commitment
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            B-Link is a non-profit, volunteer blood matching network. We do not
            sell personal data, display raw contact numbers publicly without
            request verification, or use tracking cookies for ad targeting. We
            only process health and contact data strictly necessary to match
            prospective blood donors with genuine hospital emergencies.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section aria-labelledby="collect-heading" className="space-y-3">
          <h2 id="collect-heading" className="text-lg font-bold text-gray-900">
            1. Information We Collect (Data Minimization Principle)
          </h2>
          <p>
            In accordance with data minimization principles, we only collect
            data that is strictly essential to facilitate life-saving blood
            donation matches:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-xs text-gray-900 block">
                Personal Identifiers
              </span>
              <p className="text-xs text-gray-600">
                Full name, verified mobile phone number, email address (optional
                for alert dispatch), and user profile avatar.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-xs text-gray-900 block">
                Health & Biological Data
              </span>
              <p className="text-xs text-gray-600">
                ABO & Rh blood group, date of last blood donation (to enforce
                mandatory 90-day medical interval cooldowns).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-xs text-gray-900 block">
                Geographic Location
              </span>
              <p className="text-xs text-gray-600">
                State and District level location only. We do not track precise
                GPS coordinates or background device location.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-xs text-gray-900 block">
                Emergency Blood Requests
              </span>
              <p className="text-xs text-gray-600">
                Patient pseudonym/name, hospital name, units required, urgency
                level, and scheduled transfusion date.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic">
            Note: We NEVER collect government national IDs (SSN, Aadhaar,
            Passport), financial information, credit cards, or unrelated
            biometric data.
          </p>
        </section>

        {/* 2. Legal Basis for Processing Sensitive Health Data */}
        <section aria-labelledby="legal-heading" className="space-y-3">
          <h2 id="legal-heading" className="text-lg font-bold text-gray-900">
            2. Legal Basis for Processing Sensitive Health Data
          </h2>
          <p>
            Under Article 9 of the EU General Data Protection Regulation (GDPR),
            the Digital Personal Data Protection (DPDP) Act 2023 (India), and
            international privacy frameworks, blood group and transfusion
            interval details constitute Special Category / Sensitive Personal
            Data.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              <strong>Explicit Affirmative Consent (Art. 9(2)(a)):</strong> You
              provide voluntary, unbundled, affirmative opt-in consent when
              registering as a donor or posting a patient blood request.
            </li>
            <li>
              <strong>Vital Interests (Art. 9(2)(c)):</strong> Processing is
              necessary in emergency medical scenarios to protect the vital life
              interests of patients requiring urgent blood transfusions.
            </li>
            <li>
              <strong>Non-Commercial Healthcare Support:</strong> Processing is
              carried out exclusively for humanitarian and peer health
              coordination purposes without commercial exploitation.
            </li>
          </ul>
        </section>

        {/* 3. How We Use and Share Your Information */}
        <section aria-labelledby="sharing-heading" className="space-y-3">
          <h2 id="sharing-heading" className="text-lg font-bold text-gray-900">
            3. How We Use and Share Information
          </h2>
          <p>We use your data solely for:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              Matching donor blood types with compatible hospital requests in
              the same district.
            </li>
            <li>
              Broadcasting emergency SMS/Email notifications when an urgent or
              critical request is posted.
            </li>
            <li>
              Calculating medical donation cooldown eligibility (90 days
              interval enforcement).
            </li>
          </ul>
          <p className="font-semibold text-gray-900 pt-2">
            Zero Commercial Sale / Third-Party Marketing Guarantee:
          </p>
          <p className="text-xs sm:text-sm text-gray-700">
            We do not sell, rent, monetize, or disclose your contact details to
            third-party advertisers, insurance providers, or pharmaceutical
            companies.
          </p>
        </section>

        {/* 4. Data Retention and Automated Purging */}
        <section aria-labelledby="retention-heading" className="space-y-3">
          <h2
            id="retention-heading"
            className="text-lg font-bold text-gray-900"
          >
            4. Data Retention & Automatic Purging
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              <strong>Fulfilled Blood Requests:</strong> Automatically archived
              after 30 days and permanently deleted after 90 days.
            </li>
            <li>
              <strong>OTP Verification Codes:</strong> Expire after 10 minutes
              and are purged from database records.
            </li>
            <li>
              <strong>Donor Profiles:</strong> Maintained while active. Donors
              can toggle their availability to "Inactive" or request complete
              deletion at any time.
            </li>
          </ul>
        </section>

        {/* 5. User Privacy Rights ("Right to be Forgotten") */}
        <section aria-labelledby="rights-heading" className="space-y-3">
          <h2 id="rights-heading" className="text-lg font-bold text-gray-900">
            5. Your Rights (GDPR & DPDP Act 2023)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-200">
              <span className="font-bold text-xs text-gray-900 block mb-1">
                Right to Access & Portability
              </span>
              <p className="text-xs text-gray-600">
                View and download all personal information associated with your
                account at any time.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200">
              <span className="font-bold text-xs text-gray-900 block mb-1">
                Right to Rectification
              </span>
              <p className="text-xs text-gray-600">
                Update your contact numbers, district, blood group, and donation
                dates via Profile Settings.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200">
              <span className="font-bold text-xs text-gray-900 block mb-1">
                Right to Withdraw Consent
              </span>
              <p className="text-xs text-gray-600">
                Toggle your donor status to unavailable to stop receiving
                matching notifications immediately.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200">
              <span className="font-bold text-xs text-gray-900 block mb-1">
                Right to Erasure ("Forget Me")
              </span>
              <p className="text-xs text-gray-600">
                Request complete irreversible removal of your phone number,
                name, and history from our systems.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Security Safeguards */}
        <section aria-labelledby="security-heading" className="space-y-3">
          <h2 id="security-heading" className="text-lg font-bold text-gray-900">
            6. Technical & Organizational Security
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            We enforce strict Transport Layer Security (TLS 1.3 encryption in
            transit), Row-Level Security (RLS) policies on Supabase cloud
            databases, hashed credentials, and role-based access control. No
            unauthenticated user can dump the full donor directory.
          </p>
        </section>

        {/* 7. Grievance Officer & Contact Details */}
        <section
          aria-labelledby="contact-heading"
          className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
        >
          <h2
            id="contact-heading"
            className="font-bold text-gray-900 text-base"
          >
            7. Grievance Redressal & Data Protection Officer (DPO)
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            If you have any questions, wish to exercise your data rights, or
            file a privacy grievance, please reach out to our designated Data
            Protection & Grievance Officer:
          </p>
          <div className="text-xs space-y-1 text-gray-800 font-medium">
            <p>
              <strong>Officer Name:</strong> Dr. Arvind Menon, Legal & Privacy
              Compliance Lead
            </p>
            <p>
              <strong>Organization:</strong> B-Link Community Health Foundation
            </p>
            <p>
              <strong>Registered Address:</strong> 4th Floor, Tech Hub Tower, MG
              Road, Ernakulam, Kerala 682016, India
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:privacy@blink-blood.org"
                className="text-red-700 underline font-bold"
              >
                privacy@blink-blood.org
              </a>{" "}
              /{" "}
              <a
                href="mailto:grievance@blink-blood.org"
                className="text-red-700 underline font-bold"
              >
                grievance@blink-blood.org
              </a>
            </p>
            <p>
              <strong>Grievance Resolution SLA:</strong> Acknowledgment within
              24 hours, resolution within 15 working days.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
