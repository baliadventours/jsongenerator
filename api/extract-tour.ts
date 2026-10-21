import { GoogleGenAI, Type } from "@google/genai";

export interface FirestoreTimestamp {
  type: "firestore/timestamp/1.0";
  seconds: number;
  nanoseconds: number;
}

export interface TourInfoSection {
  content: string[];
  title: string;
}

export interface TourAddOn {
  unit: string;
  description: string;
  name: string;
  price: number;
  id: string;
  tenantId: string;
}

export interface TourItineraryStep {
  description: string;
  day: number;
  pickup?: {
    description: string;
  };
  image?: string;
  title: string;
}

export interface TourPackageTier {
  childPrice: number;
  maxParticipants: number;
  minParticipants: number;
  adultPrice: number;
}

export interface TourPackage {
  exclusions: string[];
  tiers: TourPackageTier[];
  details: string;
  inclusions: string[];
  name: string;
  transportIds: string[];
  meetingPoint: string;
  description: string;
  pickupAreas: string;
  meetingPointType: string;
}

export interface TourFaq {
  question: string;
  answer: string;
}

export interface TourDocument {
  supplierId: string;
  updatedAt: FirestoreTimestamp;
  description: string;
  tourTypeId: string;
  transportIds: string[];
  slug: string;
  title: string;
  languages: string[];
  multiDayGuides: unknown[];
  imageLabelId: string;
  gallery: string[];
  tenantId: string;
  labelIds: string[];
  location: string;
  infoSections: TourInfoSection[];
  addOnIds: string[];
  createdAt: FirestoreTimestamp;
  status: string;
  transports: unknown[];
  priceLabelId: string;
  regularPrice: number;
  cutOffHours: number;
  importantInfo: string;
  multiDayItinerary: unknown[];
  highlights: string[];
  duration: string;
  locationId: string;
  cutOffNotice: string;
  tourDurationType: string;
  addOns: TourAddOn[];
  exclusions: string[];
  slotCapacity: number;
  discountPrice: number;
  supplierName: string;
  featuredImage: string;
  belowTitleLabelId: string;
  inclusions: string[];
  categoryId: string;
  itinerary: TourItineraryStep[];
  meetingPoint: string;
  faqs: TourFaq[];
  accommodations: unknown[];
  locationMapUrl: string;
  packages: TourPackage[];
  timeSlots: string[];
  maxCapacity: number;
}

export interface TenantDefaults {
  tenantId: string;
  categoryId: string;
  locationId: string;
  imageLabelId: string;
  supplierId: string;
  supplierName: string;
  status: string;
  cutOffHours: number;
  primaryTransportId: string;
  packageTransportIds: string[];
}

const FALLBACK_TENANT_CONFIG: TenantDefaults = {
  tenantId: "tenant_demo_msl5v6gx",
  categoryId: "ea9bir7uAJwHcMrx6z3R",
  locationId: "ERfC8Ko3SaLg95j5Pqee",
  imageLabelId: "qkIW1OshbELFkG4LP2eW",
  supplierId: "",
  supplierName: "",
  status: "published",
  cutOffHours: 6,
  primaryTransportId: "3kDrMDyGCdkZC6sT7UJy",
  packageTransportIds: [
    "3kDrMDyGCdkZC6sT7UJy",
    "pZC33jBsTUFnkGM9ULmB",
    "F8XZL69cJOwYnpGhBKJ2",
    "NQzrxPd6Z9V62Hh0q8pj",
    "2FPBnZUUAkawv61xrvpZ",
    "53L8i2nW4jKULuEL2xkh",
    "6sj3Zmc7Il5XizL9Qkv6",
    "JcWE2aFc3dhKqNwGWPXj",
    "zzzwN7Ua6wjps97LpjpQ",
    "JZqqdiIEXOyH1deMyXCv",
    "AUCf2PF7GdGDTzQZoo7u"
  ]
};

const DEFAULT_GALLERY = [
  "/api/uploads/dtB02xUT6sX8ku4JHH33",
  "/api/uploads/UT29fKQZKh6sYb6zNejl",
  "/api/uploads/d69p3fdP4yxp3SahvdGw",
  "/api/uploads/FQRNDs8llr6LOi49CLO7",
  "/api/uploads/ZGwpuAc3k1ej8Hc0Bzcq",
  "/api/uploads/X5WGl62sY3nVKMzNMnQY"
];

const DEFAULT_ADDON_IDS = [
  "6jBRtjCwQSmfS94SRfMg",
  "J0BYE6VpWxtWXy5RKPF9",
  "febIYN0KXRuQD2DveVQL"
];

