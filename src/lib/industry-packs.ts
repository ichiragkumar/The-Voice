export type IndustryPack = {
  id: string;
  name: string;
  icon: string;
  description: string;
  verifications: string[];
  sampleScenarios: string[];
  languages: string[];
  status: "available" | "coming_soon";
};

export const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: "ecommerce-cancel-refund",
    name: "E-commerce Cancellation & Refund",
    icon: "🛒",
    description:
      "Verifies order cancellations, refund amounts, refund methods, and delivery changes for e-commerce voice agents.",
    verifications: [
      "Correct order ID extracted",
      "Cancellation eligibility verified",
      "Correct cancellation tool called",
      "Refund amount matches item price (not order total)",
      "Refund method matches customer request (UPI/bank/original)",
      "Final order status in backend",
      "Customer told the truth",
    ],
    sampleScenarios: [
      "Cancel kar do — full order cancellation",
      "Sirf shirt cancel karo, belt rehne do — partial cancellation",
      "Refund UPI par chahiye, account mein nahi — refund method",
      "One four double nine wala order — spoken order ID",
      "Kal nahi, parson deliver karna — delivery reschedule",
      "Mujhe nahi chahiye, hata do — implicit cancellation",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "available",
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking & Rescheduling",
    icon: "📅",
    description:
      "Verifies appointment dates, times, doctor selection, and calendar state for clinic and hospital voice agents.",
    verifications: [
      "Correct date resolved (kal, parson, relative dates)",
      "Correct time resolved (saade chaar, paune paanch)",
      "Correct doctor/provider matched",
      "Patient name captured accurately",
      "Calendar API received correct arguments",
      "Final calendar state verified",
      "Confirmation matches booking",
    ],
    sampleScenarios: [
      "Kal nahi, uske agle din kar do — relative date",
      "Saade chaar baje — half past four",
      "Sharma ji ka cancel, Verma ji ka rakh do — multi-name",
      "Subah das baje Dr. Gupta ke saath — time + doctor",
      "Parson shaam ko — day after tomorrow evening",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "available",
  },
  {
    id: "collections-ptp",
    name: "Collections Promise-to-Pay",
    icon: "💰",
    description:
      "Verifies payment promise amounts, dates, and commitments for lending and collections voice agents.",
    verifications: [
      "Promise-to-pay amount correct",
      "PTP date correct (relative date resolution)",
      "Partial vs full payment distinction",
      "Payment reference numbers captured",
      "Commitment logged in CRM correctly",
      "Consent captured when required",
    ],
    sampleScenarios: [
      "Teen hazaar abhi, baaki parson — partial payment",
      "Salary aane ke baad, 16 ko — relative to salary date",
      "Full payment Monday ko — day name resolution",
      "NEFT se bhej diya kal — past payment confirmation",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "available",
  },
  {
    id: "address-change",
    name: "Delivery Address Change",
    icon: "📍",
    description:
      "Verifies address changes with Indian address formats, flat numbers, sectors, and pin codes.",
    verifications: [
      "Full address captured (street, area, city)",
      "Flat/apartment number correct",
      "Pin code verified",
      "Landmark included if mentioned",
      "Address update API called correctly",
      "Backend address state verified",
    ],
    sampleScenarios: [
      "Flat 3B, not 38 — alphanumeric confusion",
      "Koramangala 4th Block — area name",
      "Pin code chhe do teen shunya shunya ek — spoken pin",
      "Sector 22, Phase 2 — numbered sectors",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "available",
  },
  {
    id: "insurance-servicing",
    name: "Insurance Policy Servicing",
    icon: "🛡️",
    description:
      "Verifies nominee changes, premium payments, claim status, and policy modifications for insurance voice agents.",
    verifications: [
      "Policy number verified before changes",
      "Nominee details captured correctly",
      "API success/failure handled correctly",
      "Customer not told 'done' when API failed",
      "Premium amount and due date correct",
      "Claim status accurately relayed",
    ],
    sampleScenarios: [
      "Nominee change — API returns error but agent says done",
      "Premium due date inquiry — correct date relayed",
      "Claim status check — accurate status",
      "Address change on policy — correct update",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "available",
  },
  {
    id: "banking-servicing",
    name: "Banking & Loan Servicing",
    icon: "🏦",
    description:
      "Verifies loan EMI payments, balance inquiries, dispute handling, and regulatory disclosures.",
    verifications: [
      "Account/loan number verified",
      "EMI amount and due date correct",
      "Dispute captured with correct details",
      "Required disclosures completed",
      "Human escalation triggered when needed",
      "Consent recorded for transactions",
    ],
    sampleScenarios: [
      "EMI amount and due date inquiry",
      "Payment dispute with reference number",
      "Loan closure request",
      "Balance transfer inquiry",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "coming_soon",
  },
  {
    id: "telecom-servicing",
    name: "Telecom Plan & Recharge",
    icon: "📱",
    description:
      "Verifies plan changes, recharge amounts, data pack activations, and number porting for telecom agents.",
    verifications: [
      "Mobile number captured correctly",
      "Plan/pack identified accurately",
      "Recharge amount correct",
      "Activation date correct",
      "Port-out request handled with KYC",
    ],
    sampleScenarios: [
      "Do sau untees wala plan lagao — spoken amount",
      "Kal se start karo — activation date",
      "Number port karna hai — porting flow",
    ],
    languages: ["Hindi", "Hinglish", "English"],
    status: "coming_soon",
  },
];
