export const USER_EXPORT_CONTROL_DEFINITIONS = Object.freeze([
    {
        key: "previewImage",
        controlType: "preview-image",
        label: "Vorschau"
    },
    {
        key: "pdfLink",
        controlType: "pdf-link",
        label: "PDF"
    }
]);

export const USER_EXPORT_INVARIANTS = Object.freeze([
    "Preview und PDF muessen denselben Renderzustand zeigen.",
    "Export ist Verbraucher derselben Worksheet-Wahrheit."
]);