const SAMPLE_ITINERARY_IMAGES = [
  "/api/uploads/9btO7cYX7Xs6sfMLiaDr",
  "/api/uploads/FQRNDs8llr6LOi49CLO7",
  "/api/uploads/ZGwpuAc3k1ej8Hc0Bzcq",
  "/api/uploads/XCCqJ3Nb54gxv7BkamCI",
  "/api/uploads/STzGeQXFLLBSZaD6NK7d"
];

interface ScrapedUrlMetadata {
  originalUrl: string;
  resolvedUrl: string;
  urlSlugHint: string;
  pageTitle: string;
  metaDescription: string;
  ldJsonBlocks: string[];
  bodyExcerpt: string;
}

function extractSlugHintFromUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const segments = u.pathname
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    return segments.join(" / ").replace(/-/g, " ");
  } catch {
    return urlStr;
  }
}

async function inspectUrlContent(rawUrl: string): Promise<ScrapedUrlMetadata> {
  const result: ScrapedUrlMetadata = {
    originalUrl: rawUrl,
    resolvedUrl: rawUrl,
    urlSlugHint: extractSlugHintFromUrl(rawUrl),
    pageTitle: "",
    metaDescription: "",
    ldJsonBlocks: [],
    bodyExcerpt: ""
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(rawUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    clearTimeout(timeout);

    if (response.url) {
      result.resolvedUrl = response.url;
      result.urlSlugHint = extractSlugHintFromUrl(response.url);
    }

    const html = await response.text();
    if (!html) return result;

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch?.[1]) {
      result.pageTitle = titleMatch[1].replace(/\s+/g, " ").trim();
    }

    const descMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
      );
    if (descMatch?.[1]) {
      result.metaDescription = descMatch[1].replace(/\s+/g, " ").trim();
    }

    const ldMatches = html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    );
    for (const match of ldMatches) {
      if (match[1]) {
        const cleaned = match[1].trim();
        if (cleaned.length > 10 && result.ldJsonBlocks.length < 3) {
          result.ldJsonBlocks.push(cleaned.slice(0, 3500));
        }
      }
    }

    const strippedText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    result.bodyExcerpt = strippedText.slice(0, 4500);
  } catch {
    // Direct scrape timed out or blocked by Cloudflare; URL slug & Gemini knowledge will be used
  }

  return result;
}

const TOUR_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "Compelling, clean tour title (e.g., 'Mount Batur Jeep 4x4 Sunrise & Black Lava Private Tour')"
    },
    slug: {
      type: Type.STRING,
      description:
        "Kebab-case URL slug ending with a 4-digit code (e.g., 'bali-mount-batur-sunrise-jeep-black-lava-with-hot-springs-1486')"
    },
    description: {
      type: Type.STRING,
      description:
        "Evocative 4-6 sentence narrative overview written in warm, inviting travel prose matching the reference sample."
    },
    location: {
      type: Type.STRING,
      description:
        "Primary region or city name (e.g., 'Kintamani', 'Ubud', 'Karangasem', 'Nusa Penida')"
    },
    duration: {
      type: Type.STRING,
      description: "Duration range (e.g., '6-8 Hours', '8-10 Hours')"
    },
    tourDurationType: {
      type: Type.STRING,
      description: "Must be 'single_day' or 'multi_day'"
    },
    regularPrice: {
      type: Type.NUMBER,
      description: "Standard base price in USD (e.g., 100)"
    },
    discountPrice: {
      type: Type.NUMBER,
      description: "Starting lowest tier price in USD (e.g., 19 or 35)"
    },
    cutOffHours: {
      type: Type.NUMBER,
      description: "Booking cut-off hours before start (e.g., 6)"
    },
    importantInfo: {
      type: Type.STRING,
      description:
        "Concise 2-sentence summary of what guests should wear and bring."
    },
    meetingPoint: {
      type: Type.STRING,
      description: "Default meeting point (e.g., 'Your Hotel')"
    },
    latitude: {
      type: Type.NUMBER,
      description: "Approximate latitude of the destination (e.g., -8.2303556)"
    },
    longitude: {
      type: Type.NUMBER,
      description: "Approximate longitude of the destination (e.g., 115.3877491)"
    },
    highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 compelling bullet points of key tour highlights"
    },
    inclusions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "List of 6-7 included items, ending with 'Check out package details for inclusion and exclusion!'"
    },
    exclusions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "List of 4 excluded items, ending with 'Check out package details for inclusion and exclusion!'"
    },
    timeSlots: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Array of 24-hour departure times in HH:MM format (e.g., ['03:00', '03:30', '04:00'])"
    },
    infoSections: {
      type: Type.ARRAY,
      description:
        "3 structured info sections matching the sample (' Before You Book', '', and 'Other Think You Have To Know')",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content"]
      }
    },
    itinerary: {
      type: Type.ARRAY,
      description:
        "6 chronological itinerary stops starting with 'Pick up from the hotel' and ending with 'Back to hotel'",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          pickupDescription: {
            type: Type.STRING,
            description:
              "Only for the first stop, e.g., 'Pick up from your hotel at 03:00'"
          }
        },
        required: ["day", "title", "description"]
      }
    },
    packages: {
      type: Type.ARRAY,
      description:
        "3 tiered booking packages ('Easy Package', 'Comfy Package', 'Exclusive Package') with participant pricing tiers",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          details: { type: Type.STRING },
          inclusions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          exclusions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          meetingPoint: { type: Type.STRING },
          meetingPointType: { type: Type.STRING },
          pickupAreas: { type: Type.STRING },
          tiers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                minParticipants: { type: Type.INTEGER },
                maxParticipants: { type: Type.INTEGER },
                adultPrice: { type: Type.NUMBER },
                childPrice: { type: Type.NUMBER }
              },
              required: [
                "minParticipants",
                "maxParticipants",
                "adultPrice",
                "childPrice"
              ]
            }
          }
        },
        required: [
          "name",
          "description",
          "details",
          "inclusions",
          "exclusions",
          "meetingPoint",
          "meetingPointType",
          "pickupAreas",
          "tiers"
        ]
      }
    },
    addOns: {
      type: Type.ARRAY,
      description: "3 optional add-ons (Lunch, Breakfast, Photographer)",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["name", "price", "unit", "description"]
      }
    }
  },
  required: [
    "title",
    "slug",
    "description",
    "location",
    "duration",
    "tourDurationType",
    "regularPrice",
    "discountPrice",
    "cutOffHours",
    "importantInfo",
    "meetingPoint",
    "latitude",
    "longitude",
    "highlights",
    "inclusions",
    "exclusions",
    "timeSlots",
    "infoSections",
    "itinerary",
    "packages"
  ]
};

