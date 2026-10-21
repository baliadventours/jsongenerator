import { GoogleGenAI, Type } from "@google/genai";

export interface FirestoreTimestamp {
  type: "firestore/timestamp/1.0";
  seconds: number;
  nanoseconds: number;
}

export interface TourInfoSection {
  title: string;
  content: string[];
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
  title: string;
  day: number;
  pickup?: {
    description: string;
  };
  image?: string;
}

export interface TourPackageTier {
  childPrice: number;
  adultPrice: number;
  maxParticipants: number;
  minParticipants: number;
}

export interface TourPackage {
  meetingPoint: string;
  exclusions: string[];
  transportIds: string[];
  name: string;
  pickupAreas: string;
  meetingPointType: string;
  tiers: TourPackageTier[];
  details: string;
  description: string;
  inclusions: string[];
}

export interface TourFaq {
  question: string;
  answer: string;
}

export interface TourDocument {
  title: string;
  duration: string;
  gallery: string[];
  infoSections: TourInfoSection[];
  description: string;
  imageLabelId: string;
  highlights: string[];
  priceLabelId: string;
  supplierName: string;
  status: string;
  multiDayGuides: unknown[];
  exclusions: string[];
  supplierId: string;
  transports: unknown[];
  featuredImage: string;
  labelIds: string[];
  cutOffHours: number;
  regularPrice: number;
  languages: string[];
  discountPrice: number;
  addOnIds: string[];
  faqs: TourFaq[];
  tourTypeId: string;
  itinerary: TourItineraryStep[];
  createdAt: FirestoreTimestamp;
  belowTitleLabelId: string;
  slug: string;
  timeSlots: string[];
  cutOffNotice: string;
  multiDayItinerary: unknown[];
  transportIds: string[];
  tourDurationType: string;
  accommodations: unknown[];
  maxCapacity: number;
  updatedAt: FirestoreTimestamp;
  location: string;
  categoryId: string;
  locationMapUrl: string;
  tenantId: string;
  meetingPoint: string;
  importantInfo: string;
  addOns: TourAddOn[];
  packages: TourPackage[];
  inclusions: string[];
  slotCapacity: number;
  locationId: string;
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
  includeSourceImages?: boolean;
}

const FALLBACK_TENANT_CONFIG: TenantDefaults = {
  tenantId: "tenant_explorebalitours_mv3ucul5",
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
  ],
  includeSourceImages: true
};

const DEFAULT_ADDON_IDS = [
  "6jBRtjCwQSmfS94SRfMg",
  "J0BYE6VpWxtWXy5RKPF9",
  "febIYN0KXRuQD2DveVQL"
];

interface ScrapedUrlMetadata {
  originalUrl: string;
  resolvedUrl: string;
  urlSlugHint: string;
  pageTitle: string;
  metaDescription: string;
  ldJsonBlocks: string[];
  bodyExcerpt: string;
  extractedImages: string[];
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

function isLikelyTourPhotoUrl(rawUrl: string): boolean {
  if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) return false;
  const lower = rawUrl.toLowerCase();
  // Exclude icons, logos, flags, avatars, tracking pixels, and SVGs
  if (
    lower.endsWith(".svg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".ico") ||
    lower.includes("logo") ||
    lower.includes("avatar") ||
    lower.includes("favicon") ||
    lower.includes("sprite") ||
    lower.includes("icon") ||
    lower.includes("flag") ||
    lower.includes("badge") ||
    lower.includes("payment") ||
    lower.includes("1x1") ||
    lower.includes("pixel")
  ) {
    return false;
  }
  return (
    lower.includes("cdn.getyourguide.com/img/tour") ||
    lower.includes("cdn.getyourguide.com/img/location") ||
    lower.includes("res.klook.com/images/") ||
    lower.includes("res.klook.com/image/upload") ||
    lower.includes("media.tacdn.com/media/attractions") ||
    lower.includes("dynamic-media-cdn.tripadvisor.com") ||
    /\.(jpe?g|png|webp)(\?.*)?$/i.test(lower)
  );
}

function collectImagesFromJsonNode(node: any, out: Set<string>) {
  if (!node || out.size >= 16) return;
  if (typeof node === "string") {
    if (isLikelyTourPhotoUrl(node)) {
      out.add(node);
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectImagesFromJsonNode(item, out);
    }
    return;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const keyLower = k.toLowerCase();
      if (
        keyLower.includes("image") ||
        keyLower.includes("photo") ||
        keyLower === "contenturl" ||
        keyLower === "thumbnailurl"
      ) {
        collectImagesFromJsonNode(v, out);
      } else if (typeof v === "object") {
        collectImagesFromJsonNode(v, out);
      }
    }
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
    bodyExcerpt: "",
    extractedImages: []
  };

