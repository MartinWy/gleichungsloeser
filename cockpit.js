import {
    createPreviewObjectUrl,
    revokePreviewObjectUrl
} from "./scripts/cockpit_preview_delivery/browser.js";

const elements = {
    form: document.getElementById("cockpitForm"),
    equationInput: document.getElementById("equationInput"),
    targetVariableInput: document.getElementById("targetVariableInput"),
    powerInverseStyleInput: document.getElementById("powerInverseStyleInput"),
    previewImage: document.getElementById("previewImage"),
    previewPlaceholder: document.getElementById("previewPlaceholder"),
    status: document.getElementById("status"),
    pdfLink: document.getElementById("pdfLink"),
    startButton: document.getElementById("startButton"),
    rowControls: document.getElementById("rowControls"),
    rowControlsList: document.getElementById("rowControlsList"),
    colorControls: document.getElementById("colorControls"),
    colorControlsList: document.getElementById("colorControlsList")
};

const state = {
    componentColors: {},
    colorTargets: [],
    rowTargets: [],
    hiddenStepIndexes: [],
    colorPalette: [],
    runtimeEngine: "genesis_runtime",
    powerInverseStyle: "root",
    previewObjectUrl: "",
    pdfObjectUrl: ""
};

let autoRenderTimer = null;
const cockpitServerOrigin = "http://127.0.0.1:4173";

function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", isError);
    elements.status.hidden = !message;
}

function buildCockpitServerUrl(equation = "", targetVariable = "", runtimeEngine = "", powerInverseStyle = "root") {
    const url = new URL("/", cockpitServerOrigin);

    if (equation) {
        url.searchParams.set("equation", equation);
    }

    if (targetVariable) {
        url.searchParams.set("targetVariable", targetVariable);
    }

    if (runtimeEngine) {
        url.searchParams.set("runtimeEngine", runtimeEngine);
    }

    if (powerInverseStyle && powerInverseStyle !== "root") {
        url.searchParams.set("powerInverseStyle", powerInverseStyle);
    }

    return url;
}

function redirectToCockpitServer(equation = "", targetVariable = "", runtimeEngine = "", powerInverseStyle = "root") {
    window.location.replace(buildCockpitServerUrl(equation, targetVariable, runtimeEngine, powerInverseStyle).toString());
}

function writeStateToUrl(equation, targetVariable, runtimeEngine, powerInverseStyle) {
    const url = new URL(window.location.href);

    if (equation) {
        url.searchParams.set("equation", equation);
    } else {
        url.searchParams.delete("equation");
    }

    if (targetVariable) {
        url.searchParams.set("targetVariable", targetVariable);
    } else {
        url.searchParams.delete("targetVariable");
    }

    if (runtimeEngine) {
        url.searchParams.set("runtimeEngine", runtimeEngine);
    } else {
        url.searchParams.delete("runtimeEngine");
    }

    if (powerInverseStyle && powerInverseStyle !== "root") {
        url.searchParams.set("powerInverseStyle", powerInverseStyle);
    } else {
        url.searchParams.delete("powerInverseStyle");
    }

    window.history.replaceState(null, "", url);
}

function readStateFromUrl() {
    const url = new URL(window.location.href);

    return {
        equation: url.searchParams.get("equation") || "",
        targetVariable: url.searchParams.get("targetVariable") || "",
        runtimeEngine: url.searchParams.get("runtimeEngine") || "genesis_runtime",
        powerInverseStyle: url.searchParams.get("powerInverseStyle") === "fractional-exponent"
            ? "fractional-exponent"
            : "root"
    };
}

function showPlaceholder(message) {
    releasePreviewObjectUrls();
    elements.previewImage.hidden = true;
    elements.previewImage.removeAttribute("src");
    elements.previewPlaceholder.hidden = false;
    elements.previewPlaceholder.textContent = message;
}

function releasePreviewObjectUrls() {
    revokePreviewObjectUrl(state.previewObjectUrl);
    revokePreviewObjectUrl(state.pdfObjectUrl);
    state.previewObjectUrl = "";
    state.pdfObjectUrl = "";
}

function showPreviewArtifacts(previewArtifact, pdfArtifact) {
    const nextPreviewObjectUrl = createPreviewObjectUrl(previewArtifact, "image/png");
    let nextPdfObjectUrl = "";

    try {
        nextPdfObjectUrl = createPreviewObjectUrl(pdfArtifact, "application/pdf");
    } catch (error) {
        revokePreviewObjectUrl(nextPreviewObjectUrl);
        throw error;
    }

    releasePreviewObjectUrls();
    state.previewObjectUrl = nextPreviewObjectUrl;
    state.pdfObjectUrl = nextPdfObjectUrl;
    elements.previewPlaceholder.hidden = true;
    elements.previewImage.hidden = false;
    elements.previewImage.src = state.previewObjectUrl;
    elements.pdfLink.href = state.pdfObjectUrl;
    elements.pdfLink.hidden = false;
}

