import { cloneAtomWidthCatalog } from "./atomWidthCatalog.js";

const defaultSpacingEm = {
    intraText: {
        default: 0,
        byKind: {},
        byText: {}
    },
    betweenNodes: {
        default: 0,
        byNodeRolePair: {},
        byTextPair: {}
    }
};

const defaultFractionDisplayEm = {
    numeratorGapEm: 0.14,
    denominatorGapEm: 0.18
};

const standardColumnLayoutProfile = {
    layoutScale: {
        horizontal: 1
    },
    atomMinWidthEm: {
        explicit: cloneAtomWidthCatalog(),
        byKind: {
            number: {
                min: 0.88,
                perCharEm: 0.48,
                basePaddingEm: 0.32
            },
            variable: {
                min: 0.9,
                perCharEm: 0.42,
                basePaddingEm: 0.36
            },
            anchor: {
                min: 0.94,
                perCharEm: 0.42,
                basePaddingEm: 0.36,
                leftPaddingEm: 0.34,
                rightPaddingEm: 0.34
            },
            operator: {
                min: 0.78,
                perCharEm: 0.42,
                basePaddingEm: 0.36
            },
            text: {
                min: 0.9,
                perCharEm: 0.42,
                basePaddingEm: 0.36
            }
        }
    },
    displaySlotEm: {
        rootLead: 0.38,
        groupLeft: 0.34,
        groupRight: 0.24,
        functionLeft: 0.34,
        functionRight: 0.24,
        powerWrapLeft: 0.34,
        powerWrapRightBase: 0.24,
        powerExponentOffset: 0.12,
        delimiterStretchThresholdEm: 1.15,
        delimiterStretchPerHeightEm: 0.14,
        delimiterStretchMaxExtraEm: 0.36
    },
    shellPaddingEm: {
        groupLeft: 0,
        groupRight: 0,
        rootLeft: 0,
        rootRight: 0,
        fractionLeft: 0,
        fractionRight: 0,
        powerWrappedBaseLeft: 0.16,
        powerWrappedBaseRight: 0.22,
        powerExponentOffset: 0.18,
        functionLeftPrefix: 0,
        functionRight: 0.4,
        implicitMultiplicationGap: 0.18
    },
    spacingEm: {
        intraText: {
            ...defaultSpacingEm.intraText
        },
        betweenNodes: {
            ...defaultSpacingEm.betweenNodes
        }
    },
    fractionDisplayEm: {
        ...defaultFractionDisplayEm
    },
    semanticBoundaryGapEm: {
        default: 0,
        byRolePair: {
            "product_content|product_factor": 0.24
        },
        byKindPair: {},
        byBoxRolePair: {}
    }
};

function mergeNestedProfile(base, overrides = {}) {
    return {
        ...base,
        ...overrides,
        atomMinWidthEm: {
            ...base.atomMinWidthEm,
            ...(overrides.atomMinWidthEm || {}),
            explicit: {
                ...base.atomMinWidthEm.explicit,
                ...(overrides.atomMinWidthEm?.explicit || {})
            },
            byKind: {
                ...base.atomMinWidthEm.byKind,
                ...(overrides.atomMinWidthEm?.byKind || {})
            }
        },
        displaySlotEm: {
            ...(base.displaySlotEm || {}),
            ...(overrides.displaySlotEm || {})
        },
        layoutScale: {
            ...(base.layoutScale || {}),
            ...(overrides.layoutScale || {})
        },
        shellPaddingEm: {
            ...base.shellPaddingEm,
            ...(overrides.shellPaddingEm || {})
        },
        spacingEm: {
            ...base.spacingEm,
            ...(overrides.spacingEm || {}),
            intraText: {
                ...base.spacingEm.intraText,
                ...(overrides.spacingEm?.intraText || {}),
                byKind: {
                    ...base.spacingEm.intraText.byKind,
                    ...(overrides.spacingEm?.intraText?.byKind || {})
                },
                byText: {
                    ...base.spacingEm.intraText.byText,
                    ...(overrides.spacingEm?.intraText?.byText || {})
                }
            },
            betweenNodes: {
                ...base.spacingEm.betweenNodes,
                ...(overrides.spacingEm?.betweenNodes || {}),
                byNodeRolePair: {
                    ...base.spacingEm.betweenNodes.byNodeRolePair,
                    ...(overrides.spacingEm?.betweenNodes?.byNodeRolePair || {})
                },
                byTextPair: {
                    ...base.spacingEm.betweenNodes.byTextPair,
                    ...(overrides.spacingEm?.betweenNodes?.byTextPair || {})
                }
            }
        },
        fractionDisplayEm: {
            ...base.fractionDisplayEm,
            ...(overrides.fractionDisplayEm || {})
        },
        semanticBoundaryGapEm: {
            ...base.semanticBoundaryGapEm,
            ...(overrides.semanticBoundaryGapEm || {}),
            byRolePair: {
                ...base.semanticBoundaryGapEm.byRolePair,
                ...(overrides.semanticBoundaryGapEm?.byRolePair || {})
            },
            byKindPair: {
                ...base.semanticBoundaryGapEm.byKindPair,
                ...(overrides.semanticBoundaryGapEm?.byKindPair || {})
            },
            byBoxRolePair: {
                ...base.semanticBoundaryGapEm.byBoxRolePair,
                ...(overrides.semanticBoundaryGapEm?.byBoxRolePair || {})
            }
        }
    };
}

