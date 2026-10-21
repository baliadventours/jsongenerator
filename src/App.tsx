import React, { useState, useMemo } from "react";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Link2,
  FileJson,
  Sliders,
  Plus,
  Trash2,
  AlertCircle,
  ArrowUpRight,
  RotateCcw,
  Layers,
  CheckCircle2,
  FolderDown
} from "lucide-react";
import {
  DEFAULT_TENANT_CONFIG,
  REQUIRED_SCHEMA_KEYS,
  SAMPLE_MOUNT_BATUR_TOUR,
  TenantDefaults,
  TourDocument,
  normalizeToExactTourSchema
} from "./types/tour";

interface ExtractionHistoryItem {
  id: string;
  sourceInput: string;
  sourceType: "OTA URL" | "Prompt" | "Reference";
  otaName: string;
  createdAt: string;
  tour: TourDocument;
  groundingLinks?: { uri: string; title: string }[];
}

interface BatchItem {
  id: string;
  input: string;
  status: "queued" | "extracting" | "completed" | "error";
  error?: string;
  tour?: TourDocument;
}

const PRESET_SOURCES = [
  {
    label: "GetYourGuide: Mount Agung Trek",
    ota: "GetYourGuide",
    value:
      "https://www.getyourguide.com/bali-l347/bali-mount-agung-sunrise-trekking-experience-t392586/"
  },
  {
    label: "Klook: Short Link Sample",
    ota: "Klook",
    value: "https://s.klook.com/c/ZyzrNjr5XP"
  },
  {
    label: "Prompt: Nusa Penida Private Tour",
    ota: "Prompt",
    value:
      "Create a full-day Nusa Penida West & Diamond Beach Private Tour with Manta Bay snorkeling from Bali. Includes fast boat return tickets, private AC car on the island, English speaking driver/photographer, lunch, and hotel transfers."
  }
];

function detectOtaPlatform(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("getyourguide.com")) return "GetYourGuide";
  if (lower.includes("klook.com")) return "Klook";
  if (lower.includes("viator.com")) return "Viator";
  if (lower.includes("tripadvisor.com")) return "TripAdvisor";
  if (lower.includes("airbnb.com")) return "Airbnb Experiences";
  if (lower.includes("kkday.com")) return "KKday";
  if (/https?:\/\//i.test(input)) return "Web Tour URL";
  return "Direct Prompt";
}