function pruneComponentColors(colorTargets, componentColors) {
    const allowedIds = new Set((colorTargets || []).map((target) => target.id));

    return Object.fromEntries(
        Object.entries(componentColors || {}).filter(([key, value]) => allowedIds.has(key) && typeof value === "string" && value.length > 0)
    );
}

function pruneHiddenStepIndexes(rowTargets, hiddenStepIndexes) {
    const allowedIndexes = new Set((rowTargets || []).map((target) => target.stepIndex));

    return [...new Set(
        (Array.isArray(hiddenStepIndexes) ? hiddenStepIndexes : [])
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && allowedIndexes.has(value))
    )].sort((left, right) => left - right);
}

function buildRowControls(rowTargets = [], hiddenStepIndexes = []) {
    state.rowTargets = Array.isArray(rowTargets) ? rowTargets : [];
    state.hiddenStepIndexes = pruneHiddenStepIndexes(state.rowTargets, hiddenStepIndexes);

    if (!elements.rowControls || !elements.rowControlsList) {
        return;
    }

    if (state.rowTargets.length === 0) {
        elements.rowControls.hidden = true;
        elements.rowControlsList.innerHTML = "";
        return;
    }

    const hiddenSet = new Set(state.hiddenStepIndexes);

    elements.rowControls.hidden = false;
    elements.rowControlsList.innerHTML = state.rowTargets.map((target) => {
        const atoms = (target.atoms || []).map((atom) => (
            `<li class="cockpit-row-target__atom">${atom}</li>`
        )).join("");

        return `
            <details class="cockpit-row-target"${target.hidden ? "" : " open"}>
                <summary class="cockpit-row-target__summary">
                    <label class="cockpit-row-target__toggle">
                        <input
                            type="checkbox"
                            class="cockpit-row-target__checkbox"
                            data-step-index="${target.stepIndex}"
                            ${hiddenSet.has(target.stepIndex) ? "" : "checked"}
                        >
                        <span class="cockpit-row-target__label">${target.label}</span>
                    </label>
                </summary>
                <ul class="cockpit-row-target__atoms">
                    ${atoms}
                </ul>
            </details>
        `;
    }).join("");
}

function buildColorControls(colorTargets = [], colorPalette = [], componentColors = {}) {
    state.colorTargets = Array.isArray(colorTargets) ? colorTargets : [];
    state.colorPalette = Array.isArray(colorPalette) ? colorPalette : [];
    state.componentColors = pruneComponentColors(state.colorTargets, componentColors);

    if (state.colorTargets.length === 0) {
        elements.colorControls.hidden = true;
        elements.colorControlsList.innerHTML = "";
        return;
    }

    elements.colorControls.hidden = false;
    elements.colorControlsList.innerHTML = state.colorTargets.map((target) => {
        const swatches = state.colorPalette.map((entry) => {
            const isSelected = (state.componentColors[target.id] || "") === entry.value;
            const isEmpty = entry.value.length === 0;
            const style = isEmpty ? "" : ` style="--swatch-color: ${entry.value};"`;
            const emptyClass = isEmpty ? " cockpit-color-swatch--empty" : "";

            return `
                <button
                    type="button"
                    class="cockpit-color-swatch${emptyClass}${isSelected ? " is-active" : ""}"
                    data-target-id="${target.id}"
                    data-color-value="${entry.value}"
                    aria-pressed="${isSelected ? "true" : "false"}"
                    title="${entry.label}"
                    aria-label="${entry.label}"${style}
                ></button>
            `;
        }).join("");

        return `
            <article class="cockpit-color-target">
                ${target.stepLabel ? `<p class="cockpit-color-target__step">${target.stepLabel}</p>` : ""}
                <p class="cockpit-color-target__label">${target.previewLabel || target.family || target.id}</p>
                <div class="cockpit-color-target__palette" role="group" aria-label="${target.previewLabel || target.id}">
                    ${swatches}
                </div>
            </article>
        `;
    }).join("");
}

async function requestRender(equation, targetVariable, runtimeEngine) {
    const response = await fetch("/api/render", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            equation,
            targetVariable,
            runtimeEngine,
            componentColors: state.componentColors,
            hiddenStepIndexes: state.hiddenStepIndexes,
            powerInverseStyle: state.powerInverseStyle
        })
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.fehler || "Rendern fehlgeschlagen.");
    }

    return payload;
}