  const imageSet = new Set<string>();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

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
    if (html) {
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

      // 1. Extract og:image & twitter:image meta tags
      const metaImageMatches = html.matchAll(
        /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi
      );
      for (const m of metaImageMatches) {
        if (m[1] && isLikelyTourPhotoUrl(m[1])) {
          imageSet.add(m[1].replace(/&amp;/g, "&"));
        }
      }
      const reverseMetaImageMatches = html.matchAll(
        /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi
      );
      for (const m of reverseMetaImageMatches) {
        if (m[1] && isLikelyTourPhotoUrl(m[1])) {
          imageSet.add(m[1].replace(/&amp;/g, "&"));
        }
      }

      // 2. Extract images from LD+JSON blocks
      const ldMatches = html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      for (const match of ldMatches) {
        if (match[1]) {
          const cleaned = match[1].trim();
          if (cleaned.length > 10 && result.ldJsonBlocks.length < 3) {
            result.ldJsonBlocks.push(cleaned.slice(0, 3500));
          }
          try {
            const parsedLd = JSON.parse(cleaned);
            collectImagesFromJsonNode(parsedLd, imageSet);
          } catch {
            // Ignore malformed JSON-LD
          }
        }
      }

      // 3. Extract direct OTA CDN tour photo URLs embedded in HTML / SSR state
      const otaCdnMatches = html.matchAll(
        /https?:\/\/(?:cdn\.getyourguide\.com\/img\/tour|res\.klook\.com\/images|res\.klook\.com\/image\/upload|media\.tacdn\.com\/media\/attractions)[^\s"'<>\\]+/gi
      );
      for (const m of otaCdnMatches) {
        if (m[0] && imageSet.size < 14) {
          const cleanUrl = m[0].replace(/&amp;/g, "&");
          if (isLikelyTourPhotoUrl(cleanUrl)) {
            imageSet.add(cleanUrl);
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
    }
  } catch {
    // Direct fetch blocked or timed out
  }

  // 4. If direct fetch was blocked by anti-bot protection and found 0 images, query Microlink metadata API (fast 2.2s timeout)
  if (imageSet.size === 0) {
    try {
      const mlController = new AbortController();
      const mlTimeout = setTimeout(() => mlController.abort(), 2200);
      const mlRes = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(result.resolvedUrl)}`,
        { signal: mlController.signal }
      );
      clearTimeout(mlTimeout);
      if (mlRes.ok) {
        const mlData: any = await mlRes.json();
        const imgUrl = mlData?.data?.image?.url;
        if (imgUrl && typeof imgUrl === "string" && /^https?:\/\//i.test(imgUrl)) {
          imageSet.add(imgUrl);
        }
        if (!result.pageTitle && mlData?.data?.title) {
          result.pageTitle = mlData.data.title;
        }
        if (!result.metaDescription && mlData?.data?.description) {
          result.metaDescription = mlData.data.description;
        }
      }
    } catch {
      // Ignore Microlink fallback timeout
    }
  }

  result.extractedImages = Array.from(imageSet).slice(0, 12);
  return result;
}

const TOUR_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "Compelling, clean tour title (e.g., 'Mount Batur Sunrise 4WD Jeep, Black Lava & Natural Hot Spring Tour')"
    },
    slug: {
      type: Type.STRING,
      description:
        "Kebab-case URL slug ending with two 4-digit numbers (e.g., 'bali-mount-batur-sunrise-jeep-black-lava-with-hot-springs-1486-1920')"
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
      description: "Duration range (e.g., '8-10 Hours', '6-8 Hours')"
    },
    tourDurationType: {
      type: Type.STRING,
      description: "Must be 'single_day' or 'multi_day'"
    },
    regularPrice: {
      type: Type.NUMBER,
      description: "Standard base price in USD (e.g., 85)"
    },
    discountPrice: {
      type: Type.NUMBER,
      description: "Starting lowest tier price in USD (e.g., 32)"
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
      description: "Default meeting point (e.g., 'Your Hotel Lobby in Bali')"
    },
    latitude: {
      type: Type.NUMBER,
      description: "Approximate latitude of the destination (e.g., -8.2425556)"
    },
    longitude: {
      type: Type.NUMBER,
      description: "Approximate longitude of the destination (e.g., 115.3789491)"
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
        "Array of 24-hour departure times in HH:MM format (e.g., ['02:30', '03:00', '03:30'])"
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
          description: {
            type: Type.STRING,
            description: "1-sentence positioning summary of the package"
          },
          details: {
            type: Type.STRING,
            description: "1-sentence specific summary of what the package includes"
          },
          inclusions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          exclusions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "List of 3-4 exclusions ending with 'Check out package details for inclusion and exclusion!'"
          },
          meetingPoint: {
            type: Type.STRING,
            description: "Use 'Hotel Lobby'"
          },
          meetingPointType: {
            type: Type.STRING,
            description: "Use 'pickup'"
          },
          pickupAreas: {
            type: Type.STRING,
            description:
              "e.g. 'Ubud, Sanur, Kuta, Seminyak, Canggu, Nusa Dua, Jimbaran'"
          },
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
      : -8.2425556;
  const safeLng =
    typeof lng === "number" && !Number.isNaN(lng) && lng !== 0
      ? lng
      : 115.3789491;
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
  let extractedImages: string[] = [];

  if (detectedUrls.length > 0) {
    const primaryUrl = detectedUrls[0] ?? trimmedInput;
    const scraped = await inspectUrlContent(primaryUrl);
    extractedImages = scraped.extractedImages;

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
1. Tone & Copy: Write warm, evocative, sensory-rich travel copy ("Escape the predawn chill...", detailed step-by-step itinerary descriptions, clear package descriptions).
2. Slug: Lowercase kebab-case ending with two 4-digit numbers (e.g. "bali-mount-batur-sunrise-jeep-black-lava-with-hot-springs-1486-1920").
3. InfoSections: Must have 3 sections in this exact pattern:
   - Section 1 title: " Before You Book" (note leading space, 6 bullet items covering minimum booking of 1 participant, private hotel pick-up across Kuta/Seminyak/Legian/Canggu/Sanur/Ubud/Nusa Dua/Jimbaran, English-speaking private driver greeting in hotel lobby, health/pregnancy notices, elevation/temperature notes, and child seats)
   - Section 2 title: "" (empty string title, 2 bullet items: "What to bring: ..." and "Weather notice: ...")
   - Section 3 title: "Other Think You Have To Know" (5 bullet items covering 100% refund 24h prior, inclement weather policy, 30% deposit via bank transfer/Wise/Remitly, balance in USD or IDR cash upon pick-up, and comprehensive travel accident insurance)
4. Inclusions & Exclusions: End both top-level arrays AND each package's exclusions array with the exact string: "Check out package details for inclusion and exclusion!"
5. Itinerary: 6 chronological steps on day 1.
   - Step 1 MUST be titled "Pick up from the hotel" with a pickupDescription (e.g. "Pick up from your hotel at 03:00" or appropriate start time).
   - Middle steps cover the core experience stops with vivid 2-3 sentence descriptions.
   - Final step MUST be titled "Back to hotel".
6. Packages: Generate 3 distinct packages ("Easy Package", "Comfy Package", "Exclusive Package"):
   - meetingPoint: "Hotel Lobby"
   - meetingPointType: "pickup"
   - pickupAreas: "Ubud, Sanur, Kuta, Seminyak, Canggu, Nusa Dua, Jimbaran" (and add ", Uluwatu" on Exclusive Package)
   - 4 participant pricing tiers:
     * Tier 1: minParticipants: 1, maxParticipants: 1
     * Tier 2: minParticipants: 2, maxParticipants: 3
     * Tier 3: minParticipants: 4, maxParticipants: 5
     * Tier 4: minParticipants: 6, maxParticipants: 10

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

  const shouldPopulateImages =
    safeDefaults.includeSourceImages !== false && extractedImages.length > 0;

  const formattedItinerary: TourItineraryStep[] = Array.isArray(
    parsed.itinerary
  )
    ? parsed.itinerary.map((step: any, index: number) => {
        if (index === 0) {
          return {
            description: step.description || "",
            title: step.title || "Pick up from the hotel",
            day: typeof step.day === "number" ? step.day : 1,
            pickup: {
              description:
                step.pickupDescription ||
                `Pick up from your hotel at ${parsed.timeSlots?.[0] || "03:00"}`
            }
          };
        }
        const assignedImage = shouldPopulateImages
          ? extractedImages[(index - 1) % extractedImages.length] || ""
          : "";
        return {
          image: assignedImage,
          title: step.title || `Stop ${index + 1}`,
          description: step.description || "",
          day: typeof step.day === "number" ? step.day : 1
        };
      })
    : [];

  const locationMapUrl = buildOpenStreetMapEmbedUrl(
    parsed.latitude,
    parsed.longitude
  );

  // Exact top-level key order matching jsonfiles_f96e158d.json
  const finalTour: TourDocument = {
    title: parsed.title || "Untitled Tour Experience",
    duration: parsed.duration || "8-10 Hours",
    gallery: shouldPopulateImages ? extractedImages : [],
    infoSections: Array.isArray(parsed.infoSections)
      ? parsed.infoSections.map((sec: any) => ({
          title: sec.title ?? "",
          content: Array.isArray(sec.content) ? sec.content : []
        }))
      : [],
    description: parsed.description || "",
    imageLabelId: safeDefaults.imageLabelId,
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    priceLabelId: "",
    supplierName: safeDefaults.supplierName || "",
    status: safeDefaults.status || "published",
    multiDayGuides: [],
    exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions : [],
    supplierId: safeDefaults.supplierId || "",
    transports: [],
    featuredImage: shouldPopulateImages ? extractedImages[0] || "" : "",
    labelIds: [safeDefaults.imageLabelId],
    cutOffHours:
      typeof parsed.cutOffHours === "number"
        ? parsed.cutOffHours
        : safeDefaults.cutOffHours,
    regularPrice:
      typeof parsed.regularPrice === "number" ? parsed.regularPrice : 85,
    languages: [],
    discountPrice:
      typeof parsed.discountPrice === "number" ? parsed.discountPrice : 32,
    addOnIds: DEFAULT_ADDON_IDS,
    faqs: [],
    tourTypeId: "",
    itinerary: formattedItinerary,
    createdAt: {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds - 355,
      nanoseconds: 349000000
    },
    belowTitleLabelId: "",
    slug:
      parsed.slug ||
      `${(parsed.title || "bali-private-tour")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-1486-1920`,
    timeSlots: Array.isArray(parsed.timeSlots)
      ? parsed.timeSlots
      : ["02:30", "03:00", "03:30"],
    cutOffNotice: "",
    multiDayItinerary: [],
    transportIds: [safeDefaults.primaryTransportId],
    tourDurationType: parsed.tourDurationType || "single_day",
    accommodations: [],
    maxCapacity: 0,
    updatedAt: {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds,
      nanoseconds: 155000000
    },
    location: parsed.location || "Kintamani",
    categoryId: safeDefaults.categoryId,
    locationMapUrl,
    tenantId: safeDefaults.tenantId,
    meetingPoint: parsed.meetingPoint || "Your Hotel Lobby in Bali",
    importantInfo: parsed.importantInfo || "",
    addOns: [],
    packages: Array.isArray(parsed.packages)
      ? parsed.packages.map((pkg: any, idx: number) => {
          const rawExclusions: string[] = Array.isArray(pkg.exclusions)
            ? pkg.exclusions
            : [];
          const exclusionsWithFooter = rawExclusions.some((e) =>
            String(e).toLowerCase().includes("check out package details")
          )
            ? rawExclusions
            : [
                ...rawExclusions,
                "Check out package details for inclusion and exclusion!"
              ];

          return {
            meetingPoint: pkg.meetingPoint || "Hotel Lobby",
            exclusions: exclusionsWithFooter,
            transportIds: safeDefaults.packageTransportIds,
            name: pkg.name || `Package ${idx + 1}`,
            pickupAreas:
              pkg.pickupAreas ||
              (idx === 2
                ? "Ubud, Sanur, Kuta, Seminyak, Canggu, Nusa Dua, Jimbaran, Uluwatu"
                : "Ubud, Sanur, Kuta, Seminyak, Canggu, Nusa Dua, Jimbaran"),
            meetingPointType: pkg.meetingPointType || "pickup",
            tiers: Array.isArray(pkg.tiers)
              ? pkg.tiers.map((t: any) => ({
                  childPrice: Number(t.childPrice ?? 25),
                  adultPrice: Number(t.adultPrice ?? 50),
                  maxParticipants: Number(t.maxParticipants ?? 1),
                  minParticipants: Number(t.minParticipants ?? 1)
                }))
              : [],
            details: pkg.details || pkg.description || "",
            description: pkg.description || pkg.details || "",
            inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : []
          };
        })
      : [],
    inclusions: Array.isArray(parsed.inclusions) ? parsed.inclusions : [],
    slotCapacity: 0,
    locationId: safeDefaults.locationId
  };

  return {
    tour: finalTour,
    meta: {
      detectedUrls,
      extractedImages,
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
