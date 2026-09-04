import { z } from "zod";

export const CATEGORY_SLUGS = [
  "jobs",
  "business",
  "used",
  "housing",
  "groupbuy",
  "events",
] as const;
export type CategorySlugValue = (typeof CATEGORY_SLUGS)[number];

export const basicInfoSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(2).max(5000),
  regionId: z.string().uuid().optional().nullable(),
});
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;

export const contactSchema = z.object({
  contactName: z.string().max(50).optional().nullable(),
  contactPhone: z.string().max(30).optional().nullable(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const jobDetailsSchema = z.object({
  industry: z.enum([
    "manufacturing", "auto_parts", "electronics", "construction", "logistics",
    "farming", "cleaning", "restaurant", "delivery", "service", "office", "other",
  ]),
  wageType: z.enum(["hourly", "daily", "monthly"]).optional().nullable(),
  wageMin: z.coerce.number().int().nonnegative().optional().nullable(),
  wageMax: z.coerce.number().int().nonnegative().optional().nullable(),
  workHours: z.string().max(100).optional().nullable(),
  recruitCount: z.coerce.number().int().positive().optional().nullable(),
  foreignerAllowed: z.boolean().default(true),
  koreanLevel: z.enum(["none", "basic", "intermediate", "advanced"]).optional().nullable(),
  housingProvided: z.boolean().default(false),
  commuteBusProvided: z.boolean().default(false),
  mealProvided: z.boolean().default(false),
  workPeriod: z.string().max(100).optional().nullable(),
});
export type JobDetailsInput = z.infer<typeof jobDetailsSchema>;

export const businessDetailsSchema = z.object({
  industry: z.enum([
    "telecom", "insurance", "bank_remittance", "restaurant", "grocery", "auto",
    "mobile_phone", "legal_admin", "travel", "beauty", "hospital", "education", "other",
  ]),
  discountInfo: z.string().max(500).optional().nullable(),
});
export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;

export const usedItemDetailsSchema = z.object({
  category: z.enum([
    "car", "auto_parts", "mobile_phone", "appliance", "furniture", "household",
    "clothing", "tools", "other",
  ]),
  price: z.coerce.number().int().nonnegative(),
  itemCondition: z.enum(["new", "like_new", "used", "for_parts"]).optional().nullable(),
  saleStatus: z.enum(["selling", "reserved", "sold"]).default("selling"),
});
export type UsedItemDetailsInput = z.infer<typeof usedItemDetailsSchema>;

export const housingDetailsSchema = z.object({
  propertyType: z.enum([
    "studio", "two_room", "apartment", "dormitory", "short_stay", "roommate",
    "factory_dorm", "commercial", "other",
  ]),
  deposit: z.coerce.number().int().nonnegative().optional().nullable(),
  monthlyRent: z.coerce.number().int().nonnegative().optional().nullable(),
  maintenanceFee: z.coerce.number().int().nonnegative().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  genderCondition: z.enum(["any", "male", "female"]).default("any"),
});
export type HousingDetailsInput = z.infer<typeof housingDetailsSchema>;

export const groupBuyDetailsSchema = z.object({
  price: z.coerce.number().int().nonnegative(),
  targetCount: z.coerce.number().int().positive(),
  deadline: z.string().optional().nullable(),
  pickupMethod: z.string().max(200).optional().nullable(),
});
export type GroupBuyDetailsInput = z.infer<typeof groupBuyDetailsSchema>;

export const eventDetailsSchema = z.object({
  eventType: z.enum([
    "culture", "sports", "nationality_meetup", "regional_meetup", "education",
    "korean_study", "religious", "other",
  ]),
  eventDate: z.string().optional().nullable(),
  eventTime: z.string().max(50).optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  fee: z.coerce.number().int().nonnegative().default(0),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  organizer: z.string().max(100).optional().nullable(),
  applicationMethod: z.string().max(300).optional().nullable(),
});
export type EventDetailsInput = z.infer<typeof eventDetailsSchema>;

export const translationModeSchema = z.object({
  mode: z.enum(["original_only", "selected", "all"]),
  languageCodes: z.array(z.string()).default([]),
});
export type TranslationModeInput = z.infer<typeof translationModeSchema>;
