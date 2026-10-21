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

export const DEFAULT_TENANT_CONFIG: TenantDefaults = {
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

export const SAMPLE_MOUNT_BATUR_TOUR: TourDocument = {
  supplierId: "",
  updatedAt: {
    type: "firestore/timestamp/1.0",
    seconds: 1792340987,
    nanoseconds: 192000000
  },
  description:
    "Escape the usual tourist tracks and come wander with us through the beating heart of Bali. We will take you deep into Ubud's emerald valleys, where the air smells of wild ginger and fresh morning dew. You will feel the cool mist of a secluded waterfall on your skin, walk the ancient stone paths of sacred water temples, and look out over rice terraces that look like giant green steps climbing to the heavens. This isn't just a sightseeing trip; it is an invitation to slow down, breathe deeply, and connect with the gentle soul of our island. Let us show you the Bali we know and love.",
  tourTypeId: "",
  transportIds: ["3kDrMDyGCdkZC6sT7UJy"],
  slug: "mount-batur-sunrise-gold-black-lava-4x4-jeep-adventure-1839",
  title: "Mount Batur Jeep 4x4 Sunrise Private Tour",
  languages: [],
  multiDayGuides: [],
  imageLabelId: "qkIW1OshbELFkG4LP2eW",
  gallery: [
    "/api/uploads/dtB02xUT6sX8ku4JHH33",
    "/api/uploads/UT29fKQZKh6sYb6zNejl",
    "/api/uploads/d69p3fdP4yxp3SahvdGw",
    "/api/uploads/FQRNDs8llr6LOi49CLO7",
    "/api/uploads/ZGwpuAc3k1ej8Hc0Bzcq",
    "/api/uploads/X5WGl62sY3nVKMzNMnQY"
  ],
  tenantId: "tenant_demo_msl5v6gx",
  labelIds: ["qkIW1OshbELFkG4LP2eW"],
  location: "Ubud",
  infoSections: [
    {
      content: [
        "Minimum booking: 2 person",
        "The tour will assist by English speaking Bali driver",
        "Not recommended for travelers with back problems",
        "Not recommended for pregnant travelers",
        "Most travelers can participate",
        "Not wheelchair accessible",
        "Itineraries are subject to change due to external factors such as weather conditions, traffic conditions, and other unpredictable circumstances.",
        "This is a private tour/activity. Only your group will participate"
      ],
      title: " Before You Book"
    },
    {
      title: "",
      content: [
        "Please bring a warm jacket or sweater, as temperatures on the mountain can drop significantly before sunrise (around 14-18 degrees Celsius). ",
        "Wear comfortable closed-toe shoes and don't forget your camera!"
      ]
    },
    {
      content: [
        "For a full refund, you must cancel at least 24 hours before the experience’s start time.",
        "Tour May be cancel due to extreme weather condition with full refund",
        "Deposit 30% is required to secure the booking. Deposit payment can be done by bank transfer, Remitly, Wise and Western union.",
        "The rest you can pay upon arrival in Bali by cash USD or IDR . Or the remainder can be paid by online transfer no later than 7 days before arrival",
        "Travel insurance is highly recommended for all participants ."
      ],
      title: "Other Think You Have To Know"
    }
  ],
  addOnIds: [
    "6jBRtjCwQSmfS94SRfMg",
    "J0BYE6VpWxtWXy5RKPF9",
    "febIYN0KXRuQD2DveVQL"
  ],
  createdAt: {
    type: "firestore/timestamp/1.0",
    seconds: 1786241437,
    nanoseconds: 562000000
  },
  status: "published",
  transports: [],
  priceLabelId: "",
  regularPrice: 100,
  cutOffHours: 6,
  importantInfo:
    "Please wear comfortable walking shoes suitable for wet stairs. Bring a swimsuit and a change of clothes if you wish to bathe at the waterfall or participate in the holy spring ritual.",
  multiDayItinerary: [],
  highlights: [
    "Stand in awe before the hidden, jungle-framed Tibumana Waterfall",
    "Participate in or witness a traditional purification ritual at Tirta Empul",
    "Wander through the iconic, undulating green slopes of Tegallalang Rice Terraces",
    "Savor an authentic Balinese lunch overlooking the breathtaking jungle ravines",
    "Enjoy the comfort of your own private luxury vehicle and local storyteller guide"
  ],
  duration: "6-8 Hours",
  locationId: "ERfC8Ko3SaLg95j5Pqee",
  cutOffNotice: "",
  tourDurationType: "single_day",
  addOns: [
    {
      unit: "per person",
      description: "",
      name: "Lunch",
      price: 20,
      id: "6jBRtjCwQSmfS94SRfMg",
      tenantId: "tenant_demo_msl5v6gx"
    },
    {
      tenantId: "tenant_demo_msl5v6gx",
      price: 20,
      unit: "per person",
      id: "J0BYE6VpWxtWXy5RKPF9",
      description: "",
      name: "Breakfast"
    },
    {
      description: "",
      tenantId: "tenant_demo_msl5v6gx",
      id: "febIYN0KXRuQD2DveVQL",
      unit: "per booking",
      price: 100,
      name: "Photographer"
    }
  ],
  exclusions: [
    "Lunch and personal beverages",
    "Gratuities for your guide and driver",
    "Personal souvenir shopping",
    "Check out package details for inclusion and exclusion!"
  ],
  slotCapacity: 0,
  discountPrice: 19,
  supplierName: "",
  featuredImage: "/api/uploads/FQRNDs8llr6LOi49CLO7",
  belowTitleLabelId: "",
  inclusions: [
    "Private hotel pick-up and drop-off in an air-conditioned car",
    "Professional English-speaking driver and Jeep pilot",
    "Private 4x4 Jeep for the volcano expedition",
    "All entrance fees and Kintamani area tickets",
    "Admission to Batur Natural Hot Spring",
    "Light breakfast and bottled mineral water",
    "Check out package details for inclusion and exclusion!"
  ],
  categoryId: "ea9bir7uAJwHcMrx6z3R",
  itinerary: [
    {
      description:
        "Your adventure begins under a blanket of stars. Our friendly driver will meet you right at your hotel lobby in a cozy, private vehicle. As you settle in for a peaceful drive through the quiet Balinese countryside, you can catch up on some sleep before the magic starts.",
      day: 1,
      pickup: {
        description: "Pick up from your hotel at 08:00"
      },
      title: "Pick up from the hotel"
    },
    {
      description:
        "As the air grows crisp and cool, we arrive at our mountain base camp. Here, you'll meet your expert local 4x4 driver and hop into your rugged, custom-built jeep. Feel the anticipation build as we fire up the engine.",
      image: "/api/uploads/9btO7cYX7Xs6sfMLiaDr",
      day: 1,
      title: "Arrival at Mount Batur Base Camp"
    },
    {
      image: "/api/uploads/FQRNDs8llr6LOi49CLO7",
      title: "Off-Road Ascent & Sunrise Spectacle",
      description:
        "We rumble up the volcano’s slopes, navigating the bumpy, unpaved paths in the dark. Arriving at our prime viewpoint, we’ll pour you a steaming cup of Balinese coffee or tea. Watch in awe as the sun slowly peaks over the horizon, lighting up Mount Agung, the caldera lake, and the misty valleys below.",
      day: 1
    },
    {
      title: "Exploring the Lunar Black Lava Fields",
      day: 1,
      description:
        "After sunrise, we drive down into the dramatic caldera to explore the vast black lava fields left by the historic 1963 eruption. The contrasts of black basalt rock against the morning sky look like another planet—perfect for incredible photos.",
      image: "/api/uploads/ZGwpuAc3k1ej8Hc0Bzcq"
    },
    {
      description:
        "On our way back down, we can customize your morning. Choose to soak your muscles in the mineral-rich geothermal waters of a lakeside hot spring, or stop by a local plantation to taste freshly brewed Balinese coffee and herbal teas.",
      day: 1,
      image: "/api/uploads/XCCqJ3Nb54gxv7BkamCI",
      title: "Optional Coffee Plantation or Hot Spring Visit"
    },
    {
      image: "/api/uploads/STzGeQXFLLBSZaD6NK7d",
      day: 1,
      title: "Back to hotel",
      description:
        "With hearts full and cameras packed with spectacular memories, we tuck you back into our comfortable private car. Relax and reflect on your magical volcanic adventure as we drive you safely back to your hotel door."
    }
  ],
  meetingPoint: "Your Hotel",
  faqs: [],
  accommodations: [],
  locationMapUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=115.3876991,-8.2304056,115.3877991,-8.2303056&layer=mapnik&marker=-8.2303556,115.3877491",
  packages: [
    {
      exclusions: [
        "Lunch",
        "Photographer",
        "Personal shopping",
        "Travel Insurance",
        "Tips & Gratuities"
      ],
      tiers: [
        {
          childPrice: 50,
          maxParticipants: 1,
          minParticipants: 1,
          adultPrice: 50
        },
        {
          maxParticipants: 3,
          childPrice: 19,
          adultPrice: 25,
          minParticipants: 2
        },
        {
          childPrice: 19,
          maxParticipants: 5,
          minParticipants: 4,
          adultPrice: 20
        },
        {
          minParticipants: 6,
          childPrice: 19,
          adultPrice: 19,
          maxParticipants: 10
        }
      ],
      details:
        "Perfect for travelers who want a seamless, hassle-free itinerary without the guesswork. This package takes care of all logistical essentials—from comfortable, air-conditioned transfers and expert local guidance to pre-arranged admission tickets for Bali’s top attractions. It’s an ideal, straightforward choice for independent explorers who prefer to handle their own dining preferences along the way.",
      inclusions: [
        "AC transport",
        "Tour guide",
        "Entrance tickets",
        "Bottled water"
      ],
      name: "Easy Package",
      transportIds: [
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
      meetingPoint: "Toya Devasya\nhttps://maps.app.goo.gl/uU8hcZVc417nfjUp9",
      description:
        "Perfect for travelers who want a seamless, hassle-free itinerary without the guesswork. This package takes care of all logistical essentials—from comfortable, air-conditioned transfers and expert local guidance to pre-arranged admission tickets for Bali’s top attractions. It’s an ideal, straightforward choice for independent explorers who prefer to handle their own dining preferences along the way.",
      pickupAreas: "Most area are covered for pick up and drop off",
      meetingPointType: "Meeting Point"
    },
    {
      transportIds: [
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
      details:
        "Designed for a completely worry-free day out, this upgraded package bundles all the essentials of the Easy tier with authentic culinary experiences. Enjoy guided sightseeing paired with handpicked local dining or scenic meal stops, allowing you to relax, savor traditional flavors, and immerse yourself fully in the culture without having to worry about where to eat next.",
      meetingPoint: "Toya Devasya\nhttps://maps.app.goo.gl/uU8hcZVc417nfjUp9",
      tiers: [
        {
          childPrice: 90,
          minParticipants: 1,
          maxParticipants: 1,
          adultPrice: 100
        },
        {
          adultPrice: 60,
          minParticipants: 2,
          maxParticipants: 3,
          childPrice: 40
        },
        {
          childPrice: 40,
          maxParticipants: 5,
          minParticipants: 4,
          adultPrice: 50
        },
        {
          childPrice: 40,
          maxParticipants: 10,
          minParticipants: 6,
          adultPrice: 40
        }
      ],
      name: "Comfy Package",
      exclusions: [
        "Photographer",
        "Personal shopping",
        "Travel Insurance",
        "Tips & Gratuities"
      ],
      meetingPointType: "Meeting Point",
      description:
        "Designed for a completely worry-free day out, this upgraded package bundles all the essentials of the Easy tier with authentic culinary experiences. Enjoy guided sightseeing paired with handpicked local dining or scenic meal stops, allowing you to relax, savor traditional flavors, and immerse yourself fully in the culture without having to worry about where to eat next.",
      pickupAreas: "Most area are covered for pick up and drop off",
      inclusions: [
        "AC transport",
        "Tour guide",
        "Entrance tickets",
        "Bottled water",
        "Lunch"
      ]
    },
    {
      exclusions: [
        "Personal shopping",
        "Travel Insurance",
        "Tips & Gratuities"
      ],
      name: "Exclusive Package",
      tiers: [
        {
          childPrice: 90,
          minParticipants: 1,
          maxParticipants: 1,
          adultPrice: 150
        },
        {
          minParticipants: 2,
          adultPrice: 80,
          childPrice: 40,
          maxParticipants: 3
        },
        {
          minParticipants: 4,
          childPrice: 40,
          adultPrice: 60,
          maxParticipants: 5
        },
        {
          maxParticipants: 10,
          adultPrice: 50,
          minParticipants: 6,
          childPrice: 40
        }
      ],
      inclusions: [
        "AC transport",
        "Tour guide",
        "Entrance tickets",
        "Bottled water",
        "Lunch",
        "Photographer"
      ],
      meetingPoint: "Toya Devasya\nhttps://maps.app.goo.gl/uU8hcZVc417nfjUp9",
      transportIds: [
        "3kDrMDyGCdkZC6sT7UJy",
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
      details:
        "The ultimate premium experience tailored for those who want absolute peace of mind and unforgettable memories. Alongside full VIP inclusions, dining, and comprehensive travel insurance, this package features a dedicated professional photographer to capture your best moments against Bali's stunning backdrops. It is the ultimate all-inclusive choice for couples, families, and special occasions.",
      description:
        "The ultimate premium experience tailored for those who want absolute peace of mind and unforgettable memories. Alongside full VIP inclusions, dining, and comprehensive travel insurance, this package features a dedicated professional photographer to capture your best moments against Bali's stunning backdrops. It is the ultimate all-inclusive choice for couples, families, and special occasions.",
      pickupAreas: "Most area are covered for pick up and drop off",
      meetingPointType: "Meeting Point"
    }
  ],
  timeSlots: ["03:00", "03:30", "04:00"],
  maxCapacity: 0
};

export const REQUIRED_SCHEMA_KEYS: (keyof TourDocument)[] = [
  "supplierId",
  "updatedAt",
  "description",
  "tourTypeId",
  "transportIds",
  "slug",
  "title",
  "languages",
  "multiDayGuides",
  "imageLabelId",
  "gallery",
  "tenantId",
  "labelIds",
  "location",
  "infoSections",
  "addOnIds",
  "createdAt",
  "status",
  "transports",
  "priceLabelId",
  "regularPrice",
  "cutOffHours",
  "importantInfo",
  "multiDayItinerary",
  "highlights",
  "duration",
  "locationId",
  "cutOffNotice",
  "tourDurationType",
  "addOns",
  "exclusions",
  "slotCapacity",
  "discountPrice",
  "supplierName",
  "featuredImage",
  "belowTitleLabelId",
  "inclusions",
  "categoryId",
  "itinerary",
  "meetingPoint",
  "faqs",
  "accommodations",
  "locationMapUrl",
  "packages",
  "timeSlots",
  "maxCapacity"
];

export function normalizeToExactTourSchema(
  raw: Partial<TourDocument>,
  defaults: TenantDefaults = DEFAULT_TENANT_CONFIG
): TourDocument {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const defaultGallery = SAMPLE_MOUNT_BATUR_TOUR.gallery;

  const ordered: TourDocument = {
    supplierId: raw.supplierId ?? defaults.supplierId,
    updatedAt: raw.updatedAt ?? {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds,
      nanoseconds: 192000000
    },
    description: raw.description || SAMPLE_MOUNT_BATUR_TOUR.description,
    tourTypeId: raw.tourTypeId ?? "",
    transportIds:
      Array.isArray(raw.transportIds) && raw.transportIds.length > 0
        ? raw.transportIds
        : [defaults.primaryTransportId],
    slug:
      raw.slug ||
      `${(raw.title || "bali-private-tour")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: raw.title || "Untitled Tour Experience",
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    multiDayGuides: Array.isArray(raw.multiDayGuides) ? raw.multiDayGuides : [],
    imageLabelId: raw.imageLabelId || defaults.imageLabelId,
    gallery:
      Array.isArray(raw.gallery) && raw.gallery.length > 0
        ? raw.gallery
        : defaultGallery,
    tenantId: raw.tenantId || defaults.tenantId,
    labelIds:
      Array.isArray(raw.labelIds) && raw.labelIds.length > 0
        ? raw.labelIds
        : [defaults.imageLabelId],
    location: raw.location || "Bali",
    infoSections:
      Array.isArray(raw.infoSections) && raw.infoSections.length > 0
        ? raw.infoSections.map((sec) => ({
            content: Array.isArray(sec.content) ? sec.content : [],
            title: sec.title ?? ""
          }))
        : SAMPLE_MOUNT_BATUR_TOUR.infoSections,
    addOnIds:
      Array.isArray(raw.addOnIds) && raw.addOnIds.length > 0
        ? raw.addOnIds
        : SAMPLE_MOUNT_BATUR_TOUR.addOnIds,
    createdAt: raw.createdAt ?? {
      type: "firestore/timestamp/1.0",
      seconds: nowSeconds - 3600,
      nanoseconds: 562000000
    },
    status: raw.status || defaults.status,
    transports: Array.isArray(raw.transports) ? raw.transports : [],
    priceLabelId: raw.priceLabelId ?? "",
    regularPrice:
      typeof raw.regularPrice === "number" && !Number.isNaN(raw.regularPrice)
        ? raw.regularPrice
        : 100,
    cutOffHours:
      typeof raw.cutOffHours === "number" && !Number.isNaN(raw.cutOffHours)
        ? raw.cutOffHours
        : defaults.cutOffHours,
    importantInfo:
      raw.importantInfo || SAMPLE_MOUNT_BATUR_TOUR.importantInfo,
    multiDayItinerary: Array.isArray(raw.multiDayItinerary)
      ? raw.multiDayItinerary
      : [],
    highlights:
      Array.isArray(raw.highlights) && raw.highlights.length > 0
        ? raw.highlights
        : SAMPLE_MOUNT_BATUR_TOUR.highlights,
    duration: raw.duration || "6-8 Hours",
    locationId: raw.locationId || defaults.locationId,
    cutOffNotice: raw.cutOffNotice ?? "",
    tourDurationType: raw.tourDurationType || "single_day",
    addOns:
      Array.isArray(raw.addOns) && raw.addOns.length > 0
        ? raw.addOns.map((addon, idx) => ({
            unit: addon.unit || "per person",
            description: addon.description ?? "",
            name: addon.name || `Add-On ${idx + 1}`,
            price: typeof addon.price === "number" ? addon.price : 20,
            id:
              addon.id ||
              SAMPLE_MOUNT_BATUR_TOUR.addOnIds[idx] ||
              `addon_${idx + 1}`,
            tenantId: addon.tenantId || defaults.tenantId
          }))
        : SAMPLE_MOUNT_BATUR_TOUR.addOns.map((a) => ({
            ...a,
            tenantId: defaults.tenantId
          })),
    exclusions:
      Array.isArray(raw.exclusions) && raw.exclusions.length > 0
        ? raw.exclusions
        : SAMPLE_MOUNT_BATUR_TOUR.exclusions,
    slotCapacity: typeof raw.slotCapacity === "number" ? raw.slotCapacity : 0,
    discountPrice:
      typeof raw.discountPrice === "number" && !Number.isNaN(raw.discountPrice)
        ? raw.discountPrice
        : 19,
    supplierName: raw.supplierName ?? defaults.supplierName,
    featuredImage:
      raw.featuredImage || SAMPLE_MOUNT_BATUR_TOUR.featuredImage,
    belowTitleLabelId: raw.belowTitleLabelId ?? "",
    inclusions:
      Array.isArray(raw.inclusions) && raw.inclusions.length > 0
        ? raw.inclusions
        : SAMPLE_MOUNT_BATUR_TOUR.inclusions,
    categoryId: raw.categoryId || defaults.categoryId,
    itinerary:
      Array.isArray(raw.itinerary) && raw.itinerary.length > 0
        ? raw.itinerary.map((step, idx) => {
            const item: TourItineraryStep = {
              description: step.description || "",
              day: typeof step.day === "number" ? step.day : 1,
              title: step.title || `Stop ${idx + 1}`
            };
            if (step.pickup?.description) {
              item.pickup = { description: step.pickup.description };
            } else if (idx === 0) {
              item.pickup = { description: "Pick up from your hotel at 08:00" };
            } else {
              item.image =
                step.image ||
                SAMPLE_MOUNT_BATUR_TOUR.itinerary[
                  Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.itinerary.length - 1)
                ]?.image ||
                "/api/uploads/FQRNDs8llr6LOi49CLO7";
            }
            return item;
          })
        : SAMPLE_MOUNT_BATUR_TOUR.itinerary,
    meetingPoint: raw.meetingPoint || "Your Hotel",
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    accommodations: Array.isArray(raw.accommodations) ? raw.accommodations : [],
    locationMapUrl:
      raw.locationMapUrl || SAMPLE_MOUNT_BATUR_TOUR.locationMapUrl,
    packages:
      Array.isArray(raw.packages) && raw.packages.length > 0
        ? raw.packages.map((pkg, idx) => ({
            exclusions:
              Array.isArray(pkg.exclusions) && pkg.exclusions.length > 0
                ? pkg.exclusions
                : SAMPLE_MOUNT_BATUR_TOUR.packages[
                    Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.packages.length - 1)
                  ].exclusions,
            tiers:
              Array.isArray(pkg.tiers) && pkg.tiers.length > 0
                ? pkg.tiers.map((t) => ({
                    childPrice: Number(t.childPrice ?? 19),
                    maxParticipants: Number(t.maxParticipants ?? 1),
                    minParticipants: Number(t.minParticipants ?? 1),
                    adultPrice: Number(t.adultPrice ?? 50)
                  }))
                : SAMPLE_MOUNT_BATUR_TOUR.packages[
                    Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.packages.length - 1)
                  ].tiers,
            details:
              pkg.details ||
              pkg.description ||
              SAMPLE_MOUNT_BATUR_TOUR.packages[
                Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.packages.length - 1)
              ].details,
            inclusions:
              Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0
                ? pkg.inclusions
                : SAMPLE_MOUNT_BATUR_TOUR.packages[
                    Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.packages.length - 1)
                  ].inclusions,
            name: pkg.name || `Package ${idx + 1}`,
            transportIds:
              Array.isArray(pkg.transportIds) && pkg.transportIds.length > 0
                ? pkg.transportIds
                : defaults.packageTransportIds,
            meetingPoint:
              pkg.meetingPoint ||
              "Toya Devasya\nhttps://maps.app.goo.gl/uU8hcZVc417nfjUp9",
            description:
              pkg.description ||
              pkg.details ||
              SAMPLE_MOUNT_BATUR_TOUR.packages[
                Math.min(idx, SAMPLE_MOUNT_BATUR_TOUR.packages.length - 1)
              ].description,
            pickupAreas:
              pkg.pickupAreas ||
              "Most area are covered for pick up and drop off",
            meetingPointType: pkg.meetingPointType || "Meeting Point"
          }))
        : SAMPLE_MOUNT_BATUR_TOUR.packages,
    timeSlots:
      Array.isArray(raw.timeSlots) && raw.timeSlots.length > 0
        ? raw.timeSlots
        : ["03:00", "03:30", "04:00"],
    maxCapacity: typeof raw.maxCapacity === "number" ? raw.maxCapacity : 0
  };

  return ordered;
}
