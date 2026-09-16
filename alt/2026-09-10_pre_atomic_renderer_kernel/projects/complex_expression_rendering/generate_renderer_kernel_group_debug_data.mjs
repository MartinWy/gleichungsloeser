import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import GenesisCore from "../../core/index.js";
import {
    buildRenderScenesFromSolveState
} from "../../core_a/index.js";
import {
    buildRendererKernelSceneInput,
    buildRendererKernelScenePlan,
    buildGroupGeometryPlanFromScenePlan
} from "../../renderer_kernel/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(
    __dirname,
    "prototypes",
    "renderer-kernel-group-debug-data.js"
);

const examples = [
    {
        id: "power-group",
        title: "Klammer vor Potenz",
        equation: "sin((x+1)^2)=3",
        targetVariable: "x",
        sceneIndex: 0,
        note: "Die Klammer bleibt als Schale stehen, waehrend die Potenz darueber liegt."
    },
    {
        id: "fraction-split-groups",
        title: "Getrennte Bruchklammern",
        equation: "sqrt((x+1)/(2-a))=5",
        targetVariable: "x",
        sceneIndex: 0,
        note: "Bewusster Diagnosefall: der Szenenplan liefert hier getrennte Gruppen fuer Zaehler und Nenner."
    },
    {
        id: "nested-groups",
        title: "Verschachtelte Klammern",
        equation: "((x/2)+1)=3",
        targetVariable: "x",
        sceneIndex: 0,
        note: "Die aeussere Klammer erbt die innere Gruppe als Kindspur."
    },
    {
        id: "pure-power-group",
        title: "Reine Potenzgruppe",
        equation: "(x+1)^2=9",
        targetVariable: "x",
        sceneIndex: 0,
        note: "Ein kompakter Vergleichsfall fuer eine Klammer ohne Mehrzeileninhalt."
    }
];

function buildMemberTrackIndex(scenePlan = {}) {
    const memberToTrack = new Map();

    (scenePlan.shellTracks || []).forEach((track) => {
        (track.members || []).forEach((member) => {
            if (member?.id) {
                memberToTrack.set(member.id, track.id);
            }
        });
    });

    return memberToTrack;
}

function buildAtomTrackIndex(scenePlan = {}) {
    return new Map(
        (scenePlan.atomTracks || []).map((track) => [track.id, track])
    );
}

function normalizeNodes(sceneInput = {}, scenePlan = {}) {
    const memberTrackIndex = buildMemberTrackIndex(scenePlan);
    const atomTrackIndex = buildAtomTrackIndex(scenePlan);
    const focusIdSet = new Set(scenePlan.focusIds || []);

    return (sceneInput?.nodes?.all || []).map((node) => {
        const atomTrack = atomTrackIndex.get(node.id);

        return {
            id: node.id,
            type: node.type,
            text: node.text || "",
            projectionRole: node.projectionRole || null,
            sourceAtomId: node.sourceAtomId || null,
            sourceShellId: node.sourceShellId || null,
            shellTrackId: atomTrack?.shellTrackId || memberTrackIndex.get(node.id) || null,
            functionName: node.functionName || null,
            visualMode: node.visualMode || null,
            isFocus: focusIdSet.has(node.id),
            position: {
                rowIndex: node?.position?.rowIndex ?? null,
                localRow: node?.position?.localRow ?? null,
                absoluteRow: node?.position?.absoluteRow ?? null,
                stackedRow: node?.position?.stackedRow ?? null,
                col: node?.position?.col ?? null,
                colStart: node?.position?.colStart ?? node?.position?.col ?? null,
                colEnd: node?.position?.colEnd ?? node?.position?.col ?? null
            }
        };
    });
}

function normalizeRowBands(rowBands = []) {
    return rowBands.map((band) => ({
        id: band.id,
        absoluteRow: band.absoluteRow,
        rowKind: band.rowKind,
        localRowOffset: band.localRowOffset,
        minColumn: band.minColumn,
        maxColumn: band.maxColumn,
        spanWidth: band.spanWidth,
        shellTrackIds: band.shellTrackIds,
        focusNodeIds: band.focusNodeIds,
        anchorColumns: band.anchorColumns
    }));
}

