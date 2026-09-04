"use client";

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

export function CategoryDetailsFields({
  categorySlug,
  details,
  onChange,
}: {
  categorySlug: PostCategory;
  details: DetailsState;
  onChange: (next: DetailsState) => void;
}) {
  function set(key: string, value: string | number | boolean | undefined) {
    onChange({ ...details, [key]: value });
  }

  if (categorySlug === "jobs") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="업종">
          <Select value={(details.industry as string) ?? ""} onChange={(e) => set("industry", e.target.value)}>
            <option value="">선택</option>
            {[
              ["manufacturing", "제조·생산"], ["auto_parts", "자동차부품"], ["electronics", "전자부품"],
              ["construction", "건설"], ["logistics", "물류·포장"], ["farming", "농장·축산"],
              ["cleaning", "청소"], ["restaurant", "식당·주방"], ["delivery", "배달"],
              ["service", "서비스"], ["office", "사무직"], ["other", "기타"],
            ].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="급여형태">
            <Select value={(details.wageType as string) ?? ""} onChange={(e) => set("wageType", e.target.value)}>
              <option value="">선택</option>
              <option value="hourly">시급</option>
              <option value="daily">일당</option>
              <option value="monthly">월급</option>
            </Select>
          </Field>
          <Field label="최소 급여">
            <Input type="number" value={(details.wageMin as number) ?? ""} onChange={(e) => set("wageMin", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="최대 급여">
            <Input type="number" value={(details.wageMax as number) ?? ""} onChange={(e) => set("wageMax", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="근무시간">
            <Input placeholder="예: 08:00~17:00" value={(details.workHours as string) ?? ""} onChange={(e) => set("workHours", e.target.value)} />
          </Field>
          <Field label="모집인원">
            <Input type="number" value={(details.recruitCount as number) ?? ""} onChange={(e) => set("recruitCount", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <Field label="한국어 수준">
          <Select value={(details.koreanLevel as string) ?? ""} onChange={(e) => set("koreanLevel", e.target.value)}>
            <option value="">무관</option>
            <option value="none">필요 없음</option>
            <option value="basic">기초</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </Select>
        </Field>
        <Field label="근무기간">
          <Input value={(details.workPeriod as string) ?? ""} onChange={(e) => set("workPeriod", e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-4">
          <Checkbox label="외국인 가능" checked={(details.foreignerAllowed as boolean) ?? true} onChange={(e) => set("foreignerAllowed", e.target.checked)} />
          <Checkbox label="숙소 제공" checked={(details.housingProvided as boolean) ?? false} onChange={(e) => set("housingProvided", e.target.checked)} />
          <Checkbox label="통근버스 제공" checked={(details.commuteBusProvided as boolean) ?? false} onChange={(e) => set("commuteBusProvided", e.target.checked)} />
          <Checkbox label="식사 제공" checked={(details.mealProvided as boolean) ?? false} onChange={(e) => set("mealProvided", e.target.checked)} />
        </div>
      </div>
    );
  }

  if (categorySlug === "business") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="업종">
          <Select value={(details.industry as string) ?? ""} onChange={(e) => set("industry", e.target.value)}>
            <option value="">선택</option>
            {[
              ["telecom", "통신"], ["insurance", "보험"], ["bank_remittance", "은행·송금"],
              ["restaurant", "식당"], ["grocery", "식품점"], ["auto", "자동차"],
              ["mobile_phone", "휴대전화"], ["legal_admin", "법률·행정"], ["travel", "여행"],
              ["beauty", "미용"], ["hospital", "병원"], ["education", "교육"], ["other", "기타"],
            ].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <Field label="할인/쿠폰 안내">
          <Input value={(details.discountInfo as string) ?? ""} onChange={(e) => set("discountInfo", e.target.value)} />
        </Field>
      </div>
    );
  }

  if (categorySlug === "used") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="카테고리">
          <Select value={(details.category as string) ?? ""} onChange={(e) => set("category", e.target.value)}>
            <option value="">선택</option>
            {[
              ["car", "자동차"], ["auto_parts", "자동차부품"], ["mobile_phone", "휴대전화"],
              ["appliance", "가전제품"], ["furniture", "가구"], ["household", "생활용품"],
              ["clothing", "의류"], ["tools", "공구"], ["other", "기타"],
            ].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="가격(원)">
            <Input type="number" value={(details.price as number) ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="상품상태">
            <Select value={(details.itemCondition as string) ?? ""} onChange={(e) => set("itemCondition", e.target.value)}>
              <option value="">선택</option>
              <option value="new">새상품</option>
              <option value="like_new">거의 새것</option>
              <option value="used">사용감 있음</option>
              <option value="for_parts">부품용</option>
            </Select>
          </Field>
        </div>
        <Field label="판매상태">
          <Select value={(details.saleStatus as string) ?? "selling"} onChange={(e) => set("saleStatus", e.target.value)}>
            <option value="selling">판매중</option>
            <option value="reserved">예약중</option>
            <option value="sold">판매완료</option>
          </Select>
        </Field>
      </div>
    );
  }

  if (categorySlug === "housing") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="매물유형">
          <Select value={(details.propertyType as string) ?? ""} onChange={(e) => set("propertyType", e.target.value)}>
            <option value="">선택</option>
            {[
              ["studio", "원룸"], ["two_room", "투룸"], ["apartment", "아파트"], ["dormitory", "기숙사"],
              ["short_stay", "단기숙소"], ["roommate", "룸메이트"], ["factory_dorm", "공장숙소"],
              ["commercial", "상가"], ["other", "기타"],
            ].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="보증금(원)">
            <Input type="number" value={(details.deposit as number) ?? ""} onChange={(e) => set("deposit", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="월세(원)">
            <Input type="number" value={(details.monthlyRent as number) ?? ""} onChange={(e) => set("monthlyRent", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="관리비(원)">
            <Input type="number" value={(details.maintenanceFee as number) ?? ""} onChange={(e) => set("maintenanceFee", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="수용인원">
            <Input type="number" value={(details.capacity as number) ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="성별조건">
            <Select value={(details.genderCondition as string) ?? "any"} onChange={(e) => set("genderCondition", e.target.value)}>
              <option value="any">무관</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
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
          <Field label="가격(원)">
            <Input type="number" value={(details.price as number) ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="목표인원">
            <Input type="number" value={(details.targetCount as number) ?? ""} onChange={(e) => set("targetCount", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
        <Field label="신청마감일">
          <Input type="date" value={(details.deadline as string) ?? ""} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label="수령방법">
          <Input value={(details.pickupMethod as string) ?? ""} onChange={(e) => set("pickupMethod", e.target.value)} />
        </Field>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="행사유형">
        <Select value={(details.eventType as string) ?? ""} onChange={(e) => set("eventType", e.target.value)}>
          <option value="">선택</option>
          {[
            ["culture", "문화행사"], ["sports", "체육행사"], ["nationality_meetup", "국가별 모임"],
            ["regional_meetup", "지역모임"], ["education", "교육"], ["korean_study", "한국어 공부"],
            ["religious", "종교행사"], ["other", "기타"],
          ].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="날짜">
          <Input type="date" value={(details.eventDate as string) ?? ""} onChange={(e) => set("eventDate", e.target.value)} />
        </Field>
        <Field label="시간">
          <Input placeholder="예: 14:00" value={(details.eventTime as string) ?? ""} onChange={(e) => set("eventTime", e.target.value)} />
        </Field>
      </div>
      <Field label="장소">
        <Input value={(details.venue as string) ?? ""} onChange={(e) => set("venue", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="참가비(원)">
          <Input type="number" value={(details.fee as number) ?? 0} onChange={(e) => set("fee", e.target.value ? Number(e.target.value) : 0)} />
        </Field>
        <Field label="정원">
          <Input type="number" value={(details.capacity as number) ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)} />
        </Field>
      </div>
      <Field label="주최자">
        <Input value={(details.organizer as string) ?? ""} onChange={(e) => set("organizer", e.target.value)} />
      </Field>
      <Field label="신청방법">
        <Input value={(details.applicationMethod as string) ?? ""} onChange={(e) => set("applicationMethod", e.target.value)} />
      </Field>
    </div>
  );
}
