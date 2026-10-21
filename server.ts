import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  DEFAULT_TENANT_CONFIG,
  SAMPLE_MOUNT_BATUR_TOUR,
  TenantDefaults,
  TourDocument,
  normalizeToExactTourSchema
} from "./src/types/tour.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

interface ScrapedUrlMetadata {
  originalUrl: string;
  resolvedUrl: string;
  pageTitle: string;
  metaDescription: string;
  ldJsonBlocks: string[];
  bodyExcerpt: string;
  fetchWarning?: string;
}

async function inspectUrlContent(rawUrl: string): Promise<ScrapedUrlMetadata> {
  const result: ScrapedUrlMetadata = {
    originalUrl: rawUrl,
    resolvedUrl: rawUrl,
    pageTitle: "",
    metaDescription: "",
    ldJsonBlocks: [],
    bodyExcerpt: ""
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

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
        if (cleaned.length > 10 && result.ldJsonBlocks.length < 4) {
          result.ldJsonBlocks.push(cleaned.slice(0, 5000));
        }
      }
    }

    const strippedText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    result.bodyExcerpt = strippedText.slice(0, 7000);
  } catch (err) {
    result.fetchWarning =
      err instanceof Error ? err.message : "Direct HTTP fetch skipped";
  }

  return result;
}