function normalizeShellTracks(shellTracks = []) {
    return shellTracks.map((track) => ({
        id: track.id,
        kind: track.kind,
        functionName: track.functionName || null,
        minAbsoluteRow: track.minAbsoluteRow,
        maxAbsoluteRow: track.maxAbsoluteRow,
        minColumn: track.minColumn,
        maxColumn: track.maxColumn,
        memberCount: track.memberCount,
        hasFocusMember: track.hasFocusMember,
        projectionRoles: track.projectionRoles,
        memberTexts: track.memberTexts,
        memberNodeIds: track.memberNodeIds,
        sourceAtomIds: track.sourceAtomIds,
        sourceShellIds: track.sourceShellIds,
        members: (track.members || []).map((member) => ({
            id: member.id,
            type: member.type,
            text: member.text || "",
            projectionRole: member.projectionRole || null,
            sourceAtomId: member.sourceAtomId || null,
            sourceShellId: member.sourceShellId || null,
            absoluteRow: member.absoluteRow ?? null,
            localRow: member.localRow ?? null,
            stackedRow: member.stackedRow ?? null,
            colStart: member.colStart ?? null,
            colEnd: member.colEnd ?? null
        }))
    }));
}

function normalizeGroupTracks(groupTracks = []) {
    return groupTracks.map((track) => ({
        id: track.id,
        shellTrackId: track.shellTrackId,
        memberNodeIds: track.memberNodeIds,
        structuralNodeIds: track.structuralNodeIds,
        contentNodeIds: track.contentNodeIds,
        childShellTrackIds: track.childShellTrackIds,
        frameBounds: track.frameBounds,
        shellBounds: track.shellBounds,
        leftParenBounds: track.leftParenBounds,
        rightParenBounds: track.rightParenBounds,
        contentBounds: track.contentBounds,
        axisAbsoluteRow: track.axisAbsoluteRow,
        contentColumnStart: track.contentColumnStart,
        contentColumnEnd: track.contentColumnEnd,
        focusIds: track.focusIds,
        verticalProfile: track.verticalProfile
    }));
}

async function buildExampleSnapshot(exampleConfig = {}) {
    const result = await GenesisCore.solve(exampleConfig.equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: exampleConfig.targetVariable
    });

    if (result?.fehler) {
        throw new Error(`${exampleConfig.equation}: ${result.fehler}`);
    }

    const scenes = buildRenderScenesFromSolveState(result, {
        sourceCommit: "renderer-kernel-group-debug"
    });
    const scene = scenes.at(exampleConfig.sceneIndex);

    if (!scene) {
        throw new Error(`${exampleConfig.equation}: Szene ${exampleConfig.sceneIndex} fehlt.`);
    }

    const sceneInput = buildRendererKernelSceneInput(scene);
    const scenePlan = buildRendererKernelScenePlan(scene);
    const groupGeometry = buildGroupGeometryPlanFromScenePlan(scenePlan);

    return {
        id: exampleConfig.id,
        title: exampleConfig.title,
        equation: exampleConfig.equation,
        targetVariable: exampleConfig.targetVariable,
        sceneIndex: exampleConfig.sceneIndex,
        note: exampleConfig.note,
        sceneId: scene.sceneId,
        strategyFamilies: (result.schritte || []).map((step) => step?.strategie?.family).filter(Boolean),
        layout: {
            anchorColumn: scene?.layout?.anchorColumn ?? null,
            columnCount: scene?.layout?.columnCount ?? null,
            rowCount: scene?.layout?.rowCount ?? null,
            visualRowCount: scene?.layout?.visualRowCount ?? null,
            stackedVisualRowCount: scene?.layout?.stackedVisualRowCount ?? null,
            minColumn: scene?.bounds?.minColumn ?? null,
            maxColumn: scene?.bounds?.maxColumn ?? null,
            minAbsoluteRow: scene?.bounds?.minAbsoluteRow ?? null,
            maxAbsoluteRow: scene?.bounds?.maxAbsoluteRow ?? null
        },
        rowMeta: scenePlan.rowMeta,
        counts: {
            sceneNodes: sceneInput.counts.all,
            shellTracks: scenePlan.counts.shellTracks,
            groupTracks: groupGeometry.counts.groupTracks
        },
        rowBands: normalizeRowBands(scenePlan.rowBands),
        nodes: normalizeNodes(sceneInput, scenePlan),
        shellTracks: normalizeShellTracks(scenePlan.shellTracks),
        groupTracks: normalizeGroupTracks(groupGeometry.groupTracks)
    };
}

async function main() {
    const snapshots = [];

    for (const example of examples) {
        snapshots.push(await buildExampleSnapshot(example));
    }

    const payload = {
        generatedAt: new Date().toISOString(),
        source: "renderer_kernel_group_debug_v1",
        examples: snapshots
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
        outputPath,
        `export const RENDERER_KERNEL_GROUP_DEBUG_DATA = ${JSON.stringify(payload, null, 2)};\nexport default RENDERER_KERNEL_GROUP_DEBUG_DATA;\n`,
        "utf8"
    );

    console.log(`Renderer-Kernel-Group-Debugdaten geschrieben: ${outputPath}`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
