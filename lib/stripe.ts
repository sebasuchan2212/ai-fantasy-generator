import Stripe from "stripe";
import { PRICING_PLANS } from "@/lib/constants";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover" as never
  });
}

export function getPlan(planId: string) {
  return PRICING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
