import { defaultColumnLayoutProfile } from "./columnLayoutProfile.js";

export function estimateDelimiterExtraWidthEm(
    contentHeightEm = 1.1,
    profile = defaultColumnLayoutProfile
) {
    const displaySlots = profile?.displaySlotEm || {};
    const threshold = displaySlots.delimiterStretchThresholdEm ?? 1.15;
    const perHeightEm = displaySlots.delimiterStretchPerHeightEm ?? 0.14;
    const maxExtraEm = displaySlots.delimiterStretchMaxExtraEm ?? 0.36;
    const overflow = Math.max(0, (contentHeightEm || 0) - threshold);

    return Math.min(maxExtraEm, overflow * perHeightEm);
}
