import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyInventory = [
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/bruch_mechanik.test.js",
    status: "archiviert",
    reason:
      "haengt an der vorkanonischen 0-3-Architektur und importiert den nicht mehr produktiven Pfad core/2_Umformung/Regelwerk.js",
    replacedBy: [
      "./active/core_solve_flow.test.js",
      "../core/P2_Strategie_Analyse/Validierung.test.js",
      "../core/P3_Umformung/Validierung.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/topologie_check.test.js",
    status: "archiviert",
    reason:
      "prueft eine alte flache Topologie-API ueber core/3_Projektion/Regelwerk.js; die fachliche Idee lebt jetzt im produktiven P4-Zwei-Durchlauf",
    replacedBy: ["./active/p4_positionstreue.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/core/fraction_transformation.test.js",
    status: "archiviert",
    reason:
      "importiert die alte transformation/fraction_logic-Schicht statt der heutigen Familienkette ueber P2, P3 und core/index.js",
    replacedBy: ["./active/core_solve_flow.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/core/integration_full_flow.test.js",
    status: "archiviert",
    reason:
      "haengt an alten transformation/- und topology/-Pfaden; Bruch- und Positionstreue werden heute ueber den produktiven Solve-Flow geprueft",
    replacedBy: [
      "./active/p4_positionstreue.test.js",
      "./active/p4_mehrschritt_positionstreue.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/core/monster_scaling.test.js",
    status: "archiviert",
    reason:
      "setzt eine alte Nennerdarstellung voraus, in der alle Nennerteile auf exakt derselben Spalte liegen; die heutige Regel zentriert mehrteilige Nenner symmetrisch um die Bruchspalte",
    replacedBy: ["./active/p4_positionstreue.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/core/topology_final.test.js",
    status: "archiviert",
    reason:
      "bindet an den alten topology-Pfad und an lokale Spaltenannahmen wie x==col0 statt an die heutige globale PreFlight-Ankerlogik",
    replacedBy: [
      "./active/p4_positionstreue.test.js",
      "./active/p4_mehrschritt_positionstreue.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/core_solve_flow_pre_genesis.test.js",
    status: "archiviert",
    reason:
      "prueft den vorkanonischen Standardlauf mit reservierten Zukunftsspalten, flowDirection und gebuendelten Schalen statt den verbindlichen GenesisRuntime-Vertrag",
    replacedBy: ["./active/core_solve_flow.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/target_variable_selection_pre_genesis.test.js",
    status: "archiviert",
    reason:
      "bindet Zielvariablenwahl und Geometrie an den alten Standardlauf; die aktive Pruefung verlangt nun ausdruecklich den GenesisRuntime-Prozess",
    replacedBy: ["./active/target_variable_selection.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/cosine_law_gamma_pre_genesis.test.js",
    status: "archiviert",
    reason:
      "erwartet die vorkanonische gebuendelte cos(gamma)-Darstellung; Genesis exportiert Funktionsname, Klammern und Inhalt atomar",
    replacedBy: ["./active/cosine_law_gamma.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/cockpit_color_targets_pre_genesis.test.js",
    status: "archiviert",
    reason:
      "erwartet aus alten Zeilentexten geratene Cockpit-Farbziele statt der kanonischen Theoriebaum- und Atom-Selektoren",
    replacedBy: [
      "./active/cockpit_color_targets.test.js",
      "./active/cockpit_theory_labels.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/worksheet_display_model_pre_atomic.test.js",
    status: "archiviert",
    reason:
      "verlangt gebuendelte Root-Zellen und einen vom DisplayModel erfundenen Root-Vorslot statt atomarer P4-Schalenprimitive",
    replacedBy: ["./active/worksheet_display_model.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/law_of_sines_display_slot_fidelity_pre_atomic.test.js",
    status: "archiviert",
    reason:
      "sucht synthetische closed_visible_shell-Zaehler ueber fest verdrahtete alte IDs statt ueber P4-Quellidentitaeten",
    replacedBy: ["./active/law_of_sines_display_slot_fidelity.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/law_of_sines_birth_fraction_band_shells_pre_atomic.test.js",
    status: "archiviert",
    reason:
      "verlangt synthetische bandbreite Zaehler-COLLECTIONs statt atomarer Zaehlerzellen plus P4-Bruchspanne",
    replacedBy: [
      "./active/law_of_sines_start_shell_primitives.test.js",
      "./active/law_of_sines_display_slot_fidelity.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/root_chrome_overlay_contract_pre_atomic.test.js",
    status: "archiviert",
    reason:
      "verlangt eine im ViewModel gebuendelte Root-Chrome-Zelle und gebuendelte Potenztexte statt atomarer P4-Primitive",
    replacedBy: [
      "./active/genesis_runtime_p4_projection.test.js",
      "./active/genesis_runtime_view_model_columns.test.js",
      "./active/worksheet_display_model.test.js"
    ]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/bridge_worksheet_final_render_pre_atomic.test.js",
    status: "archiviert",
    reason: "importiert die entfernte Aggregationshilfe stepLayout.js und prueft alte LaTeX-Makrofragmente",
    replacedBy: ["./active/bridge_worksheet_final_render.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_closed_shell_cells_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "liest ausschliesslich Knoten des entfernten pFourCell-Sammelrenderers aus",
    replacedBy: ["./active/latex_atomic_projection_rendering.test.js", "./active/latex_export_display_slot_fidelity.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_fraction_child_visual_centering_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "fordert eine nachtraegliche Renderer-Zentrierung atomarer Zaehlerzellen",
    replacedBy: ["./active/law_of_sines_display_slot_fidelity.test.js", "./active/latex_export_display_slot_fidelity.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_fraction_consumption_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "fordert das Konsumieren atomarer Bruchkinder in eine gemeinsame pFourFraction-Zelle",
    replacedBy: ["./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_fraction_edge_alignment_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "prueft alte pFourCell-, pFourBottomAlign- und gebuendelte log_B-Makros",
    replacedBy: ["./active/active_runtime_export_wrappers.test.js", "./active/latex_export_display_slot_fidelity.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_nested_fraction_centering_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "bindet verschachtelte Brueche und Funktionen an alte pFourCell- und hrule-Knotenformen",
    replacedBy: ["./active/bridge_worksheet_final_render.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_p4_column_layout_pre_atomic.test.js",
    status: "archiviert",
    reason: "vermischt Column Layout, Solverfamilien und Sammelrenderer in einem Test",
    replacedBy: ["./active/latex_p4_column_layout.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_p4_export_pre_atomic.test.js",
    status: "archiviert",
    reason: "ist ein breiter Systemtest fuer die entfernte pFour-Makrofamilie",
    replacedBy: ["./active/active_runtime_export_wrappers.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/latex_power_inverse_rendering_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "verlangt zusammengesetzte Potenz- und inverse Potenzmakros aus mehreren P4-Zellen",
    replacedBy: ["./active/genesis_runtime_p4_projection.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/logarithm_notation_regression_pre_atomic.test.js",
    status: "archiviert",
    reason: "vermischt Core, Cockpit, Delimitergeometrie und alte LaTeX-Aggregate",
    replacedBy: ["./active/logarithm_notation_regression.test.js", "./active/active_runtime_export_wrappers.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/root_shell_projection_export_pre_atomic.test.js",
    status: "archiviert",
    reason: "fordert eine synthetische pFourRoot-Gesamtzelle statt getrennter Wurzelprimitive",
    replacedBy: ["./active/genesis_runtime_view_model_columns.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_target_entrypoint_pre_atomic.test.js",
    status: "archiviert",
    reason: "erklaert die rekonstruktiven Scene-Plan-, Root- und Group-APIs zum oeffentlichen Pflichtumfang",
    replacedBy: ["./active/renderer_kernel_target_entrypoint.test.js", "./active/renderer_kernel_render_scene_ingest.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_scene_plan_pre_atomic.test.js",
    status: "archiviert",
    reason: "gruppiert atomare Szenenknoten erneut zu abgeleiteten Shell-Tracks",
    replacedBy: ["./active/renderer_kernel_render_scene_ingest.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_root_geometry_plan_pre_atomic.test.js",
    status: "archiviert",
    reason: "fordert aus geometrischem Einschluss rekonstruierte Wurzelkinder und Inhaltsbounds",
    replacedBy: ["./active/genesis_runtime_p4_projection.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_root_projection_pre_atomic.test.js",
    status: "archiviert",
    reason: "baut eine gemeinsame Wurzelprojektion aus rekonstruierten Root-Tracks",
    replacedBy: ["./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_group_geometry_plan_pre_atomic.test.js",
    status: "archiviert",
    reason: "entdeckt Gruppeninhalt und Kindschalen durch geometrischen Einschluss",
    replacedBy: ["./active/genesis_runtime_p4_projection.test.js", "./active/latex_atomic_projection_rendering.test.js"]
  },
  {
    path: "../alt/2026-09-10_pre_genesis_tests/tests/legacy/renderer_kernel_group_projection_pre_atomic.test.js",
    status: "archiviert",
    reason: "baut Klammerpaare aus rekonstruierten Group-Tracks statt gelieferte Klammerzellen einzeln zu setzen",
    replacedBy: ["./active/latex_atomic_projection_rendering.test.js"]
  }
].map((entry) => ({
  ...entry,
  absolutePath: path.resolve(__dirname, entry.path)
}));

const statusCounts = new Map();

console.log("Legacy-Audit: historische Testspur");
console.log("Stand: 10. September 2026; ausserhalb der aktiven Tests archiviert");

for (const entry of legacyInventory) {
  statusCounts.set(entry.status, (statusCounts.get(entry.status) || 0) + 1);

  console.log(`\n- ${path.relative(process.cwd(), entry.absolutePath)}`);
  console.log(`  Status: ${entry.status}`);
  console.log(`  Grund: ${entry.reason}`);
  console.log(`  Nachfolger: ${entry.replacedBy.join(", ")}`);
}

console.log("\nZusammenfassung:");
for (const [status, count] of statusCounts.entries()) {
  console.log(`- ${status}: ${count}`);
}

console.log("\nDer Legacy-Audit fuehrt keine archivierten Altpfade mehr aus.");