export const columnLayoutProfiles = {
    standard: standardColumnLayoutProfile,
    kompakt: mergeNestedProfile(standardColumnLayoutProfile, {
        atomMinWidthEm: {
            explicit: {
                "=": 0.9,
                "+": 0.74,
                "-": 0.74
            },
            byKind: {
                number: {
                    min: 0.84,
                    perCharEm: 0.46,
                    basePaddingEm: 0.28
                },
                variable: {
                    min: 0.86,
                    perCharEm: 0.4,
                    basePaddingEm: 0.32
                },
                anchor: {
                    min: 0.9,
                    perCharEm: 0.4,
                    basePaddingEm: 0.32,
                    leftPaddingEm: 0.24,
                    rightPaddingEm: 0.24
                },
                operator: {
                    min: 0.74,
                    perCharEm: 0.4,
                    basePaddingEm: 0.32
                },
                text: {
                    min: 0.86,
                    perCharEm: 0.4,
                    basePaddingEm: 0.32
                }
            }
        },
        displaySlotEm: {
            rootLead: 0.3,
            groupLeft: 0.28,
            groupRight: 0.2,
            functionLeft: 0.28,
            functionRight: 0.2,
            powerWrapLeft: 0.28,
            powerWrapRightBase: 0.2,
            powerExponentOffset: 0.1,
            delimiterStretchThresholdEm: 1.15,
            delimiterStretchPerHeightEm: 0.11,
            delimiterStretchMaxExtraEm: 0.28
        },
        shellPaddingEm: {
            groupLeft: 0,
            groupRight: 0,
            rootLeft: 0,
            rootRight: 0,
            fractionLeft: 0,
            fractionRight: 0,
            powerWrappedBaseLeft: 0.12,
            powerWrappedBaseRight: 0.18,
            powerExponentOffset: 0.14,
            functionLeftPrefix: 0,
            functionRight: 0.32,
            implicitMultiplicationGap: 0.12
        },
        fractionDisplayEm: {
            numeratorGapEm: 0.12,
            denominatorGapEm: 0.16
        },
        semanticBoundaryGapEm: {
            byRolePair: {
                "product_content|product_factor": 0.16
            }
        }
    }),
    lesefreundlich: mergeNestedProfile(standardColumnLayoutProfile, {
        atomMinWidthEm: {
            explicit: {
                "=": 1,
                "+": 0.84,
                "-": 0.84
            },
            byKind: {
                number: {
                    min: 0.94,
                    perCharEm: 0.5,
                    basePaddingEm: 0.36
                },
                variable: {
                    min: 0.96,
                    perCharEm: 0.44,
                    basePaddingEm: 0.4
                },
                anchor: {
                    min: 1,
                    perCharEm: 0.44,
                    basePaddingEm: 0.4,
                    leftPaddingEm: 0.4,
                    rightPaddingEm: 0.4
                },
                operator: {
                    min: 0.84,
                    perCharEm: 0.44,
                    basePaddingEm: 0.4
                },
                text: {
                    min: 0.96,
                    perCharEm: 0.44,
                    basePaddingEm: 0.4
                }
            }
        },
        displaySlotEm: {
            rootLead: 0.46,
            groupLeft: 0.42,
            groupRight: 0.3,
            functionLeft: 0.42,
            functionRight: 0.3,
            powerWrapLeft: 0.42,
            powerWrapRightBase: 0.3,
            powerExponentOffset: 0.16,
            delimiterStretchThresholdEm: 1.15,
            delimiterStretchPerHeightEm: 0.17,
            delimiterStretchMaxExtraEm: 0.44
        },
        shellPaddingEm: {
            groupLeft: 0,
            groupRight: 0,
            rootLeft: 0,
            rootRight: 0,
            fractionLeft: 0,
            fractionRight: 0,
            powerWrappedBaseLeft: 0.22,
            powerWrappedBaseRight: 0.28,
            powerExponentOffset: 0.22,
            functionLeftPrefix: 0,
            functionRight: 0.48,
            implicitMultiplicationGap: 0.24
        },
        fractionDisplayEm: {
            numeratorGapEm: 0.18,
            denominatorGapEm: 0.22
        },
        semanticBoundaryGapEm: {
            byRolePair: {
                "product_content|product_factor": 0.34
            }
        }
    })
};

export const defaultColumnLayoutProfileName = "standard";
export const defaultColumnLayoutProfile = columnLayoutProfiles[defaultColumnLayoutProfileName];

export function resolveHorizontalLayoutScale(profile = defaultColumnLayoutProfile) {
    const rawScale = Number(profile?.layoutScale?.horizontal);

    if (!Number.isFinite(rawScale) || rawScale <= 0) {
        return 1;
    }

    return rawScale;
}

export function cloneColumnLayoutProfile(profile = defaultColumnLayoutProfile) {
    return JSON.parse(JSON.stringify(profile));
}

export function listColumnLayoutProfiles() {
    return Object.keys(columnLayoutProfiles);
}

export function getColumnLayoutProfile(profileName = defaultColumnLayoutProfileName) {
    const profile = columnLayoutProfiles[profileName];

    if (!profile) {
        throw new Error(`Unbekanntes Spaltenprofil: ${profileName}`);
    }

    return cloneColumnLayoutProfile(profile);
}

export function resolveColumnLayoutProfile(profileOrName = defaultColumnLayoutProfile) {
    if (typeof profileOrName === "string") {
        return getColumnLayoutProfile(profileOrName);
    }

    return cloneColumnLayoutProfile(profileOrName || defaultColumnLayoutProfile);
}

export function withHorizontalLayoutScale(
    profileOrName = defaultColumnLayoutProfile,
    horizontalScale = 1
) {
    const profile = resolveColumnLayoutProfile(profileOrName);
    const normalizedScale = Number(horizontalScale);

    profile.layoutScale = {
        ...(profile.layoutScale || {}),
        horizontal: Number.isFinite(normalizedScale) && normalizedScale > 0
            ? normalizedScale
            : 1
    };

    return profile;
}