async function handleSubmit(event) {
    event?.preventDefault?.();

    const equation = elements.equationInput.value.trim();
    const targetVariable = elements.targetVariableInput.value.trim();
    const runtimeEngine = state.runtimeEngine;
    state.powerInverseStyle = elements.powerInverseStyleInput?.value === "fractional-exponent"
        ? "fractional-exponent"
        : "root";

    if (window.location.protocol === "file:") {
        redirectToCockpitServer(equation, targetVariable, runtimeEngine, state.powerInverseStyle);
        return;
    }

    if (!equation) {
        showPlaceholder("Bitte zuerst rechts eine Gleichung eingeben.");
        setStatus("Es fehlt eine Gleichung.", true);
        return;
    }

    elements.startButton.disabled = true;
    setStatus("Produktiver Renderlauf...");

    try {
        const payload = await requestRender(equation, targetVariable, runtimeEngine);
        showPreviewArtifacts(payload.previewArtifact, payload.pdfArtifact);
        state.runtimeEngine = payload.runtimeEngine || "";
        state.powerInverseStyle = payload.powerInverseStyle === "fractional-exponent"
            ? "fractional-exponent"
            : "root";
        if (elements.powerInverseStyleInput) {
            elements.powerInverseStyleInput.value = state.powerInverseStyle;
        }
        buildRowControls(payload.rowTargets || [], payload.hiddenStepIndexes || []);
        writeStateToUrl(payload.equation, payload.targetVariable || "", state.runtimeEngine, state.powerInverseStyle);
        buildColorControls(payload.colorTargets || [], payload.colorPalette || [], payload.componentColors || {});
        setStatus("");
    } catch (error) {
        showPlaceholder(error instanceof Error ? error.message : String(error));
        elements.pdfLink.hidden = true;
        buildRowControls(state.rowTargets || [], state.hiddenStepIndexes || []);
        buildColorControls([], [], {});
        setStatus(error instanceof Error ? error.message : String(error), true);
    } finally {
        elements.startButton.disabled = false;
    }
}

function initFromUrl() {
    const initialState = readStateFromUrl();

    if (window.location.protocol === "file:") {
        redirectToCockpitServer(
            initialState.equation,
            initialState.targetVariable,
            initialState.runtimeEngine,
            initialState.powerInverseStyle
        );
        return;
    }

    elements.equationInput.value = initialState.equation;
    elements.targetVariableInput.value = initialState.targetVariable;
    state.runtimeEngine = initialState.runtimeEngine;
    state.powerInverseStyle = initialState.powerInverseStyle;
    if (elements.powerInverseStyleInput) {
        elements.powerInverseStyleInput.value = state.powerInverseStyle;
    }

    if (initialState.equation) {
        handleSubmit(new Event("submit"));
        return;
    }

    showPlaceholder("Rechts eine Gleichung eingeben und Start / Go druecken.");
    buildRowControls([], []);
    buildColorControls([], [], {});
    setStatus("");
}

function scheduleAutoRender() {
    window.clearTimeout(autoRenderTimer);
    autoRenderTimer = window.setTimeout(() => {
        handleSubmit();
    }, 120);
}

elements.form.addEventListener("submit", handleSubmit);
elements.rowControlsList?.addEventListener("click", (event) => {
    const checkbox = event.target instanceof HTMLInputElement ? event.target : null;
    if (checkbox?.classList.contains("cockpit-row-target__checkbox")) {
        event.stopPropagation();
    }
});
elements.rowControlsList?.addEventListener("change", (event) => {
    const checkbox = event.target instanceof HTMLInputElement ? event.target : null;

    if (!checkbox?.classList.contains("cockpit-row-target__checkbox")) {
        return;
    }

    const stepIndex = Number(checkbox.dataset.stepIndex);
    if (!Number.isInteger(stepIndex)) {
        return;
    }

    if (checkbox.checked) {
        state.hiddenStepIndexes = state.hiddenStepIndexes.filter((value) => value !== stepIndex);
    } else if (!state.hiddenStepIndexes.includes(stepIndex)) {
        state.hiddenStepIndexes = [...state.hiddenStepIndexes, stepIndex].sort((left, right) => left - right);
    }

    scheduleAutoRender();
});
elements.colorControlsList.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLButtonElement ? event.target : null;
    const targetId = button?.dataset?.targetId || null;

    if (!button || !targetId) {
        return;
    }

    const colorValue = button.dataset.colorValue || "";

    if (colorValue) {
        state.componentColors[targetId] = colorValue;
    } else {
        delete state.componentColors[targetId];
    }

    scheduleAutoRender();
});
elements.powerInverseStyleInput?.addEventListener("change", () => {
    state.powerInverseStyle = elements.powerInverseStyleInput.value === "fractional-exponent"
        ? "fractional-exponent"
        : "root";
    scheduleAutoRender();
});
window.addEventListener("DOMContentLoaded", initFromUrl);
