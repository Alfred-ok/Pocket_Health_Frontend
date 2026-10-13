import { useEffect, useState, type ComponentType } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import SymptomCheckerPanel from "../../components/PocketHealth/SymptomCheckerPanel";
import InsuranceShopCompare from "../../components/PocketHealth/insurance/InsuranceShopCompare";
import InsuranceDocuments from "../../components/PocketHealth/insurance/InsuranceDocuments";
import InsuranceContract from "../../components/PocketHealth/insurance/InsuranceContract";
import healthTopicApi from "../../api/healthTopicApi";
import { healthModules, type HealthModuleTool, type HealthModuleToolKey } from "../../config/healthModules";
import type { HealthTopic } from "../../types/pocketHealth";

const TOOL_COMPONENTS: Record<HealthModuleToolKey, ComponentType> = {
  "adult-symptom-checker": () => <SymptomCheckerPanel audience="adult" stacked />,
  "child-symptom-checker": () => <SymptomCheckerPanel audience="child" stacked />,
  "pregnancy-symptom-checker": () => <SymptomCheckerPanel audience="pregnancy" stacked />,
  "shop-compare": InsuranceShopCompare,
  "insurance-documents": InsuranceDocuments,
  "sign-contract": InsuranceContract,
};

const agreedKey = (moduleKey: string) => `ph_disclaimer_agreed_${moduleKey}`;

function hasAgreed(moduleKey: string) {
  try {
    return sessionStorage.getItem(agreedKey(moduleKey)) === "1";
  } catch {
    return false;
  }
}

/** A sub-module in the left-hand list: either a text topic from the database or an interactive tool. */
type Section =
  | { kind: "topic"; id: string; title: string; summary: string | null; sortOrder: number; topic: HealthTopic }
  | { kind: "tool"; id: string; title: string; summary: string | null; sortOrder: number; tool: HealthModuleTool };

export default function HealthModulePage() {
  const { moduleKey = "" } = useParams<{ moduleKey: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleConfig = healthModules.find((m) => m.key === moduleKey);
  const navigate = useNavigate();
  // The spec asks for the module's notice to be agreed to once per session before it opens.
  const [agreed, setAgreed] = useState(() => hasAgreed(moduleKey));
  useEffect(() => setAgreed(hasAgreed(moduleKey)), [moduleKey]);

  const agree = () => {
    try {
      sessionStorage.setItem(agreedKey(moduleKey), "1");
    } catch {
      /* storage unavailable — agreement just lasts for this page view */
    }
    setAgreed(true);
  };

  const [topics, setTopics] = useState<HealthTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    healthTopicApi
      .getByModule(moduleKey)
      .then((data) => !cancelled && setTopics(data))
      .catch(() => !cancelled && setTopics([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [moduleKey]);

  const toolSections: Section[] = (moduleConfig?.tools ?? []).map((tool) => ({
    kind: "tool",
    id: `tool:${tool.section}`,
    title: tool.title,
    summary: tool.summary,
    sortOrder: tool.sortOrder,
    tool,
  }));
  const topicSections: Section[] = topics.map((topic) => ({
    kind: "topic",
    id: topic.topicId,
    title: topic.title,
    summary: topic.summary,
    sortOrder: topic.sortOrder,
    topic,
  }));
  // Stable sort, tools listed first, so a tool wins ties with a topic of the same sort order.
  const sections = [...toolSections, ...topicSections].sort((a, b) => a.sortOrder - b.sortOrder);

  const requested = searchParams.get("section");
  const selected =
    sections.find((s) => (s.kind === "tool" ? s.tool.section === requested : s.id === requested)) ?? sections[0];

  const select = (section: Section) =>
    setSearchParams({ section: section.kind === "tool" ? section.tool.section : section.id }, { replace: true });

  const title = moduleConfig?.label ?? "Health Library";
  const ToolComponent = selected?.kind === "tool" ? TOOL_COMPONENTS[selected.tool.tool] : null;

  if (moduleConfig?.disclaimer && !agreed) {
    return (
      <>
        <PageMeta title={`${title} | PocketHealth`} description={moduleConfig.description} />
        <PageBreadcrumb pageTitle={title} />
        <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            If this is an emergency,{" "}
            <Link to="/emergency" className="text-error-500 underline">
              go to Emergency
            </Link>
            .
          </p>
          {moduleConfig.disclaimer.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {paragraph}
            </p>
          ))}
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <Link to="/providers" className="text-brand-500 underline">
              Consult a doctor or find a health facility
            </Link>
          </p>
          <div className="mt-6 flex gap-3">
            <Button size="sm" onClick={agree}>
              Agree
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${title} | PocketHealth`} description={moduleConfig?.description ?? ""} />
      <PageBreadcrumb pageTitle={title} />

      {moduleConfig?.description && (
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{moduleConfig.description}</p>
      )}

      {loading && toolSections.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!loading && sections.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No topics published yet for this module.</p>
      )}

      {sections.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => select(section)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?.id === section.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/5"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{section.title}</p>
                {section.summary && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{section.summary}</p>
                )}
              </button>
            ))}
            {loading && <p className="text-xs text-gray-400 dark:text-gray-500">Loading topics...</p>}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
            {selected ? (
              <>
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">{selected.title}</h3>
                {ToolComponent ? (
                  <ToolComponent />
                ) : (
                  selected.kind === "topic" && (
                    <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
                      {selected.topic.body ?? "Content coming soon."}
                    </p>
                  )
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a topic to view details.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