function buildOpenStreetMapEmbedUrl(lat: number, lng: number): string {
  const safeLat =
    typeof lat === "number" && !Number.isNaN(lat) && lat !== 0
      ? lat
      : -8.2303556;
  const safeLng =
    typeof lng === "number" && !Number.isNaN(lng) && lng !== 0
      ? lng
      : 115.3877491;
  const delta = 0.00005;
  const minLng = (safeLng - delta).toFixed(7);
  const minLat = (safeLat - delta).toFixed(7);
  const maxLng = (safeLng + delta).toFixed(7);
  const maxLat = (safeLat + delta).toFixed(7);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${safeLat.toFixed(7)},${safeLng.toFixed(7)}`;
}

async function generateStructuredTourWithFallback(
  ai: GoogleGenAI,
  prompt: string
) {
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest"];
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: TOUR_EXTRACTION_SCHEMA,
          temperature: 0.3
        }
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || "");
      // If model is not found on external deployment, try next model alias
      if (
        msg.includes("404") ||
        msg.includes("NOT_FOUND") ||
        msg.includes("not found") ||
        msg.includes("not supported")
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("Failed to generate structured tour JSON.");
}

export async function processTourExtraction(
  input: string,
  tenantDefaults: TenantDefaults = FALLBACK_TENANT_CONFIG
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. On Vercel, add GEMINI_API_KEY under Project Settings -> Environment Variables and redeploy."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });

  const trimmedInput = input.trim();
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const detectedUrls = trimmedInput.match(urlRegex) || [];

  let scrapedContext = "";

  if (detectedUrls.length > 0) {
    const primaryUrl = detectedUrls[0] ?? trimmedInput;
    const scraped = await inspectUrlContent(primaryUrl);

    scrapedContext = [
      `Original URL: ${scraped.originalUrl}`,
      `Resolved URL: ${scraped.resolvedUrl}`,
      `URL Path / Tour Keywords: ${scraped.urlSlugHint}`,
      scraped.pageTitle ? `Page Title: ${scraped.pageTitle}` : "",
      scraped.metaDescription
        ? `Meta Description: ${scraped.metaDescription}`
        : "",
      scraped.ldJsonBlocks.length > 0
        ? `Structured LD+JSON:\n${scraped.ldJsonBlocks.join("\n")}`
        : "",
      scraped.bodyExcerpt ? `Extracted Page Text:\n${scraped.bodyExcerpt}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const extractionPrompt = `You are a specialist OTA Tour Data Architect. Convert the provided OTA URL data and/or user prompt into a complete, rich Tour JSON object that follows our exact Firestore tour schema.

REFERENCE STYLE & STRUCTURE RULES:
1. Tone & Copy: Write warm, evocative, sensory-rich travel copy ("Escape the usual tourist tracks...", detailed step-by-step itinerary descriptions, clear package descriptions).
2. Slug: Lowercase kebab-case ending with a 4-digit number (e.g. "bali-mount-batur-sunrise-jeep-black-lava-with-hot-springs-1486"). If the URL has a tour ID number (like t1486033 -> 1486, or t392586 -> 3925), use 4 digits from it.
3. InfoSections: Must have 3 sections in this exact pattern:
   - Section 1 title: " Before You Book" (note leading space, 6-8 bullet items covering minimum booking, English speaking driver, health restrictions, private/group info)
   - Section 2 title: "" (empty string title, 2 bullet items covering what to wear/bring and temperature/shoes)
   - Section 3 title: "Other Think You Have To Know" (5 bullet items covering 24h cancellation refund, weather policy, 30% deposit via bank transfer/Wise/Remitly, balance in USD/IDR cash on arrival, travel insurance)
4. Inclusions & Exclusions: End both arrays with the exact string: "Check out package details for inclusion and exclusion!"
5. Itinerary: 6 chronological steps on day 1.
   - Step 1 MUST be titled "Pick up from the hotel" with a pickupDescription (e.g. "Pick up from your hotel at 03:00" or appropriate start time).
   - Middle steps cover the core experience stops with vivid 2-3 sentence descriptions.
   - Final step MUST be titled "Back to hotel".
6. Packages: Generate 3 distinct packages ("Easy Package", "Comfy Package", "Exclusive Package"), each with 4 participant pricing tiers:
   - Tier 1: minParticipants: 1, maxParticipants: 1
   - Tier 2: minParticipants: 2, maxParticipants: 3
   - Tier 3: minParticipants: 4, maxParticipants: 5
   - Tier 4: minParticipants: 6, maxParticipants: 10

SOURCE INPUT FROM USER:
${trimmedInput}

${scrapedContext ? `SCRAPED URL METADATA:\n${scrapedContext}\n` : ""}`;

  const rawJsonText = await generateStructuredTourWithFallback(
    ai,
    extractionPrompt
  );
  const parsed = JSON.parse(rawJsonText.trim() || "{}");

  const nowSeconds = Math.floor(Date.now() / 1000);
  const safeDefaults: TenantDefaults = {
    ...FALLBACK_TENANT_CONFIG,
    ...(tenantDefaults || {})
  };

  const formattedItinerary: TourItineraryStep[] = Array.isArray(
    parsed.itinerary
  )
    ? parsed.itinerary.map((step: any, index: number) => {
        if (index === 0) {
          return {
            description: step.description || "",
            day: typeof step.day === "number" ? step.day : 1,
            pickup: {
              description:
                step.pickupDescription ||
                `Pick up from your hotel at ${parsed.timeSlots?.[0] || "08:00"}`
            },
            title: step.title || "Pick up from the hotel"
          };
        }
        return {
          description: step.description || "",
          image:
            SAMPLE_ITINERARY_IMAGES[
              (index - 1) % SAMPLE_ITINERARY_IMAGES.length
            ],
          day: typeof step.day === "number" ? step.day : 1,
          title: step.title || `Stop ${index + 1}`
        };
      })
    : [];

  const formattedAddOns: TourAddOn[] =
    Array.isArray(parsed.addOns) && parsed.addOns.length > 0
      ? parsed.addOns.map((addon: any, idx: number) => ({
          unit: addon.unit || "per person",
          description: addon.description ?? "",
          name: addon.name || `Add-On ${idx + 1}`,
          price: typeof addon.price === "number" ? addon.price : 20,
          id: DEFAULT_ADDON_IDS[idx] || `addon_${idx + 1}`,
          tenantId: safeDefaults.tenantId
        }))
      : [
          {
            unit: "per person",
            description: "",
            name: "Lunch",
            price: 20,
            id: "6jBRtjCwQSmfS94SRfMg",
            tenantId: safeDefaults.tenantId
          },
          {
            tenantId: safeDefaults.tenantId,
            price: 20,
            unit: "per person",
            id: "J0BYE6VpWxtWXy5RKPF9",
            description: "",
            name: "Breakfast"
          },
          {
            description: "",
            tenantId: safeDefaults.tenantId,
            id: "febIYN0KXRuQD2DveVQL",
            unit: "per booking",
            price: 100,
            name: "Photographer"
          }
        ];

  const locationMapUrl = buildOpenStreetMapEmbedUrl(
    parsed.latitude,
    parsed.longitude
  );

  const finalTour: TourDocument = {
    supplierId: safeDefaults.supplierId || "",
    updatedAt: {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds,
      nanoseconds: 192000000
    },
    description: parsed.description || "",
    tourTypeId: "",
    transportIds: [safeDefaults.primaryTransportId],
    slug:
      parsed.slug ||
      `${(parsed.title || "bali-private-tour")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-1839`,
    title: parsed.title || "Untitled Tour Experience",
    languages: [],
    multiDayGuides: [],
    imageLabelId: safeDefaults.imageLabelId,
    gallery: DEFAULT_GALLERY,
    tenantId: safeDefaults.tenantId,
    labelIds: [safeDefaults.imageLabelId],
    location: parsed.location || "Bali",
    infoSections: Array.isArray(parsed.infoSections)
      ? parsed.infoSections.map((sec: any) => ({
          content: Array.isArray(sec.content) ? sec.content : [],
          title: sec.title ?? ""
        }))
      : [],
    addOnIds: DEFAULT_ADDON_IDS,
    createdAt: {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds - 3600,
      nanoseconds: 562000000
    },
    status: safeDefaults.status || "published",
    transports: [],
    priceLabelId: "",
    regularPrice:
      typeof parsed.regularPrice === "number" ? parsed.regularPrice : 100,
    cutOffHours:
      typeof parsed.cutOffHours === "number"
        ? parsed.cutOffHours
        : safeDefaults.cutOffHours,
    importantInfo: parsed.importantInfo || "",
    multiDayItinerary: [],
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    duration: parsed.duration || "6-8 Hours",
    locationId: safeDefaults.locationId,
    cutOffNotice: "",
    tourDurationType: parsed.tourDurationType || "single_day",
    addOns: formattedAddOns,
    exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions : [],
    slotCapacity: 0,
    discountPrice:
      typeof parsed.discountPrice === "number" ? parsed.discountPrice : 19,
    supplierName: safeDefaults.supplierName || "",
    featuredImage: "/api/uploads/FQRNDs8llr6LOi49CLO7",
    belowTitleLabelId: "",
    inclusions: Array.isArray(parsed.inclusions) ? parsed.inclusions : [],
    categoryId: safeDefaults.categoryId,
    itinerary: formattedItinerary,
    meetingPoint: parsed.meetingPoint || "Your Hotel",
    faqs: [],
    accommodations: [],
    locationMapUrl,
    packages: Array.isArray(parsed.packages)
      ? parsed.packages.map((pkg: any, idx: number) => ({
          exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
          tiers: Array.isArray(pkg.tiers)
            ? pkg.tiers.map((t: any) => ({
                childPrice: Number(t.childPrice ?? 19),
                maxParticipants: Number(t.maxParticipants ?? 1),
                minParticipants: Number(t.minParticipants ?? 1),
                adultPrice: Number(t.adultPrice ?? 50)
              }))
            : [],
          details: pkg.details || pkg.description || "",
          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
          name: pkg.name || `Package ${idx + 1}`,
          transportIds: safeDefaults.packageTransportIds,
          meetingPoint:
            pkg.meetingPoint ||
            "Toya Devasya\nhttps://maps.app.goo.gl/uU8hcZVc417nfjUp9",
          description: pkg.description || pkg.details || "",
          pickupAreas:
            pkg.pickupAreas || "Most area are covered for pick up and drop off",
          meetingPointType: pkg.meetingPointType || "Meeting Point"
        }))
      : [],
    timeSlots: Array.isArray(parsed.timeSlots)
      ? parsed.timeSlots
      : ["03:00", "03:30", "04:00"],
    maxCapacity: 0
  };

  return {
    tour: finalTour,
    meta: {
      detectedUrls,
      groundingLinks: []
    }
  };
}

// Default export for Vercel Serverless Functions (/api/extract-tour)
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed. Use POST." });
    return;
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { input, tenantDefaults = FALLBACK_TENANT_CONFIG } = body;

    if (!input || !String(input).trim()) {
      res.status(400).json({
        error:
          "Please provide an OTA URL (Viator, GetYourGuide, Klook, etc.) or a tour description prompt."
      });
      return;
    }

    const result = await processTourExtraction(String(input), tenantDefaults);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in /api/extract-tour:", error);
    const status =
      typeof error?.status === "number" &&
      error.status >= 400 &&
      error.status < 600
        ? error.status
        : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Failed to extract tour JSON from the provided source.";
    res.status(status).json({ error: message });
  }
}
