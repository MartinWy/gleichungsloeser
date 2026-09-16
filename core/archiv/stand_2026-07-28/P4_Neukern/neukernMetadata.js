export const P4_NEUKERN_MODULES = Object.freeze([
    Object.freeze({
        key: "global_semantic_raster",
        responsibility: "Legt die einzige globale Inhaltsspur fest."
    }),
    Object.freeze({
        key: "shell_blueprints",
        responsibility: "Beschreibt sichtbare Schalen ueber bestehenden Inhaltsspalten."
    }),
    Object.freeze({
        key: "projection_blocks",
        responsibility: "Definiert Achsenzeilen und Blockhoehen."
    }),
    Object.freeze({
        key: "projection_writer",
        responsibility: "Schreibt explizite Projektionsatome ohne neue Geometrie."
    }),
    Object.freeze({
        key: "output_contract",
        responsibility: "Stellt die stabile Ausgabestruktur fuer alle Medien bereit."
    })
]);

export const P4_NEUKERN_PRINCIPLES = Object.freeze([
    "one_semantic_raster",
    "no_local_relayout",
    "shells_wrap_existing_columns",
    "writers_only_emit",
    "renderers_do_not_reconstruct"
]);