const TOUR_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "Compelling, clean tour title (e.g., 'Mount Agung Sunrise Trekking Private Experience')"
    },
    slug: {
      type: Type.STRING,
      description:
        "Kebab-case URL slug ending with a 4-digit code (e.g., 'bali-mount-agung-sunrise-trekking-experience-3925')"
    },
    description: {
      type: Type.STRING,
      description:
        "Evocative 4-6 sentence narrative overview written in warm, inviting travel prose matching the reference sample."
    },
    location: {
      type: Type.STRING,
      description:
        "Primary region or city name (e.g., 'Karangasem', 'Ubud', 'Kintamani', 'Nusa Penida')"
    },
    duration: {
      type: Type.STRING,
      description: "Duration range (e.g., '6-8 Hours', '10-12 Hours')"
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
      description: "Starting lowest tier price in USD (e.g., 19 or 45)"
    },
    cutOffHours: {
      type: Type.NUMBER,
      description: "Booking cut-off hours before start (e.g., 6 or 12)"
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
      description: "Approximate latitude of the destination (e.g., -8.3433)"
    },
    longitude: {
      type: Type.NUMBER,
      description: "Approximate longitude of the destination (e.g., 115.5071)"
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
        "Array of 24-hour departure times in HH:MM format (e.g., ['03:00', '03:30', '04:00'] or ['07:30', '08:00', '08:30'])"
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
        "5 to 6 chronological itinerary stops starting with 'Pick up from the hotel' and ending with 'Back to hotel'",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          pickupDescription: {
            type: Type.STRING,
            description:
              "Only for the first stop, e.g., 'Pick up from your hotel at 08:00' or 'Pick up from your hotel at 23:00'"
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
      description: "Optional add-ons like Lunch, Breakfast, Photographer",
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
    },
    faqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.post("/api/extract-tour", async (req, res) => {
    try {
      const {
        input,
        tenantDefaults = DEFAULT_TENANT_CONFIG
      }: {
        input?: string;
        tenantDefaults?: TenantDefaults;
      } = req.body || {};

      if (!input || !input.trim()) {
        return res.status(400).json({
          error:
            "Please provide an OTA URL (Viator, GetYourGuide, Klook, etc.) or a tour description prompt."
        });
      }

      const trimmedInput = input.trim();
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const detectedUrls = trimmedInput.match(urlRegex) || [];

      let scrapedContext = "";
      let groundingSummary = "";
      const groundingLinks: { uri: string; title: string }[] = [];

      if (detectedUrls.length > 0) {
        const primaryUrl = detectedUrls[0] ?? trimmedInput;
        const scraped = await inspectUrlContent(primaryUrl);

        scrapedContext = [
          `Original URL: ${scraped.originalUrl}`,
          `Resolved URL: ${scraped.resolvedUrl}`,
          scraped.pageTitle ? `Page Title: ${scraped.pageTitle}` : "",
          scraped.metaDescription
            ? `Meta Description: ${scraped.metaDescription}`
            : "",
          scraped.ldJsonBlocks.length > 0
            ? `Structured LD+JSON:\n${scraped.ldJsonBlocks.join("\n")}`
            : "",
          scraped.bodyExcerpt
            ? `Extracted Page Text:\n${scraped.bodyExcerpt}`
            : ""
        ]
          .filter(Boolean)
          .join("\n\n");

        // Also run grounded search + urlContext to enrich OTA details even when OTAs use anti-bot protection
        try {
          const researchResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Extract comprehensive tour details for this OTA tour listing URL or query:
URL: ${scraped.resolvedUrl} (Original: ${scraped.originalUrl})
User Input: ${trimmedInput}
${scraped.pageTitle ? `Detected Title: ${scraped.pageTitle}` : ""}

Provide all factual details about this specific tour:
1. Full Tour Title and Location/Region
2. Duration and Departure Time Slots
3. Complete step-by-step Itinerary from pickup to drop-off
4. Key Highlights (5+ items)
5. What is Included and Excluded
6. Package options / pricing tiers (Solo, 2-3 pax, 4-5 pax, 6-10 pax) in USD
7. Important info (what to bring, physical requirements, cancellation policy)
8. Meeting point and approximate GPS coordinates (latitude, longitude)`,
            config: {
              tools: [{ urlContext: {} }, { googleSearch: {} }]
            }
          });

          groundingSummary = researchResponse.text || "";
          const chunks =
            researchResponse.candidates?.[0]?.groundingMetadata
              ?.groundingChunks;
          if (Array.isArray(chunks)) {
            for (const c of chunks) {
              if (c.web?.uri) {
                groundingLinks.push({
                  uri: c.web.uri,
                  title: c.web.title || c.web.uri
                });
              }
            }
          }
        } catch (groundingErr) {
          console.warn("Grounding enrichment warning:", groundingErr);
        }
      }

      // Now generate the strict JSON schema matching the reference sample
      const extractionPrompt = `You are a specialist OTA Tour Data Architect. Convert the provided OTA URL data and/or user prompt into a complete, rich Tour JSON object that follows our exact Firestore tour schema.

REFERENCE STYLE & STRUCTURE RULES:
1. Tone & Copy: Write warm, evocative, sensory-rich travel copy ("Escape the usual tourist tracks...", detailed step-by-step itinerary descriptions, clear package descriptions).
2. Slug: Lowercase kebab-case ending with a 4-digit number (e.g. "bali-mount-agung-sunrise-trekking-experience-3925"). If the URL has a tour ID number (like t392586 -> 3925), use 4 digits from it.
3. InfoSections: Must have 3 sections in this exact pattern:
   - Section 1 title: " Before You Book" (note leading space, 6-8 bullet items covering minimum booking, English speaking driver, health restrictions, private/group info)
   - Section 2 title: "" (empty string title, 2 bullet items covering what to wear/bring and temperature/shoes)
   - Section 3 title: "Other Think You Have To Know" (5 bullet items covering 24h cancellation refund, weather policy, 30% deposit via bank transfer/Wise/Remitly, balance in USD/IDR cash on arrival, travel insurance)
4. Inclusions & Exclusions: End both arrays with the exact string: "Check out package details for inclusion and exclusion!"
5. Itinerary: 5 to 6 chronological steps on day 1.
   - Step 1 MUST be titled "Pick up from the hotel" with a pickupDescription (e.g. "Pick up from your hotel at 08:00" or appropriate start time).
   - Middle steps cover the core experience stops with vivid 2-3 sentence descriptions.
   - Final step MUST be titled "Back to hotel".
6. Packages: Generate 3 distinct packages ("Easy Package", "Comfy Package", "Exclusive Package") or adapt the OTA's actual packages into 3 tiers, each with 4 participant pricing tiers:
   - Tier 1: minParticipants: 1, maxParticipants: 1
   - Tier 2: minParticipants: 2, maxParticipants: 3
   - Tier 3: minParticipants: 4, maxParticipants: 5
   - Tier 4: minParticipants: 6, maxParticipants: 10

SOURCE INPUT FROM USER:
${trimmedInput}

${scrapedContext ? `SCRAPED URL METADATA:\n${scrapedContext}\n` : ""}
${groundingSummary ? `GROUNDED RESEARCH DATA:\n${groundingSummary}\n` : ""}`;

      const structuredResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: extractionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: TOUR_EXTRACTION_SCHEMA,
          temperature: 0.3
        }
      });

      const rawJsonText = structuredResponse.text?.trim() || "{}";
      const parsed = JSON.parse(rawJsonText);

      // Map itinerary steps to match exact sample structure (pickup on step 1, image on steps 2..N)
      const sampleItineraryImages = [
        "/api/uploads/9btO7cYX7Xs6sfMLiaDr",
        "/api/uploads/FQRNDs8llr6LOi49CLO7",
        "/api/uploads/ZGwpuAc3k1ej8Hc0Bzcq",
        "/api/uploads/XCCqJ3Nb54gxv7BkamCI",
        "/api/uploads/STzGeQXFLLBSZaD6NK7d"
      ];

      const formattedItinerary = Array.isArray(parsed.itinerary)
        ? parsed.itinerary.map((step: any, index: number) => {
            if (index === 0) {
              return {
                description: step.description || "",
                day: step.day || 1,
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
                sampleItineraryImages[
                  (index - 1) % sampleItineraryImages.length
                ],
              day: step.day || 1,
              title: step.title || `Experience Stop ${index}`
            };
          })
        : SAMPLE_MOUNT_BATUR_TOUR.itinerary;

      const formattedAddOns =
        Array.isArray(parsed.addOns) && parsed.addOns.length > 0
          ? parsed.addOns.map((addon: any, idx: number) => ({
              unit: addon.unit || "per person",
              description: addon.description ?? "",
              name: addon.name || `Add-On ${idx + 1}`,
              price: typeof addon.price === "number" ? addon.price : 20,
              id:
                SAMPLE_MOUNT_BATUR_TOUR.addOnIds[idx] ||
                `addon_${Math.random().toString(36).slice(2, 10)}`,
              tenantId: tenantDefaults.tenantId
            }))
          : SAMPLE_MOUNT_BATUR_TOUR.addOns.map((a) => ({
              ...a,
              tenantId: tenantDefaults.tenantId
            }));

      const locationMapUrl = buildOpenStreetMapEmbedUrl(
        parsed.latitude,
        parsed.longitude
      );

      const finalTour: TourDocument = normalizeToExactTourSchema(
        {
          title: parsed.title,
          slug: parsed.slug,
          description: parsed.description,
          location: parsed.location,
          duration: parsed.duration,
          tourDurationType: parsed.tourDurationType,
          regularPrice: parsed.regularPrice,
          discountPrice: parsed.discountPrice,
          cutOffHours: parsed.cutOffHours,
          importantInfo: parsed.importantInfo,
          meetingPoint: parsed.meetingPoint,
          locationMapUrl,
          highlights: parsed.highlights,
          inclusions: parsed.inclusions,
          exclusions: parsed.exclusions,
          timeSlots: parsed.timeSlots,
          infoSections: parsed.infoSections,
          itinerary: formattedItinerary,
          packages: parsed.packages,
          addOns: formattedAddOns,
          faqs: parsed.faqs || []
        },
        tenantDefaults
      );

      return res.json({
        tour: finalTour,
        meta: {
          detectedUrls,
          groundingLinks
        }
      });
    } catch (error: any) {
      console.error("Error in /api/extract-tour:", error);
      const status = error?.status || 500;
      const message =
        error instanceof Error
          ? error.message
          : "Failed to extract tour JSON from the provided source.";
      return res.status(status).json({
        error: message
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TourJSON Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
