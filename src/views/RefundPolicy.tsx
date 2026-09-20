import {
  HeartHandshake,
  ShieldCheck,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
} from "lucide-react"
import type { View } from "../types"

interface Props {
  setView: (v: View) => void
}

export default function RefundPolicy({ setView }: Props) {
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
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            <span>
              100% Free Public Service Guarantee & Financial Transparency
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Refund & Zero-Fee Volunteer Policy
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Effective Date: September 19, 2026 · Version 2.1 · B-Link Community
            Health Foundation
          </p>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-800 text-sm leading-relaxed">
        {/* Core Guarantee */}
        <section
          aria-labelledby="guarantee-heading"
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2"
        >
          <h2
            id="guarantee-heading"
            className="font-bold text-emerald-950 text-base flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            100% Free Public Service — No Fees Ever Charged
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            B-Link is a non-profit volunteer platform.{" "}
            <strong>
              Registering as a donor, searching for compatible blood types,
              posting emergency blood requests, and receiving SMS/email
              notifications are completely FREE of charge.
            </strong>{" "}
            We do not charge subscription fees, matching fees, convenience
            charges, or platform commissions.
          </p>
        </section>

        {/* 1. Prohibition of Financial Exchange for Blood */}
        <section aria-labelledby="prohibition-refund" className="space-y-3">
          <h2
            id="prohibition-refund"
            className="text-lg font-bold text-gray-900"
          >
            1. Zero-Tolerance Against Paid Blood Donations
          </h2>
          <p>
            Under statutory public health regulations in India (Drugs &
            Cosmetics Act) and internationally (WHO Code of Ethics):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
            <li>
              No donor may demand or accept money, gift cards, or financial
              favors for donating blood.
            </li>
            <li>
              No requester may offer financial incentives on the platform.
            </li>
            <li>
              Because no monetary transactions occur on B-Link for blood
              matching, no commercial billing or consumer fees exist.
            </li>
          </ul>
        </section>

        {/* 2. Voluntary Server Hosting Donations / Grants */}
        <section aria-labelledby="donations-heading" className="space-y-3">
          <h2
            id="donations-heading"
            className="text-lg font-bold text-gray-900"
          >
            2. Policy on Voluntary Charitable Contributions & Server Sponsorship
          </h2>
          <p>
            The B-Link platform is supported through philanthropic grants and
            voluntary public contributions to cover cloud database hosting,
            Twilio SMS gateway costs, and email infrastructure.
          </p>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs sm:text-sm text-gray-700">
            <span className="font-bold text-gray-900 block">
              Charitable Donation Refund Terms:
            </span>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>30-Day Full Refund Window:</strong> If an individual or
                donor makes an erroneous or duplicate voluntary donation to the
                B-Link Foundation, they may request a 100% refund within 30 days
                of the transaction.
              </li>
              <li>
                <strong>Processing Time:</strong> Approved refunds will be
                credited back to the original payment method within 5 to 7
                business days.
              </li>
              <li>
                <strong>How to Request:</strong> Email{" "}
                <a
                  href="mailto:finance@blink-blood.org"
                  className="text-red-700 underline font-bold"
                >
                  finance@blink-blood.org
                </a>{" "}
                with your donation transaction ID, receipt, and reason for
                cancellation.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Fraud Prevention & Reporting Scams */}
        <section
          aria-labelledby="fraud-heading"
          className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border border-red-100 space-y-2"
        >
          <h2
            id="fraud-heading"
            className="font-bold text-red-950 text-base flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-700" /> Beware of
            Impersonators & Scams
          </h2>
          <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
            B-Link personnel will NEVER call you requesting UPI transfers, bank
            account details, or payment for blood delivery. If anyone contacting
            you via the platform demands payment, immediately report them to{" "}
            <a
              href="mailto:abuse@blink-blood.org"
              className="underline font-bold"
            >
              abuse@blink-blood.org
            </a>{" "}
            and your local cybercrime police.
          </p>
        </section>

        {/* 4. Contact Details */}
        <section
          aria-labelledby="finance-contact"
          className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2"
        >
          <h2
            id="finance-contact"
            className="font-bold text-gray-900 text-base"
          >
            4. Finance & Donation Queries
          </h2>
          <p className="text-xs text-gray-700">
            For financial auditing or donation refund queries, contact our
            finance team at{" "}
            <a
              href="mailto:finance@blink-blood.org"
              className="text-red-700 underline font-bold"
            >
              finance@blink-blood.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
