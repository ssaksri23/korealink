"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PostCategory } from "@/lib/supabase/database.types";

export type DetailsState = Record<string, string | number | boolean | undefined>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const JOBS_INDUSTRY = [
  "manufacturing", "auto_parts", "electronics", "construction", "logistics",
  "farming", "cleaning", "restaurant", "delivery", "service", "office", "other",
] as const;

const BUSINESS_INDUSTRY = [
  "telecom", "insurance", "bank_remittance", "restaurant", "grocery", "auto",
  "mobile_phone", "legal_admin", "travel", "beauty", "hospital", "education", "other",
] as const;

const USED_CATEGORY = [
  "car", "auto_parts", "mobile_phone", "appliance", "furniture",
  "household", "clothing", "tools", "other",
] as const;

const HOUSING_PROPERTY_TYPE = [
  "studio", "two_room", "apartment", "dormitory", "short_stay",
  "roommate", "factory_dorm", "commercial", "other",
] as const;

const EVENT_TYPE = [
  "culture", "sports", "nationality_meetup", "regional_meetup",
  "education", "korean_study", "religious", "other",
] as const;

export function CategoryDetailsFields({
  categorySlug,
  details,
  onChange,
}: {
  categorySlug: PostCategory;
  details: DetailsState;
  onChange: (next: DetailsState) => void;
}) {
  const t = useTranslations("detailFields");

  function set(key: string, value: string | number | boolean | undefined) {
    onChange({ ...details, [key]: value });
  }

  if (categorySlug === "jobs") {
    return (
      <div className="flex flex-col gap-4">
        <Field label={t("jobs.industry")}>
          <Select value={(details.industry as string) ?? ""} onChange={(e) => set("industry", e.target.value)}>
            <option value="">{t("select")}</option>
            {JOBS_INDUSTRY.map((v) => (
              <option key={v} value={v}>{t(`jobs.industryOptions.${v}` as never)}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label={t("jobs.wageType")}>
            <Select value={(details.wageType as string) ?? ""} onChange={(e) => set("wageType", e.target.value)}>
              <option value="">{t("select")}</option>
              <option value="hourly">{t("jobs.wageTypeHourly")}</option>
              <option value="daily">{t("jobs.wageTypeDaily")}</option>
              <option value="monthly">{t("jobs.wageTypeMonthly")}</option>
            </Select>
          </Field>
          <Field label={t("jobs.wageMin")}>
            <Input type="number" value={(details.wageMin as number) ?? ""} onChange={(e) => set("wageMin", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("jobs.wageMax")}>
            <Input type="number" value={(details.wageMax as number) ?? ""} onChange={(e) => set("wageMax", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("jobs.workHours")}>
            <Input placeholder={t("jobs.workHoursPlaceholder")} value={(details.workHours as string) ?? ""} onChange={(e) => set("workHours", e.target.value)} />
          </Field>
          <Field label={t("jobs.recruitCount")}>
            <Input type="number" value={(details.recruitCount as number) ?? ""} onChange={(e) => set("recruitCount", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <Field label={t("jobs.koreanLevel")}>
          <Select value={(details.koreanLevel as string) ?? ""} onChange={(e) => set("koreanLevel", e.target.value)}>
            <option value="">{t("jobs.koreanLevelAny")}</option>
            <option value="none">{t("jobs.koreanLevelNone")}</option>
            <option value="basic">{t("jobs.koreanLevelBasic")}</option>
            <option value="intermediate">{t("jobs.koreanLevelIntermediate")}</option>
            <option value="advanced">{t("jobs.koreanLevelAdvanced")}</option>
          </Select>
        </Field>
        <Field label={t("jobs.workPeriod")}>
          <Input value={(details.workPeriod as string) ?? ""} onChange={(e) => set("workPeriod", e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-4">
          <Checkbox label={t("jobs.foreignerAllowed")} checked={(details.foreignerAllowed as boolean) ?? true} onChange={(e) => set("foreignerAllowed", e.target.checked)} />
          <Checkbox label={t("jobs.housingProvided")} checked={(details.housingProvided as boolean) ?? false} onChange={(e) => set("housingProvided", e.target.checked)} />
          <Checkbox label={t("jobs.commuteBusProvided")} checked={(details.commuteBusProvided as boolean) ?? false} onChange={(e) => set("commuteBusProvided", e.target.checked)} />
          <Checkbox label={t("jobs.mealProvided")} checked={(details.mealProvided as boolean) ?? false} onChange={(e) => set("mealProvided", e.target.checked)} />
        </div>
      </div>
    );
  }

  if (categorySlug === "business") {
    return (
      <div className="flex flex-col gap-4">
        <Field label={t("business.industry")}>
          <Select value={(details.industry as string) ?? ""} onChange={(e) => set("industry", e.target.value)}>
            <option value="">{t("select")}</option>
            {BUSINESS_INDUSTRY.map((v) => (
              <option key={v} value={v}>{t(`business.industryOptions.${v}` as never)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("business.discountInfo")}>
          <Input value={(details.discountInfo as string) ?? ""} onChange={(e) => set("discountInfo", e.target.value)} />
        </Field>
      </div>
    );
  }

  if (categorySlug === "used") {
    return (
      <div className="flex flex-col gap-4">
        <Field label={t("used.category")}>
          <Select value={(details.category as string) ?? ""} onChange={(e) => set("category", e.target.value)}>
            <option value="">{t("select")}</option>
            {USED_CATEGORY.map((v) => (
              <option key={v} value={v}>{t(`used.categoryOptions.${v}` as never)}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("used.price")}>
            <Input type="number" value={(details.price as number) ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("used.itemCondition")}>
            <Select value={(details.itemCondition as string) ?? ""} onChange={(e) => set("itemCondition", e.target.value)}>
              <option value="">{t("select")}</option>
              <option value="new">{t("used.itemConditionNew")}</option>
              <option value="like_new">{t("used.itemConditionLikeNew")}</option>
              <option value="used">{t("used.itemConditionUsed")}</option>
              <option value="for_parts">{t("used.itemConditionForParts")}</option>
            </Select>
          </Field>
        </div>
        <Field label={t("used.saleStatus")}>
          <Select value={(details.saleStatus as string) ?? "selling"} onChange={(e) => set("saleStatus", e.target.value)}>
            <option value="selling">{t("used.saleStatusSelling")}</option>
            <option value="reserved">{t("used.saleStatusReserved")}</option>
            <option value="sold">{t("used.saleStatusSold")}</option>
          </Select>
        </Field>
      </div>
    );
  }

  if (categorySlug === "housing") {
    return (
      <div className="flex flex-col gap-4">
        <Field label={t("housing.propertyType")}>
          <Select value={(details.propertyType as string) ?? ""} onChange={(e) => set("propertyType", e.target.value)}>
            <option value="">{t("select")}</option>
            {HOUSING_PROPERTY_TYPE.map((v) => (
              <option key={v} value={v}>{t(`housing.propertyTypeOptions.${v}` as never)}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label={t("housing.deposit")}>
            <Input type="number" value={(details.deposit as number) ?? ""} onChange={(e) => set("deposit", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("housing.monthlyRent")}>
            <Input type="number" value={(details.monthlyRent as number) ?? ""} onChange={(e) => set("monthlyRent", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("housing.maintenanceFee")}>
            <Input type="number" value={(details.maintenanceFee as number) ?? ""} onChange={(e) => set("maintenanceFee", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("housing.capacity")}>
            <Input type="number" value={(details.capacity as number) ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("housing.genderCondition")}>
            <Select value={(details.genderCondition as string) ?? "any"} onChange={(e) => set("genderCondition", e.target.value)}>
              <option value="any">{t("housing.genderConditionAny")}</option>
              <option value="male">{t("housing.genderConditionMale")}</option>
              <option value="female">{t("housing.genderConditionFemale")}</option>
            </Select>
          </Field>
        </div>
      </div>
    );
  }

  if (categorySlug === "groupbuy") {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("groupbuy.price")}>
            <Input type="number" value={(details.price as number) ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label={t("groupbuy.targetCount")}>
            <Input type="number" value={(details.targetCount as number) ?? ""} onChange={(e) => set("targetCount", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <Field label={t("groupbuy.deadline")}>
          <Input type="date" value={(details.deadline as string) ?? ""} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label={t("groupbuy.pickupMethod")}>
          <Input value={(details.pickupMethod as string) ?? ""} onChange={(e) => set("pickupMethod", e.target.value)} />
        </Field>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label={t("events.eventType")}>
        <Select value={(details.eventType as string) ?? ""} onChange={(e) => set("eventType", e.target.value)}>
          <option value="">{t("select")}</option>
          {EVENT_TYPE.map((v) => (
            <option key={v} value={v}>{t(`events.eventTypeOptions.${v}` as never)}</option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label={t("events.date")}>
          <Input type="date" value={(details.eventDate as string) ?? ""} onChange={(e) => set("eventDate", e.target.value)} />
        </Field>
        <Field label={t("events.time")}>
          <Input type="time" value={(details.eventTime as string) ?? ""} onChange={(e) => set("eventTime", e.target.value)} />
        </Field>
      </div>
      <Field label={t("events.venue")}>
        <Input value={(details.venue as string) ?? ""} onChange={(e) => set("venue", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t("events.fee")}>
          <Input type="number" value={(details.fee as number) ?? 0} onChange={(e) => set("fee", e.target.value ? Number(e.target.value) : 0)} />
        </Field>
        <Field label={t("events.capacity")}>
          <Input type="number" value={(details.capacity as number) ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)} />
        </Field>
      </div>
      <Field label={t("events.organizer")}>
        <Input value={(details.organizer as string) ?? ""} onChange={(e) => set("organizer", e.target.value)} />
      </Field>
      <Field label={t("events.applicationMethod")}>
        <Input value={(details.applicationMethod as string) ?? ""} onChange={(e) => set("applicationMethod", e.target.value)} />
      </Field>
    </div>
  );
}
