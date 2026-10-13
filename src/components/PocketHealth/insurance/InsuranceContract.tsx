import { Link } from "react-router";

// "Purchase Insurance" steps from the product spec (section 19.1.1.4).
const STEPS = [
  "Contact an insurance agent to understand the insurance and clarify any questions, including the terms of payment and insurance conditions.",
  "Once you're happy with the terms and the required pre-insurance checks, the agent sends an online referral through PocketHealth to their doctors or facilities.",
  "The provider (doctor or facility) orders the pre-insurance tests.",
  "You go to the designated facility for a health examination and test sample draws.",
  "Your health exam findings and results are sent to you and your potential insurer.",
  "The agent contacts you to discuss and offer the final details of the insurance contract.",
  "On agreeing, you pay the premium to the insurer through PocketHealth and submit the electronically signed contract to the agent.",
  "Your insurance begins as per the agreed terms.",
  "Subsequent premium payments are made through PocketHealth as set out in the contract.",
];

/** Health Insurance > Sign Insurance Contract: how getting cover works. Online signing/payment comes later. */
export default function InsuranceContract() {
  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-300">How getting health insurance cover through PocketHealth works:</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-white/[0.02] dark:text-gray-400">
        Signing contracts and paying premiums in the app is coming soon. For now, start by contacting an insurer from{" "}
        <Link to="/health-library/health_insurance_education?section=shop-compare" className="text-brand-500 underline">
          Shop & Compare
        </Link>
        , and keep your signed contract under{" "}
        <Link to="/health-library/health_insurance_education?section=insurance-documents" className="text-brand-500 underline">
          Health Insurance Documents
        </Link>
        .
      </div>
    </div>
  );
}
