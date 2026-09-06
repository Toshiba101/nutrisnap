// RevenueCat wrapper. When no RevenueCat project key has been configured
// yet (see lib/config.ts), the paywall still renders and works end-to-end,
// but "purchasing" just flips a local on-device unlock flag instead of
// hitting the real SDK — so the whole free-tier-cap → paywall → unlocked
// UX is demoable today, and becomes a real subscription the moment a
// RevenueCat key is added, with no UI changes needed.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
  IS_REVENUECAT_CONFIGURED,
  ENTITLEMENT_ID,
} from "./config";

const LOCAL_UNLOCK_KEY = "nutrisnap_local_unlocked";
let configured = false;

async function ensureConfigured() {
  if (!IS_REVENUECAT_CONFIGURED || configured) return;
  const Purchases = (await import("react-native-purchases")).default;
  const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  if (!apiKey) return;
  Purchases.configure({ apiKey });
  configured = true;
}

export async function isUnlocked(): Promise<boolean> {
  if (IS_REVENUECAT_CONFIGURED) {
    await ensureConfigured();
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const info = await Purchases.getCustomerInfo();
      return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
    } catch {
      return false;
    }
  }
  const flag = await AsyncStorage.getItem(LOCAL_UNLOCK_KEY);
  return flag === "true";
}

export interface PaywallOffering {
  identifier: string;
  title: string;
  priceString: string;
  raw?: unknown;
}

export async function getOfferings(): Promise<PaywallOffering[]> {
  if (IS_REVENUECAT_CONFIGURED) {
    await ensureConfigured();
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return [];
      return current.availablePackages.map((p) => ({
        identifier: p.identifier,
        title: p.product.title,
        priceString: p.product.priceString,
        raw: p,
      }));
    } catch {
      return [];
    }
  }
  // Demo-mode offering — mirrors what a real RevenueCat "Unlimited" package
  // would show, so the paywall UI is identical either way.
  return [{ identifier: "demo_unlimited_monthly", title: "NutriSnap Unlimited", priceString: "$6.99/mo" }];
}

export async function purchase(offering: PaywallOffering): Promise<boolean> {
  if (IS_REVENUECAT_CONFIGURED && offering.raw) {
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const { customerInfo } = await Purchases.purchasePackage(offering.raw as any);
      return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
    } catch {
      return false;
    }
  }
  await AsyncStorage.setItem(LOCAL_UNLOCK_KEY, "true");
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  if (IS_REVENUECAT_CONFIGURED) {
    await ensureConfigured();
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const info = await Purchases.restorePurchases();
      return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
    } catch {
      return false;
    }
  }
  return isUnlocked();
}
