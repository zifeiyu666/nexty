import { pricingPlanGroups } from '@/lib/db/schema';

export type PricingPlanGroup = typeof pricingPlanGroups.$inferSelect;

export interface PricingPlanFeature {
  description: string;
  included: boolean;
  bold?: boolean;
}

export interface PricingPlanTranslation {
  cardTitle?: string;
  cardDescription?: string;
  displayPrice?: string;
  originalPrice?: string;
  priceSuffix?: string;
  features?: PricingPlanFeature[];
  highlightText?: string;
  buttonText?: string;
}

export interface PricingPlanLangJsonb {
  [locale: string]: PricingPlanTranslation;
}