export default function App() {
  const [activeSection, setActiveSection] = useState<
    "extractor" | "editor" | "json" | "defaults"
  >("extractor");

  const [inputMode, setInputMode] = useState<"single" | "batch">("single");
  const [rightPaneTab, setRightPaneTab] = useState<
    "json" | "visual" | "schema"
  >("json");

  const [inputText, setInputText] = useState<string>(
    "https://www.getyourguide.com/bali-l347/bali-mount-agung-sunrise-trekking-experience-t392586/"
  );
  const [batchInputText, setBatchInputText] = useState<string>(
    "https://s.klook.com/c/ZyzrNjr5XP\nhttps://www.getyourguide.com/bali-l347/bali-mount-agung-sunrise-trekking-experience-t392586/"
  );

  const [tenantDefaults, setTenantDefaults] = useState<TenantDefaults>(
    DEFAULT_TENANT_CONFIG
  );

  const [currentTour, setCurrentTour] = useState<TourDocument>(
    SAMPLE_MOUNT_BATUR_TOUR
  );
  const [rawJsonDraft, setRawJsonDraft] = useState<string>(() =>
    JSON.stringify(SAMPLE_MOUNT_BATUR_TOUR, null, 2)
  );
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  const [history, setHistory] = useState<ExtractionHistoryItem[]>([
    {
      id: "ref-batur-1839",
      sourceInput:
        "tour-mount-batur-sunrise-gold-black-lava-4x4-jeep-adventure-1839.json",
      sourceType: "Reference",
      otaName: "Reference Sample",
      createdAt: "Loaded from attachment",
      tour: SAMPLE_MOUNT_BATUR_TOUR
    }
  ]);
  const [activeHistoryId, setActiveHistoryId] =
    useState<string>("ref-batur-1839");

  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);

  const updateCurrentTourAndDraft = (updated: TourDocument) => {
    const normalized = normalizeToExactTourSchema(updated, tenantDefaults);
    setCurrentTour(normalized);
    setRawJsonDraft(JSON.stringify(normalized, null, 2));
    setJsonParseError(null);
  };

  const handleRawJsonChange = (value: string) => {
    setRawJsonDraft(value);
    try {
      const parsed = JSON.parse(value);
      setCurrentTour(parsed);
      setJsonParseError(null);
    } catch (err: any) {
      setJsonParseError(err?.message || "Invalid JSON syntax");
    }
  };

  const handleFormatAndNormalizeJson = () => {
    try {
      const parsed = JSON.parse(rawJsonDraft);
      const normalized = normalizeToExactTourSchema(parsed, tenantDefaults);
      setCurrentTour(normalized);
      setRawJsonDraft(JSON.stringify(normalized, null, 2));
      setJsonParseError(null);
    } catch (err: any) {
      setJsonParseError(err?.message || "Cannot normalize invalid JSON");
    }
  };

  const handleExtractSingle = async (overrideInput?: string) => {
    const targetInput = (overrideInput ?? inputText).trim();
    if (!targetInput) {
      setExtractionError("Please paste an OTA URL or tour prompt first.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const response = await fetch("/api/extract-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: targetInput,
          tenantDefaults
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Extraction failed (${response.status})`);
      }

      const extractedTour: TourDocument = normalizeToExactTourSchema(
        data.tour,
        tenantDefaults
      );

      updateCurrentTourAndDraft(extractedTour);

      const newItem: ExtractionHistoryItem = {
        id: `ext-${Date.now()}`,
        sourceInput: targetInput,
        sourceType: /https?:\/\//i.test(targetInput) ? "OTA URL" : "Prompt",
        otaName: detectOtaPlatform(targetInput),
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        tour: extractedTour,
        groundingLinks: data.meta?.groundingLinks || []
      };

      setHistory((prev) => [newItem, ...prev]);
      setActiveHistoryId(newItem.id);
    } catch (err: any) {
      setExtractionError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while extracting the tour."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRunBatch = async () => {
    const lines = batchInputText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const initialItems: BatchItem[] = lines.map((line, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      input: line,
      status: "queued"
    }));

    setBatchQueue(initialItems);
    setIsRunningBatch(true);

    for (let i = 0; i < initialItems.length; i++) {
      const item = initialItems[i];
      setBatchQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "extracting" } : q
        )
      );

      try {
        const response = await fetch("/api/extract-tour", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: item.input,
            tenantDefaults
          })
        });
        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Extraction failed");
        }

        const extractedTour = normalizeToExactTourSchema(
          data.tour,
          tenantDefaults
        );

        setBatchQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "completed", tour: extractedTour }
              : q
          )
        );

        updateCurrentTourAndDraft(extractedTour);

        const historyEntry: ExtractionHistoryItem = {
          id: item.id,
          sourceInput: item.input,
          sourceType: /https?:\/\//i.test(item.input) ? "OTA URL" : "Prompt",
          otaName: detectOtaPlatform(item.input),
          createdAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          tour: extractedTour,
          groundingLinks: data.meta?.groundingLinks || []
        };
        setHistory((prev) => [historyEntry, ...prev]);
        setActiveHistoryId(historyEntry.id);
      } catch (err: any) {
        setBatchQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "error",
                  error: err?.message || "Failed to extract"
                }
              : q
          )
        );
      }
    }

    setIsRunningBatch(false);
  };

  const downloadTourJson = (tourToDownload: TourDocument = currentTour) => {
    const cleanSlug =
      tourToDownload.slug ||
      tourToDownload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      "extracted-tour";
    const fileName = cleanSlug.startsWith("tour-")
      ? `${cleanSlug}.json`
      : `tour-${cleanSlug}.json`;

    const jsonString = JSON.stringify(tourToDownload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(rawJsonDraft);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 1800);
    } catch {
      // Fallback copy
    }
  };

  const schemaAudit = useMemo(() => {
    const presentKeys = Object.keys(currentTour || {});
    const results = REQUIRED_SCHEMA_KEYS.map((key) => {
      const exists = presentKeys.includes(key);
      const val = (currentTour as any)?.[key];
      const valuePreview =
        val === null
          ? "null"
          : Array.isArray(val)
          ? `Array(${val.length})`
          : typeof val === "object"
          ? JSON.stringify(val).slice(0, 42)
          : String(val).slice(0, 48);
      return { key, exists, valuePreview, type: Array.isArray(val) ? "array" : typeof val };
    });
    const matchedCount = results.filter((r) => r.exists).length;
    return {
      results,
      matchedCount,
      totalCount: REQUIRED_SCHEMA_KEYS.length
    };
  }, [currentTour]);

  const jsonByteSize = useMemo(() => {
    return (new Blob([rawJsonDraft]).size / 1024).toFixed(1);
  }, [rawJsonDraft]);

  const downloadFileName = useMemo(() => {
    const slug = currentTour.slug || "extracted-tour";
    return slug.startsWith("tour-") ? `${slug}.json` : `tour-${slug}.json`;
  }, [currentTour.slug]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("extractor");
          }}
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          TourJSON Studio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setActiveSection("extractor");
              setRightPaneTab("json");
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === "extractor"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent"
            }`}
          >
            URL Extractor
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection("editor");
              setRightPaneTab("visual");
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === "editor"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent"
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection("json");
              setRightPaneTab("schema");
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === "json"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent"
            }`}
          >
            Schema Audit
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("defaults")}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === "defaults"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent"
            }`}
          >
            Tenant Defaults
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => downloadTourJson(currentTour)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>
        </div>
      </header>

      {/* Main Workspace Container (1440px max-width with high-density 2-column layout) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-6">
        {/* Contextual Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 tabular-nums">
              <span>OTA Tour Importer</span>
              <span aria-hidden="true">·</span>
              <span>Firestore Schema v1.0</span>
              <span aria-hidden="true">·</span>
              <span>
                {schemaAudit.matchedCount}/{schemaAudit.totalCount} Keys
                Verified
              </span>
              <span aria-hidden="true">·</span>
              <span>{jsonByteSize} KB</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              OTA URL &amp; Prompt to Tour JSON Generator
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateCurrentTourAndDraft(SAMPLE_MOUNT_BATUR_TOUR);
                setActiveHistoryId("ref-batur-1839");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Load Attached Reference JSON
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedState ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Tenant Defaults Drawer when selected */}
        {activeSection === "defaults" && (
          <section className="mb-6 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Website Import &amp; Tenant ID Defaults
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the default Firestore IDs injected into every
                  extracted JSON file so it imports directly into your website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTenantDefaults(DEFAULT_TENANT_CONFIG);
                  updateCurrentTourAndDraft(
                    normalizeToExactTourSchema(
                      currentTour,
                      DEFAULT_TENANT_CONFIG
                    )
                  );
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reset to Sample IDs
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tenant ID (tenantId)
                </label>
                <input
                  type="text"
                  value={tenantDefaults.tenantId}
                  onChange={(e) => {
                    const next = {
                      ...tenantDefaults,
                      tenantId: e.target.value
                    };
                    setTenantDefaults(next);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category ID (categoryId)
                </label>
                <input
                  type="text"
                  value={tenantDefaults.categoryId}
                  onChange={(e) => {
                    const next = {
                      ...tenantDefaults,
                      categoryId: e.target.value
                    };
                    setTenantDefaults(next);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Location ID (locationId)
                </label>
                <input
                  type="text"
                  value={tenantDefaults.locationId}
                  onChange={(e) => {
                    const next = {
                      ...tenantDefaults,
                      locationId: e.target.value
                    };
                    setTenantDefaults(next);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Image Label ID (imageLabelId / labelIds)
                </label>
                <input
                  type="text"
                  value={tenantDefaults.imageLabelId}
                  onChange={(e) => {
                    const next = {
                      ...tenantDefaults,
                      imageLabelId: e.target.value
                    };
                    setTenantDefaults(next);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Transport ID
                </label>
                <input
                  type="text"
                  value={tenantDefaults.primaryTransportId}
                  onChange={(e) => {
                    const next = {
                      ...tenantDefaults,
                      primaryTransportId: e.target.value
                    };
                    setTenantDefaults(next);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentTourAndDraft(
                      normalizeToExactTourSchema(
                        {
                          ...currentTour,
                          tenantId: tenantDefaults.tenantId,
                          categoryId: tenantDefaults.categoryId,
                          locationId: tenantDefaults.locationId,
                          imageLabelId: tenantDefaults.imageLabelId,
                          labelIds: [tenantDefaults.imageLabelId],
                          transportIds: [tenantDefaults.primaryTransportId]
                        },
                        tenantDefaults
                      )
                    );
                    setActiveSection("extractor");
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Apply IDs to Current JSON
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Primary 12-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (5 cols): Source URL / Prompt Input + History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Extraction Input Panel */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    01. Source Input
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste a Viator, GetYourGuide, or Klook URL, raw tour copy,
                    or prompt
                  </p>
                </div>

                {/* Segmented Interactive Mode Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => setInputMode("single")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      inputMode === "single"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Single Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("batch")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      inputMode === "batch"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Batch URLs
                  </button>
                </div>
              </div>

              {inputMode === "single" ? (
                <>
                  {/* Quick Sample Presets from User Request */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-600 mb-2">
                      Quick-load sample URLs or prompts:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SOURCES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setInputText(preset.value);
                            setExtractionError(null);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL or Prompt Textarea */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-slate-700">
                        OTA Listing URL or Tour Description
                      </span>
                      <span>
                        Detected:{" "}
                        <strong className="font-medium text-slate-800">
                          {detectOtaPlatform(inputText)}
                        </strong>
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste URL (e.g., https://www.getyourguide.com/... or https://s.klook.com/...) or describe the tour itinerary, packages, and pricing..."
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 transition-colors font-mono"
                    />
                  </div>

                  {extractionError && (
                    <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">{extractionError}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isExtracting}
                      onClick={() => handleExtractSingle()}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isExtracting
                        ? "Extracting OTA Data & Mapping Schema..."
                        : "Extract & Generate JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText("");
                        setExtractionError(null);
                      }}
                      className="px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </>
              ) : (
                /* Batch Mode */
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      One OTA URL or Tour Prompt per line
                    </label>
                    <textarea
                      rows={5}
                      value={batchInputText}
                      onChange={(e) => setBatchInputText(e.target.value)}
                      placeholder={
                        "https://s.klook.com/c/ZyzrNjr5XP\nhttps://www.getyourguide.com/bali-l347/bali-mount-agung-sunrise-trekking-experience-t392586/"
                      }
                      className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isRunningBatch}
                    onClick={handleRunBatch}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    {isRunningBatch
                      ? "Processing Batch Queue..."
                      : "Extract All URLs in Queue"}
                  </button>

                  {batchQueue.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Batch Extraction Queue</span>
                        <span className="tabular-nums">
                          {
                            batchQueue.filter((b) => b.status === "completed")
                              .length
                          }{" "}
                          / {batchQueue.length} completed
                        </span>
                      </div>
                      {batchQueue.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-slate-800 truncate">
                              {item.tour?.title || item.input}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              Status: {item.status}
                              {item.error ? ` — ${item.error}` : ""}
                            </div>
                          </div>
                          {item.tour && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCurrentTourAndDraft(item.tour!)
                                }
                                className="px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                Inspect
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadTourJson(item.tour!)}
                                className="px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
                              >
                                .json
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Active Tour Summary & Quick Website Import Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  02. Extracted Tour Summary
                </h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {downloadFileName}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-500">Title &amp; Slug</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {currentTour.title}
                  </div>
                  <div className="font-mono text-slate-500 mt-0.5 break-all">
                    /{currentTour.slug}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-2.5 border-y border-slate-100 tabular-nums">
                  <div>
                    <div className="text-slate-500">Location</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {currentTour.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Duration</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {currentTour.duration}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Pricing (USD)</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      ${currentTour.discountPrice} – $
                      {currentTour.regularPrice}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-600 tabular-nums">
                  <span>
                    {currentTour.highlights?.length || 0} Highlights ·{" "}
                    {currentTour.itinerary?.length || 0} Itinerary Stops ·{" "}
                    {currentTour.packages?.length || 0} Packages
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => downloadTourJson(currentTour)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderDown className="w-4 h-4" />
                  Download {downloadFileName}
                </button>
              </div>
            </section>

            {/* Generated Files History */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  03. Extracted JSON Files ({history.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Click any file to inspect or download
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {history.map((item) => {
                  const isSelected = item.id === activeHistoryId;
                  return (
                    <div
                      key={item.id}
                      className={`py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 ${
                        isSelected ? "opacity-100" : "opacity-85 hover:opacity-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveHistoryId(item.id);
                          updateCurrentTourAndDraft(item.tour);
                        }}
                        className="text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 tabular-nums">
                          <span className="font-medium text-slate-700">
                            {item.otaName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.sourceType}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.createdAt}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                          {item.tour.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          tour-{item.tour.slug}.json
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadTourJson(item.tour)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (7 cols): Live JSON Output / Visual Form Editor / Schema Audit */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            {/* Right Pane Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRightPaneTab("json")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    rightPaneTab === "json"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  JSON Output
                </button>
                <button
                  type="button"
                  onClick={() => setRightPaneTab("visual")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    rightPaneTab === "visual"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Structured Editor
                </button>
                <button
                  type="button"
                  onClick={() => setRightPaneTab("schema")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    rightPaneTab === "schema"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Schema Verification ({schemaAudit.matchedCount}/
                  {schemaAudit.totalCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {rightPaneTab === "json" && (
                  <button
                    type="button"
                    onClick={handleFormatAndNormalizeJson}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Normalize Keys
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedState ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTourJson(currentTour)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save .json
                </button>
              </div>
            </div>

            {/* Right Pane Body */}
            {rightPaneTab === "json" && (
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between px-5 py-2 bg-slate-900 text-slate-400 text-xs font-mono border-b border-slate-800">
                  <span>{downloadFileName}</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    {jsonParseError ? (
                      <span className="text-red-400">
                        Syntax Error: {jsonParseError}
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        Valid Firestore Tour JSON ·{" "}
                        {rawJsonDraft.split("\n").length} lines
                      </span>
                    )}
                  </div>
                </div>
                <textarea
                  value={rawJsonDraft}
                  onChange={(e) => handleRawJsonChange(e.target.value)}
                  spellCheck={false}
                  className="w-full h-[680px] p-5 bg-[#0F172A] text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                />
              </div>
            )}

            {rightPaneTab === "visual" && (
              <div className="p-5 space-y-6 max-h-[720px] overflow-y-auto">
                {/* Basic Tour Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">
                    Core Tour Identity &amp; Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tour Title
                      </label>
                      <input
                        type="text"
                        value={currentTour.title}
                        onChange={(e) =>
                          updateCurrentTourAndDraft({
                            ...currentTour,
                            title: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={currentTour.slug}
                        onChange={(e) =>
                          updateCurrentTourAndDraft({
                            ...currentTour,
                            slug: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={currentTour.location}
                        onChange={(e) =>
                          updateCurrentTourAndDraft({
                            ...currentTour,
                            location: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={currentTour.duration}
                        onChange={(e) =>
                          updateCurrentTourAndDraft({
                            ...currentTour,
                            duration: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Regular Price ($)
                        </label>
                        <input
                          type="number"
                          value={currentTour.regularPrice}
                          onChange={(e) =>
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              regularPrice: Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Discount Price ($)
                        </label>
                        <input
                          type="number"
                          value={currentTour.discountPrice}
                          onChange={(e) =>
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              discountPrice: Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={currentTour.description}
                        onChange={(e) =>
                          updateCurrentTourAndDraft({
                            ...currentTour,
                            description: e.target.value
                          })
                        }
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Highlights Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Highlights ({currentTour.highlights.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentTourAndDraft({
                          ...currentTour,
                          highlights: [
                            ...currentTour.highlights,
                            "New tour highlight"
                          ]
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentTour.highlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hl}
                          onChange={(e) => {
                            const next = [...currentTour.highlights];
                            next[idx] = e.target.value;
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              highlights: next
                            });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = currentTour.highlights.filter(
                              (_, i) => i !== idx
                            );
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              highlights: next
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Remove highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Itinerary Stops ({currentTour.itinerary.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentTourAndDraft({
                          ...currentTour,
                          itinerary: [
                            ...currentTour.itinerary,
                            {
                              day: 1,
                              title: `Stop ${currentTour.itinerary.length + 1}`,
                              description: "Describe the experience at this stop.",
                              image: "/api/uploads/FQRNDs8llr6LOi49CLO7"
                            }
                          ]
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stop
                    </button>
                  </div>
                  <div className="space-y-3">
                    {currentTour.itinerary.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-slate-500">
                            Stop 0{idx + 1} (Day {step.day})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = currentTour.itinerary.filter(
                                (_, i) => i !== idx
                              );
                              updateCurrentTourAndDraft({
                                ...currentTour,
                                itinerary: next
                              });
                            }}
                            className="text-xs text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const next = [...currentTour.itinerary];
                            next[idx] = { ...step, title: e.target.value };
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              itinerary: next
                            });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                        />
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => {
                            const next = [...currentTour.itinerary];
                            next[idx] = {
                              ...step,
                              description: e.target.value
                            };
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              itinerary: next
                            });
                          }}
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packages & Tiers Editor */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">
                    Packages &amp; Participant Pricing Tiers (
                    {currentTour.packages.length})
                  </h3>
                  <div className="space-y-4">
                    {currentTour.packages.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => {
                              const next = [...currentTour.packages];
                              next[pIdx] = { ...pkg, name: e.target.value };
                              updateCurrentTourAndDraft({
                                ...currentTour,
                                packages: next
                              });
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded"
                          />
                          <span className="text-xs text-slate-500 font-mono tabular-nums">
                            {pkg.tiers.length} pricing tiers
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={pkg.description}
                          onChange={(e) => {
                            const next = [...currentTour.packages];
                            next[pIdx] = {
                              ...pkg,
                              description: e.target.value,
                              details: e.target.value
                            };
                            updateCurrentTourAndDraft({
                              ...currentTour,
                              packages: next
                            });
                          }}
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded"
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {pkg.tiers.map((tier, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-2 bg-white border border-slate-200 rounded text-xs tabular-nums"
                            >
                              <div className="text-[11px] text-slate-500 mb-1">
                                Pax {tier.minParticipants}–
                                {tier.maxParticipants}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] text-slate-600">
                                  Adult $
                                </span>
                                <input
                                  type="number"
                                  value={tier.adultPrice}
                                  onChange={(e) => {
                                    const nextPkgs = [...currentTour.packages];
                                    const nextTiers = [...pkg.tiers];
                                    nextTiers[tIdx] = {
                                      ...tier,
                                      adultPrice: Number(e.target.value)
                                    };
                                    nextPkgs[pIdx] = {
                                      ...pkg,
                                      tiers: nextTiers
                                    };
                                    updateCurrentTourAndDraft({
                                      ...currentTour,
                                      packages: nextPkgs
                                    });
                                  }}
                                  className="w-14 px-1.5 py-0.5 text-right font-mono text-xs border border-slate-200 rounded"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightPaneTab === "schema" && (
              <div className="p-5 max-h-[720px] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Reference Schema Alignment Report
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verifies every top-level key against your attached
                      Firestore tour sample structure.
                    </p>
                  </div>
                  <div className="text-xs font-mono font-semibold text-emerald-700 tabular-nums">
                    {schemaAudit.matchedCount} / {schemaAudit.totalCount} Keys
                    Present
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-3 font-medium">Schema Key</th>
                        <th className="py-2 px-3 font-medium">Type</th>
                        <th className="py-2 px-3 font-medium">Status</th>
                        <th className="py-2 pl-3 font-medium">
                          Current Value Preview
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {schemaAudit.results.map((row) => (
                        <tr key={row.key} className="hover:bg-slate-50">
                          <td className="py-2 pr-3 font-medium text-slate-900">
                            {row.key}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {row.type}
                          </td>
                          <td className="py-2 px-3">
                            {row.exists ? (
                              <span className="text-emerald-700 font-sans font-medium">
                                Verified
                              </span>
                            ) : (
                              <span className="text-amber-700 font-sans font-medium">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2 pl-3 text-slate-600 truncate max-w-[260px]">
                            {row.valuePreview}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
