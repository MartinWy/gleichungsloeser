export const RENDERER_KERNEL_ROOT_DEBUG_DATA = {
  "generatedAt": "2026-08-09T19:22:06.839Z",
  "source": "renderer_kernel_root_debug_v1",
  "examples": [
    {
      "id": "nested-function-root",
      "title": "Funktion ueber Wurzel",
      "equation": "sin(sqrt(x))=3",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Startszene mit Funktion und verschachtelter Wurzel.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "trig_inverse",
        "root_power"
      ],
      "layout": {
        "anchorColumn": 11,
        "columnCount": 22,
        "rowCount": 3,
        "visualRowCount": 6,
        "stackedVisualRowCount": 6,
        "minColumn": 0,
        "maxColumn": 17,
        "minAbsoluteRow": 0,
        "maxAbsoluteRow": 1
      },
      "rowMeta": {
        "rowIndex": 0,
        "sourceRowId": "r0",
        "absoluteRowStart": 0,
        "absoluteRowEnd": 1,
        "axisAbsoluteRow": 1,
        "axisLocalRow": 1,
        "localRowCount": 2,
        "stackRowStart": 0,
        "stackRowEnd": 1,
        "axisStackedRow": 1
      },
      "counts": {
        "sceneNodes": 10,
        "shellTracks": 2,
        "rootTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 4,
          "maxColumn": 6,
          "spanWidth": 3,
          "shellTrackIds": [
            "shell-root-e-1n26vmj-0001"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        },
        {
          "id": "projection-0::row-band::1",
          "absoluteRow": 1,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 17,
          "spanWidth": 18,
          "shellTrackIds": [
            "shell-root-e-1n26vmj-0001",
            "shell-function-e-1n26vmj-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-e-1n26vmj-0001::0"
          ],
          "anchorColumns": [
            11
          ]
        }
      ],
      "nodes": [
        {
          "id": "r0::shell::root_overbar::shell-root-e-1n26vmj-0001:root_overbar::1",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "shell-root-e-1n26vmj-0001",
          "sourceShellId": "shell-root-e-1n26vmj-0001",
          "shellTrackId": "shell-root-e-1n26vmj-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": null,
            "colStart": 4,
            "colEnd": 6
          }
        },
        {
          "id": "r0::shell::function_name::shell-function-e-1n26vmj-0001:function_name::1",
          "type": "function",
          "text": "sin",
          "projectionRole": "function_name",
          "sourceAtomId": "shell-function-e-1n26vmj-0001",
          "sourceShellId": "shell-function-e-1n26vmj-0001",
          "shellTrackId": "shell-function-e-1n26vmj-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 0,
            "colStart": 0,
            "colEnd": 0
          }
        },
        {
          "id": "shell-function-e-1n26vmj-0001",
          "type": "function",
          "text": "",
          "projectionRole": "function",
          "sourceAtomId": "shell-function-e-1n26vmj-0001",
          "sourceShellId": null,
          "shellTrackId": "shell-function-e-1n26vmj-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 4,
            "colStart": 0,
            "colEnd": 8
          }
        },
        {
          "id": "r0::shell::function_left_paren::shell-function-e-1n26vmj-0001:paren_left::2",
          "type": "function",
          "text": "(",
          "projectionRole": "function_left",
          "sourceAtomId": "shell-function-e-1n26vmj-0001",
          "sourceShellId": "shell-function-e-1n26vmj-0001",
          "shellTrackId": "shell-function-e-1n26vmj-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 2,
            "colStart": 2,
            "colEnd": 2
          }
        },
        {
          "id": "r0::shell::root_hook::shell-root-e-1n26vmj-0001:root_hook::0",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "shell-root-e-1n26vmj-0001",
          "sourceShellId": "shell-root-e-1n26vmj-0001",
          "shellTrackId": "shell-root-e-1n26vmj-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 4,
            "colStart": 4,
            "colEnd": 4
          }
        },
        {
          "id": "shell-root-e-1n26vmj-0001",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "shell-root-e-1n26vmj-0001",
          "sourceShellId": "shell-function-e-1n26vmj-0001",
          "shellTrackId": "shell-root-e-1n26vmj-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 5,
            "colStart": 4,
            "colEnd": 6
          }
        },
        {
          "id": "r0::content::content::atom-variable-e-1n26vmj-0001::0",
          "type": "root",
          "text": "x",
          "projectionRole": "root_content",
          "sourceAtomId": "atom-variable-e-1n26vmj-0001",
          "sourceShellId": "shell-root-e-1n26vmj-0001",
          "shellTrackId": "shell-root-e-1n26vmj-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": true,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 6,
            "colStart": 6,
            "colEnd": 6
          }
        },
        {
          "id": "r0::shell::function_right_paren::shell-function-e-1n26vmj-0001:paren_right::3",
          "type": "function",
          "text": ")",
          "projectionRole": "function_right",
          "sourceAtomId": "shell-function-e-1n26vmj-0001",
          "sourceShellId": "shell-function-e-1n26vmj-0001",
          "shellTrackId": "shell-function-e-1n26vmj-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 8,
            "colStart": 8,
            "colEnd": 8
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-e-1n26vmj-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-e-1n26vmj-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 11,
            "colStart": 11,
            "colEnd": 11
          }
        },
        {
          "id": "r0::content::content::atom-number-e-1n26vmj-0001::0",
          "type": "atom",
          "text": "3",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-e-1n26vmj-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 17,
            "colStart": 17,
            "colEnd": 17
          }
        }
      ],
      "shellTracks": [
        {
          "id": "shell-function-e-1n26vmj-0001",
          "kind": "function",
          "functionName": "sin",
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 8,
          "memberCount": 4,
          "hasFocusMember": false,
          "projectionRoles": [
            "function_name",
            "function",
            "function_left",
            "function_right"
          ],
          "memberTexts": [
            "sin",
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::function_name::shell-function-e-1n26vmj-0001:function_name::1",
            "shell-function-e-1n26vmj-0001",
            "r0::shell::function_left_paren::shell-function-e-1n26vmj-0001:paren_left::2",
            "r0::shell::function_right_paren::shell-function-e-1n26vmj-0001:paren_right::3"
          ],
          "sourceAtomIds": [
            "shell-function-e-1n26vmj-0001"
          ],
          "sourceShellIds": [
            "shell-function-e-1n26vmj-0001"
          ],
          "members": [
            {
              "id": "r0::shell::function_name::shell-function-e-1n26vmj-0001:function_name::1",
              "type": "function",
              "text": "sin",
              "projectionRole": "function_name",
              "sourceAtomId": "shell-function-e-1n26vmj-0001",
              "sourceShellId": "shell-function-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-function-e-1n26vmj-0001",
              "type": "function",
              "text": "",
              "projectionRole": "function",
              "sourceAtomId": "shell-function-e-1n26vmj-0001",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 8
            },
            {
              "id": "r0::shell::function_left_paren::shell-function-e-1n26vmj-0001:paren_left::2",
              "type": "function",
              "text": "(",
              "projectionRole": "function_left",
              "sourceAtomId": "shell-function-e-1n26vmj-0001",
              "sourceShellId": "shell-function-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "r0::shell::function_right_paren::shell-function-e-1n26vmj-0001:paren_right::3",
              "type": "function",
              "text": ")",
              "projectionRole": "function_right",
              "sourceAtomId": "shell-function-e-1n26vmj-0001",
              "sourceShellId": "shell-function-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 8,
              "colEnd": 8
            }
          ]
        },
        {
          "id": "shell-root-e-1n26vmj-0001",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 4,
          "maxColumn": 6,
          "memberCount": 4,
          "hasFocusMember": true,
          "projectionRoles": [
            "root_overbar",
            "root_hook",
            "root",
            "root_content"
          ],
          "memberTexts": [
            "sqrt",
            "x"
          ],
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-e-1n26vmj-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-e-1n26vmj-0001:root_hook::0",
            "shell-root-e-1n26vmj-0001",
            "r0::content::content::atom-variable-e-1n26vmj-0001::0"
          ],
          "sourceAtomIds": [
            "shell-root-e-1n26vmj-0001",
            "atom-variable-e-1n26vmj-0001"
          ],
          "sourceShellIds": [
            "shell-root-e-1n26vmj-0001",
            "shell-function-e-1n26vmj-0001"
          ],
          "members": [
            {
              "id": "r0::shell::root_overbar::shell-root-e-1n26vmj-0001:root_overbar::1",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "shell-root-e-1n26vmj-0001",
              "sourceShellId": "shell-root-e-1n26vmj-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 4,
              "colEnd": 6
            },
            {
              "id": "r0::shell::root_hook::shell-root-e-1n26vmj-0001:root_hook::0",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "shell-root-e-1n26vmj-0001",
              "sourceShellId": "shell-root-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 4
            },
            {
              "id": "shell-root-e-1n26vmj-0001",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "shell-root-e-1n26vmj-0001",
              "sourceShellId": "shell-function-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 6
            },
            {
              "id": "r0::content::content::atom-variable-e-1n26vmj-0001::0",
              "type": "root",
              "text": "x",
              "projectionRole": "root_content",
              "sourceAtomId": "atom-variable-e-1n26vmj-0001",
              "sourceShellId": "shell-root-e-1n26vmj-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 6,
              "colEnd": 6
            }
          ]
        }
      ],
      "rootTracks": [
        {
          "id": "projection-0::root-geometry::shell-root-e-1n26vmj-0001",
          "shellTrackId": "shell-root-e-1n26vmj-0001",
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-e-1n26vmj-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-e-1n26vmj-0001:root_hook::0",
            "shell-root-e-1n26vmj-0001",
            "r0::content::content::atom-variable-e-1n26vmj-0001::0"
          ],
          "structuralNodeIds": [
            "r0::shell::root_overbar::shell-root-e-1n26vmj-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-e-1n26vmj-0001:root_hook::0",
            "shell-root-e-1n26vmj-0001"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-e-1n26vmj-0001::0"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 6
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 6
          },
          "hookBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 4
          },
          "overbarBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 4,
            "maxColumn": 6
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 6,
            "maxColumn": 6
          },
          "axisAbsoluteRow": 1,
          "overbarAbsoluteRow": 0,
          "hookColumn": 4,
          "contentColumnStart": 6,
          "contentColumnEnd": 6,
          "focusIds": [
            "r0::content::content::atom-variable-e-1n26vmj-0001::0"
          ],
          "verticalProfile": {
            "topRow": 0,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "root-sequence",
      "title": "Wurzel ueber linearem Inhalt",
      "equation": "2*sqrt(x+3)=5",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Die Wurzel liegt ueber einem einfachen inhaltlichen Term.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "fraction_birth",
        "root_power",
        "addition_release"
      ],
      "layout": {
        "anchorColumn": 19,
        "columnCount": 54,
        "rowCount": 4,
        "visualRowCount": 11,
        "stackedVisualRowCount": 11,
        "minColumn": 0,
        "maxColumn": 21,
        "minAbsoluteRow": 0,
        "maxAbsoluteRow": 1
      },
      "rowMeta": {
        "rowIndex": 0,
        "sourceRowId": "r0",
        "absoluteRowStart": 0,
        "absoluteRowEnd": 1,
        "axisAbsoluteRow": 1,
        "axisLocalRow": 1,
        "localRowCount": 2,
        "stackRowStart": 0,
        "stackRowEnd": 1,
        "axisStackedRow": 1
      },
      "counts": {
        "sceneNodes": 10,
        "shellTracks": 1,
        "rootTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 6,
          "maxColumn": 16,
          "spanWidth": 11,
          "shellTrackIds": [
            "shell-root-d-182jqiq-0001"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        },
        {
          "id": "projection-0::row-band::1",
          "absoluteRow": 1,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 21,
          "spanWidth": 22,
          "shellTrackIds": [
            "shell-root-d-182jqiq-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-d-182jqiq-0001::2"
          ],
          "anchorColumns": [
            19
          ]
        }
      ],
      "nodes": [
        {
          "id": "r0::shell::root_overbar::shell-root-d-182jqiq-0001:root_overbar::1",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "shell-root-d-182jqiq-0001",
          "sourceShellId": "shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": null,
            "colStart": 6,
            "colEnd": 16
          }
        },
        {
          "id": "r0::content::content::atom-number-d-182jqiq-0001::0",
          "type": "atom",
          "text": "2",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-d-182jqiq-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 0,
            "colStart": 0,
            "colEnd": 0
          }
        },
        {
          "id": "r0::content::content::atom-operator-d-182jqiq-0001::1",
          "type": "atom",
          "text": "*",
          "projectionRole": "content",
          "sourceAtomId": "atom-operator-d-182jqiq-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 4,
            "colStart": 4,
            "colEnd": 4
          }
        },
        {
          "id": "r0::shell::root_hook::shell-root-d-182jqiq-0001:root_hook::0",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "shell-root-d-182jqiq-0001",
          "sourceShellId": "shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 6,
            "colStart": 6,
            "colEnd": 6
          }
        },
        {
          "id": "shell-root-d-182jqiq-0001",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "shell-root-d-182jqiq-0001",
          "sourceShellId": null,
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 11,
            "colStart": 6,
            "colEnd": 16
          }
        },
        {
          "id": "r0::content::content::atom-variable-d-182jqiq-0001::2",
          "type": "root",
          "text": "x",
          "projectionRole": "root_content",
          "sourceAtomId": "atom-variable-d-182jqiq-0001",
          "sourceShellId": "shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": true,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 8,
            "colStart": 8,
            "colEnd": 8
          }
        },
        {
          "id": "r0::content::content::atom-operator-d-182jqiq-0002::3",
          "type": "root",
          "text": "+",
          "projectionRole": "root_content",
          "sourceAtomId": "atom-operator-d-182jqiq-0002",
          "sourceShellId": "shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 12,
            "colStart": 12,
            "colEnd": 12
          }
        },
        {
          "id": "r0::content::content::atom-number-d-182jqiq-0002::4",
          "type": "root",
          "text": "3",
          "projectionRole": "root_content",
          "sourceAtomId": "atom-number-d-182jqiq-0002",
          "sourceShellId": "shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 16,
            "colStart": 16,
            "colEnd": 16
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-d-182jqiq-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-d-182jqiq-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 19,
            "colStart": 19,
            "colEnd": 19
          }
        },
        {
          "id": "r0::content::content::atom-number-d-182jqiq-0003::0",
          "type": "atom",
          "text": "5",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-d-182jqiq-0003",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 21,
            "colStart": 21,
            "colEnd": 21
          }
        }
      ],
      "shellTracks": [
        {
          "id": "shell-root-d-182jqiq-0001",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 6,
          "maxColumn": 16,
          "memberCount": 6,
          "hasFocusMember": true,
          "projectionRoles": [
            "root_overbar",
            "root_hook",
            "root",
            "root_content"
          ],
          "memberTexts": [
            "sqrt",
            "x",
            "+",
            "3"
          ],
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-d-182jqiq-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-d-182jqiq-0001:root_hook::0",
            "shell-root-d-182jqiq-0001",
            "r0::content::content::atom-variable-d-182jqiq-0001::2",
            "r0::content::content::atom-operator-d-182jqiq-0002::3",
            "r0::content::content::atom-number-d-182jqiq-0002::4"
          ],
          "sourceAtomIds": [
            "shell-root-d-182jqiq-0001",
            "atom-variable-d-182jqiq-0001",
            "atom-operator-d-182jqiq-0002",
            "atom-number-d-182jqiq-0002"
          ],
          "sourceShellIds": [
            "shell-root-d-182jqiq-0001"
          ],
          "members": [
            {
              "id": "r0::shell::root_overbar::shell-root-d-182jqiq-0001:root_overbar::1",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "shell-root-d-182jqiq-0001",
              "sourceShellId": "shell-root-d-182jqiq-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 6,
              "colEnd": 16
            },
            {
              "id": "r0::shell::root_hook::shell-root-d-182jqiq-0001:root_hook::0",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "shell-root-d-182jqiq-0001",
              "sourceShellId": "shell-root-d-182jqiq-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 6,
              "colEnd": 6
            },
            {
              "id": "shell-root-d-182jqiq-0001",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "shell-root-d-182jqiq-0001",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 6,
              "colEnd": 16
            },
            {
              "id": "r0::content::content::atom-variable-d-182jqiq-0001::2",
              "type": "root",
              "text": "x",
              "projectionRole": "root_content",
              "sourceAtomId": "atom-variable-d-182jqiq-0001",
              "sourceShellId": "shell-root-d-182jqiq-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 8,
              "colEnd": 8
            },
            {
              "id": "r0::content::content::atom-operator-d-182jqiq-0002::3",
              "type": "root",
              "text": "+",
              "projectionRole": "root_content",
              "sourceAtomId": "atom-operator-d-182jqiq-0002",
              "sourceShellId": "shell-root-d-182jqiq-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 12,
              "colEnd": 12
            },
            {
              "id": "r0::content::content::atom-number-d-182jqiq-0002::4",
              "type": "root",
              "text": "3",
              "projectionRole": "root_content",
              "sourceAtomId": "atom-number-d-182jqiq-0002",
              "sourceShellId": "shell-root-d-182jqiq-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 16,
              "colEnd": 16
            }
          ]
        }
      ],
      "rootTracks": [
        {
          "id": "projection-0::root-geometry::shell-root-d-182jqiq-0001",
          "shellTrackId": "shell-root-d-182jqiq-0001",
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-d-182jqiq-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-d-182jqiq-0001:root_hook::0",
            "shell-root-d-182jqiq-0001",
            "r0::content::content::atom-variable-d-182jqiq-0001::2",
            "r0::content::content::atom-operator-d-182jqiq-0002::3",
            "r0::content::content::atom-number-d-182jqiq-0002::4"
          ],
          "structuralNodeIds": [
            "r0::shell::root_overbar::shell-root-d-182jqiq-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-d-182jqiq-0001:root_hook::0",
            "shell-root-d-182jqiq-0001"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-d-182jqiq-0001::2",
            "r0::content::content::atom-operator-d-182jqiq-0002::3",
            "r0::content::content::atom-number-d-182jqiq-0002::4"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 6,
            "maxColumn": 16
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 6,
            "maxColumn": 16
          },
          "hookBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 6,
            "maxColumn": 6
          },
          "overbarBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 6,
            "maxColumn": 16
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 8,
            "maxColumn": 16
          },
          "axisAbsoluteRow": 1,
          "overbarAbsoluteRow": 0,
          "hookColumn": 6,
          "contentColumnStart": 8,
          "contentColumnEnd": 16,
          "focusIds": [
            "r0::content::content::atom-variable-d-182jqiq-0001::2"
          ],
          "verticalProfile": {
            "topRow": 0,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "nested-roots",
      "title": "Verschachtelte Wurzeln",
      "equation": "sqrt(sqrt(x))=5",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Zwei Wurzelspuren in einer Szene. Gut geeignet, um Kindspuren und Mehrfachprojektionen zu pruefen.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "root_power",
        "root_power"
      ],
      "layout": {
        "anchorColumn": 7,
        "columnCount": 14,
        "rowCount": 3,
        "visualRowCount": 6,
        "stackedVisualRowCount": 6,
        "minColumn": 0,
        "maxColumn": 9,
        "minAbsoluteRow": 0,
        "maxAbsoluteRow": 1
      },
      "rowMeta": {
        "rowIndex": 0,
        "sourceRowId": "r0",
        "absoluteRowStart": 0,
        "absoluteRowEnd": 1,
        "axisAbsoluteRow": 1,
        "axisLocalRow": 1,
        "localRowCount": 2,
        "stackRowStart": 0,
        "stackRowEnd": 1,
        "axisStackedRow": 1
      },
      "counts": {
        "sceneNodes": 9,
        "shellTracks": 2,
        "rootTracks": 2
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 0,
          "maxColumn": 4,
          "spanWidth": 5,
          "shellTrackIds": [
            "shell-root-f-1c9h81n-0001",
            "shell-root-f-1c9h81n-0002"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        },
        {
          "id": "projection-0::row-band::1",
          "absoluteRow": 1,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 9,
          "spanWidth": 10,
          "shellTrackIds": [
            "shell-root-f-1c9h81n-0001",
            "shell-root-f-1c9h81n-0002"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "anchorColumns": [
            7
          ]
        }
      ],
      "nodes": [
        {
          "id": "r0::shell::root_overbar::shell-root-f-1c9h81n-0002:root_overbar::2",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "shell-root-f-1c9h81n-0002",
          "sourceShellId": "shell-root-f-1c9h81n-0002",
          "shellTrackId": "shell-root-f-1c9h81n-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": null,
            "colStart": 0,
            "colEnd": 4
          }
        },
        {
          "id": "r0::shell::root_overbar::shell-root-f-1c9h81n-0001:root_overbar::1",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "shell-root-f-1c9h81n-0001",
          "sourceShellId": "shell-root-f-1c9h81n-0001",
          "shellTrackId": "shell-root-f-1c9h81n-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": null,
            "colStart": 2,
            "colEnd": 4
          }
        },
        {
          "id": "r0::shell::root_hook::shell-root-f-1c9h81n-0002:root_hook::1",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "shell-root-f-1c9h81n-0002",
          "sourceShellId": "shell-root-f-1c9h81n-0002",
          "shellTrackId": "shell-root-f-1c9h81n-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 0,
            "colStart": 0,
            "colEnd": 0
          }
        },
        {
          "id": "shell-root-f-1c9h81n-0002",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "shell-root-f-1c9h81n-0002",
          "sourceShellId": null,
          "shellTrackId": "shell-root-f-1c9h81n-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 2,
            "colStart": 0,
            "colEnd": 4
          }
        },
        {
          "id": "r0::shell::root_hook::shell-root-f-1c9h81n-0001:root_hook::0",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "shell-root-f-1c9h81n-0001",
          "sourceShellId": "shell-root-f-1c9h81n-0001",
          "shellTrackId": "shell-root-f-1c9h81n-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 2,
            "colStart": 2,
            "colEnd": 2
          }
        },
        {
          "id": "shell-root-f-1c9h81n-0001",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "shell-root-f-1c9h81n-0001",
          "sourceShellId": "shell-root-f-1c9h81n-0002",
          "shellTrackId": "shell-root-f-1c9h81n-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 3,
            "colStart": 2,
            "colEnd": 4
          }
        },
        {
          "id": "r0::content::content::atom-variable-f-1c9h81n-0001::0",
          "type": "root",
          "text": "x",
          "projectionRole": "root_content",
          "sourceAtomId": "atom-variable-f-1c9h81n-0001",
          "sourceShellId": "shell-root-f-1c9h81n-0001",
          "shellTrackId": "shell-root-f-1c9h81n-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": true,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 4,
            "colStart": 4,
            "colEnd": 4
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-f-1c9h81n-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-f-1c9h81n-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 7,
            "colStart": 7,
            "colEnd": 7
          }
        },
        {
          "id": "r0::content::content::atom-number-f-1c9h81n-0001::0",
          "type": "atom",
          "text": "5",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-f-1c9h81n-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 9,
            "colStart": 9,
            "colEnd": 9
          }
        }
      ],
      "shellTracks": [
        {
          "id": "shell-root-f-1c9h81n-0001",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 2,
          "maxColumn": 4,
          "memberCount": 4,
          "hasFocusMember": true,
          "projectionRoles": [
            "root_overbar",
            "root_hook",
            "root",
            "root_content"
          ],
          "memberTexts": [
            "sqrt",
            "x"
          ],
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0001:root_hook::0",
            "shell-root-f-1c9h81n-0001",
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "sourceAtomIds": [
            "shell-root-f-1c9h81n-0001",
            "atom-variable-f-1c9h81n-0001"
          ],
          "sourceShellIds": [
            "shell-root-f-1c9h81n-0001",
            "shell-root-f-1c9h81n-0002"
          ],
          "members": [
            {
              "id": "r0::shell::root_overbar::shell-root-f-1c9h81n-0001:root_overbar::1",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "shell-root-f-1c9h81n-0001",
              "sourceShellId": "shell-root-f-1c9h81n-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 2,
              "colEnd": 4
            },
            {
              "id": "r0::shell::root_hook::shell-root-f-1c9h81n-0001:root_hook::0",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "shell-root-f-1c9h81n-0001",
              "sourceShellId": "shell-root-f-1c9h81n-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "shell-root-f-1c9h81n-0001",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "shell-root-f-1c9h81n-0001",
              "sourceShellId": "shell-root-f-1c9h81n-0002",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 4
            },
            {
              "id": "r0::content::content::atom-variable-f-1c9h81n-0001::0",
              "type": "root",
              "text": "x",
              "projectionRole": "root_content",
              "sourceAtomId": "atom-variable-f-1c9h81n-0001",
              "sourceShellId": "shell-root-f-1c9h81n-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 4
            }
          ]
        },
        {
          "id": "shell-root-f-1c9h81n-0002",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 4,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "root_overbar",
            "root_hook",
            "root"
          ],
          "memberTexts": [
            "sqrt"
          ],
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0002:root_overbar::2",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0002:root_hook::1",
            "shell-root-f-1c9h81n-0002"
          ],
          "sourceAtomIds": [
            "shell-root-f-1c9h81n-0002"
          ],
          "sourceShellIds": [
            "shell-root-f-1c9h81n-0002"
          ],
          "members": [
            {
              "id": "r0::shell::root_overbar::shell-root-f-1c9h81n-0002:root_overbar::2",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "shell-root-f-1c9h81n-0002",
              "sourceShellId": "shell-root-f-1c9h81n-0002",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 0,
              "colEnd": 4
            },
            {
              "id": "r0::shell::root_hook::shell-root-f-1c9h81n-0002:root_hook::1",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "shell-root-f-1c9h81n-0002",
              "sourceShellId": "shell-root-f-1c9h81n-0002",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-root-f-1c9h81n-0002",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "shell-root-f-1c9h81n-0002",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 4
            }
          ]
        }
      ],
      "rootTracks": [
        {
          "id": "projection-0::root-geometry::shell-root-f-1c9h81n-0002",
          "shellTrackId": "shell-root-f-1c9h81n-0002",
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0002:root_overbar::2",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0002:root_hook::1",
            "shell-root-f-1c9h81n-0002"
          ],
          "structuralNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0002:root_overbar::2",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0002:root_hook::1",
            "shell-root-f-1c9h81n-0002"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "childShellTrackIds": [
            "shell-root-f-1c9h81n-0001"
          ],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 4
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 4
          },
          "hookBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 0
          },
          "overbarBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 0,
            "maxColumn": 4
          },
          "contentBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 4
          },
          "axisAbsoluteRow": 1,
          "overbarAbsoluteRow": 0,
          "hookColumn": 0,
          "contentColumnStart": 2,
          "contentColumnEnd": 4,
          "focusIds": [
            "r0::content::content::atom-variable-f-1c9h81n-0001::0",
            "shell-root-f-1c9h81n-0001"
          ],
          "verticalProfile": {
            "topRow": 0,
            "axisRow": 1,
            "bottomRow": 1
          }
        },
        {
          "id": "projection-0::root-geometry::shell-root-f-1c9h81n-0001",
          "shellTrackId": "shell-root-f-1c9h81n-0001",
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0001:root_hook::0",
            "shell-root-f-1c9h81n-0001",
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "structuralNodeIds": [
            "r0::shell::root_overbar::shell-root-f-1c9h81n-0001:root_overbar::1",
            "r0::shell::root_hook::shell-root-f-1c9h81n-0001:root_hook::0",
            "shell-root-f-1c9h81n-0001"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 4
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 4
          },
          "hookBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 2
          },
          "overbarBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 2,
            "maxColumn": 4
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 4
          },
          "axisAbsoluteRow": 1,
          "overbarAbsoluteRow": 0,
          "hookColumn": 2,
          "contentColumnStart": 4,
          "contentColumnEnd": 4,
          "focusIds": [
            "r0::content::content::atom-variable-f-1c9h81n-0001::0"
          ],
          "verticalProfile": {
            "topRow": 0,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "root-over-fraction-diagnostic",
      "title": "Wurzel ueber Bruch",
      "equation": "sqrt((x+1)/(2-a))=5",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Bewusster Diagnosefall: die Wurzelzeichnung zeigt hier auch, ob der gelieferte Szenenraum den Nenner vollstaendig umfasst.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "root_power",
        "fraction_collapse",
        "addition_release"
      ],
      "layout": {
        "anchorColumn": 29,
        "columnCount": 52,
        "rowCount": 4,
        "visualRowCount": 10,
        "stackedVisualRowCount": 10,
        "minColumn": 0,
        "maxColumn": 31,
        "minAbsoluteRow": 0,
        "maxAbsoluteRow": 2
      },
      "rowMeta": {
        "rowIndex": 0,
        "sourceRowId": "r0",
        "absoluteRowStart": 0,
        "absoluteRowEnd": 2,
        "axisAbsoluteRow": 1,
        "axisLocalRow": 1,
        "localRowCount": 3,
        "stackRowStart": 0,
        "stackRowEnd": 2,
        "axisStackedRow": 1
      },
      "counts": {
        "sceneNodes": 19,
        "shellTracks": 4,
        "rootTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 0,
          "maxColumn": 26,
          "spanWidth": 27,
          "shellTrackIds": [
            "shell-division-j-1erym2x-0001",
            "shell-group-j-1erym2x-0001",
            "shell-root-j-1erym2x-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-j-1erym2x-0001::0"
          ],
          "anchorColumns": []
        },
        {
          "id": "projection-0::row-band::1",
          "absoluteRow": 1,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 31,
          "spanWidth": 32,
          "shellTrackIds": [
            "shell-division-j-1erym2x-0001",
            "shell-root-j-1erym2x-0001",
            "shell-group-j-1erym2x-0001",
            "shell-group-j-1erym2x-0002"
          ],
          "focusNodeIds": [],
          "anchorColumns": [
            29
          ]
        },
        {
          "id": "projection-0::row-band::2",
          "absoluteRow": 2,
          "rowKind": "below_axis",
          "localRowOffset": 2,
          "minColumn": 14,
          "maxColumn": 26,
          "spanWidth": 13,
          "shellTrackIds": [
            "shell-division-j-1erym2x-0001",
            "shell-group-j-1erym2x-0002"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        }
      ],
      "nodes": [
        {
          "id": "r0::shell::root_overbar::shell-root-j-1erym2x-0001:root_overbar::4",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "shell-root-j-1erym2x-0001",
          "sourceShellId": "shell-root-j-1erym2x-0001",
          "shellTrackId": "shell-root-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": null,
            "colStart": 0,
            "colEnd": 26
          }
        },
        {
          "id": "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-j-1erym2x-0001",
          "sourceShellId": "shell-group-j-1erym2x-0001",
          "shellTrackId": "shell-group-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 2,
            "colStart": 2,
            "colEnd": 2
          }
        },
        {
          "id": "r0::content::content::atom-variable-j-1erym2x-0001::0",
          "type": "division",
          "text": "x",
          "projectionRole": "numerator",
          "sourceAtomId": "atom-variable-j-1erym2x-0001",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": true,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 4,
            "colStart": 4,
            "colEnd": 4
          }
        },
        {
          "id": "r0::content::content::atom-operator-j-1erym2x-0001::1",
          "type": "division",
          "text": "+",
          "projectionRole": "numerator",
          "sourceAtomId": "atom-operator-j-1erym2x-0001",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 8,
            "colStart": 8,
            "colEnd": 8
          }
        },
        {
          "id": "r0::content::content::atom-number-j-1erym2x-0001::2",
          "type": "division",
          "text": "1",
          "projectionRole": "numerator",
          "sourceAtomId": "atom-number-j-1erym2x-0001",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 12,
            "colStart": 12,
            "colEnd": 12
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-j-1erym2x-0001",
          "sourceShellId": "shell-group-j-1erym2x-0001",
          "shellTrackId": "shell-group-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 14,
            "colStart": 14,
            "colEnd": 14
          }
        },
        {
          "id": "r0::shell::root_hook::shell-root-j-1erym2x-0001:root_hook::3",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "shell-root-j-1erym2x-0001",
          "sourceShellId": "shell-root-j-1erym2x-0001",
          "shellTrackId": "shell-root-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 0,
            "colStart": 0,
            "colEnd": 0
          }
        },
        {
          "id": "shell-root-j-1erym2x-0001",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "shell-root-j-1erym2x-0001",
          "sourceShellId": null,
          "shellTrackId": "shell-root-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 13,
            "colStart": 0,
            "colEnd": 26
          }
        },
        {
          "id": "r0::shell::fraction_line::shell-division-j-1erym2x-0001:fraction_line::2",
          "type": "fraction_line",
          "text": "",
          "projectionRole": "fraction_line",
          "sourceAtomId": "shell-division-j-1erym2x-0001",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": null,
            "colStart": 2,
            "colEnd": 26
          }
        },
        {
          "id": "shell-division-j-1erym2x-0001",
          "type": "division",
          "text": "",
          "projectionRole": "fraction",
          "sourceAtomId": "shell-division-j-1erym2x-0001",
          "sourceShellId": "shell-root-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 14,
            "colStart": 2,
            "colEnd": 26
          }
        },
        {
          "id": "shell-group-j-1erym2x-0001",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-j-1erym2x-0001",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-group-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 8,
            "colStart": 2,
            "colEnd": 14
          }
        },
        {
          "id": "shell-group-j-1erym2x-0002",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-j-1erym2x-0002",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-group-j-1erym2x-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 20,
            "colStart": 14,
            "colEnd": 26
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-j-1erym2x-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-j-1erym2x-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 29,
            "colStart": 29,
            "colEnd": 29
          }
        },
        {
          "id": "r0::content::content::atom-number-j-1erym2x-0003::0",
          "type": "atom",
          "text": "5",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-j-1erym2x-0003",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 31,
            "colStart": 31,
            "colEnd": 31
          }
        },
        {
          "id": "r0::shell::group_left_paren::shell-group-j-1erym2x-0002:paren_left::1",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-j-1erym2x-0002",
          "sourceShellId": "shell-group-j-1erym2x-0002",
          "shellTrackId": "shell-group-j-1erym2x-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 14,
            "colStart": 14,
            "colEnd": 14
          }
        },
        {
          "id": "r0::content::content::atom-number-j-1erym2x-0002::3",
          "type": "division",
          "text": "2",
          "projectionRole": "denominator",
          "sourceAtomId": "atom-number-j-1erym2x-0002",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 16,
            "colStart": 16,
            "colEnd": 16
          }
        },
        {
          "id": "r0::content::content::atom-operator-j-1erym2x-0003::4",
          "type": "division",
          "text": "-",
          "projectionRole": "denominator",
          "sourceAtomId": "atom-operator-j-1erym2x-0003",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 20,
            "colStart": 20,
            "colEnd": 20
          }
        },
        {
          "id": "r0::content::content::atom-variable-j-1erym2x-0002::5",
          "type": "division",
          "text": "a",
          "projectionRole": "denominator",
          "sourceAtomId": "atom-variable-j-1erym2x-0002",
          "sourceShellId": "shell-division-j-1erym2x-0001",
          "shellTrackId": "shell-division-j-1erym2x-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 24,
            "colStart": 24,
            "colEnd": 24
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-j-1erym2x-0002:paren_right::2",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-j-1erym2x-0002",
          "sourceShellId": "shell-group-j-1erym2x-0002",
          "shellTrackId": "shell-group-j-1erym2x-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 26,
            "colStart": 26,
            "colEnd": 26
          }
        }
      ],
      "shellTracks": [
        {
          "id": "shell-division-j-1erym2x-0001",
          "kind": "division",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 2,
          "minColumn": 2,
          "maxColumn": 26,
          "memberCount": 8,
          "hasFocusMember": true,
          "projectionRoles": [
            "numerator",
            "fraction_line",
            "fraction",
            "denominator"
          ],
          "memberTexts": [
            "x",
            "+",
            "1",
            "2",
            "-",
            "a"
          ],
          "memberNodeIds": [
            "r0::content::content::atom-variable-j-1erym2x-0001::0",
            "r0::content::content::atom-operator-j-1erym2x-0001::1",
            "r0::content::content::atom-number-j-1erym2x-0001::2",
            "r0::shell::fraction_line::shell-division-j-1erym2x-0001:fraction_line::2",
            "shell-division-j-1erym2x-0001",
            "r0::content::content::atom-number-j-1erym2x-0002::3",
            "r0::content::content::atom-operator-j-1erym2x-0003::4",
            "r0::content::content::atom-variable-j-1erym2x-0002::5"
          ],
          "sourceAtomIds": [
            "atom-variable-j-1erym2x-0001",
            "atom-operator-j-1erym2x-0001",
            "atom-number-j-1erym2x-0001",
            "shell-division-j-1erym2x-0001",
            "atom-number-j-1erym2x-0002",
            "atom-operator-j-1erym2x-0003",
            "atom-variable-j-1erym2x-0002"
          ],
          "sourceShellIds": [
            "shell-division-j-1erym2x-0001",
            "shell-root-j-1erym2x-0001"
          ],
          "members": [
            {
              "id": "r0::content::content::atom-variable-j-1erym2x-0001::0",
              "type": "division",
              "text": "x",
              "projectionRole": "numerator",
              "sourceAtomId": "atom-variable-j-1erym2x-0001",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 4,
              "colEnd": 4
            },
            {
              "id": "r0::content::content::atom-operator-j-1erym2x-0001::1",
              "type": "division",
              "text": "+",
              "projectionRole": "numerator",
              "sourceAtomId": "atom-operator-j-1erym2x-0001",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 8,
              "colEnd": 8
            },
            {
              "id": "r0::content::content::atom-number-j-1erym2x-0001::2",
              "type": "division",
              "text": "1",
              "projectionRole": "numerator",
              "sourceAtomId": "atom-number-j-1erym2x-0001",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 12,
              "colEnd": 12
            },
            {
              "id": "r0::shell::fraction_line::shell-division-j-1erym2x-0001:fraction_line::2",
              "type": "fraction_line",
              "text": "",
              "projectionRole": "fraction_line",
              "sourceAtomId": "shell-division-j-1erym2x-0001",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 26
            },
            {
              "id": "shell-division-j-1erym2x-0001",
              "type": "division",
              "text": "",
              "projectionRole": "fraction",
              "sourceAtomId": "shell-division-j-1erym2x-0001",
              "sourceShellId": "shell-root-j-1erym2x-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 26
            },
            {
              "id": "r0::content::content::atom-number-j-1erym2x-0002::3",
              "type": "division",
              "text": "2",
              "projectionRole": "denominator",
              "sourceAtomId": "atom-number-j-1erym2x-0002",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 16,
              "colEnd": 16
            },
            {
              "id": "r0::content::content::atom-operator-j-1erym2x-0003::4",
              "type": "division",
              "text": "-",
              "projectionRole": "denominator",
              "sourceAtomId": "atom-operator-j-1erym2x-0003",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 20,
              "colEnd": 20
            },
            {
              "id": "r0::content::content::atom-variable-j-1erym2x-0002::5",
              "type": "division",
              "text": "a",
              "projectionRole": "denominator",
              "sourceAtomId": "atom-variable-j-1erym2x-0002",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 24,
              "colEnd": 24
            }
          ]
        },
        {
          "id": "shell-group-j-1erym2x-0001",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 2,
          "maxColumn": 14,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group_left",
            "group_right",
            "group"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1",
            "shell-group-j-1erym2x-0001"
          ],
          "sourceAtomIds": [
            "shell-group-j-1erym2x-0001"
          ],
          "sourceShellIds": [
            "shell-group-j-1erym2x-0001",
            "shell-division-j-1erym2x-0001"
          ],
          "members": [
            {
              "id": "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-j-1erym2x-0001",
              "sourceShellId": "shell-group-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-j-1erym2x-0001",
              "sourceShellId": "shell-group-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 14,
              "colEnd": 14
            },
            {
              "id": "shell-group-j-1erym2x-0001",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-j-1erym2x-0001",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 14
            }
          ]
        },
        {
          "id": "shell-group-j-1erym2x-0002",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 2,
          "minColumn": 14,
          "maxColumn": 26,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group",
            "group_left",
            "group_right"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "shell-group-j-1erym2x-0002",
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0002:paren_left::1",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0002:paren_right::2"
          ],
          "sourceAtomIds": [
            "shell-group-j-1erym2x-0002"
          ],
          "sourceShellIds": [
            "shell-division-j-1erym2x-0001",
            "shell-group-j-1erym2x-0002"
          ],
          "members": [
            {
              "id": "shell-group-j-1erym2x-0002",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-j-1erym2x-0002",
              "sourceShellId": "shell-division-j-1erym2x-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 14,
              "colEnd": 26
            },
            {
              "id": "r0::shell::group_left_paren::shell-group-j-1erym2x-0002:paren_left::1",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-j-1erym2x-0002",
              "sourceShellId": "shell-group-j-1erym2x-0002",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 14,
              "colEnd": 14
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-j-1erym2x-0002:paren_right::2",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-j-1erym2x-0002",
              "sourceShellId": "shell-group-j-1erym2x-0002",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 26,
              "colEnd": 26
            }
          ]
        },
        {
          "id": "shell-root-j-1erym2x-0001",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 26,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "root_overbar",
            "root_hook",
            "root"
          ],
          "memberTexts": [
            "sqrt"
          ],
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-j-1erym2x-0001:root_overbar::4",
            "r0::shell::root_hook::shell-root-j-1erym2x-0001:root_hook::3",
            "shell-root-j-1erym2x-0001"
          ],
          "sourceAtomIds": [
            "shell-root-j-1erym2x-0001"
          ],
          "sourceShellIds": [
            "shell-root-j-1erym2x-0001"
          ],
          "members": [
            {
              "id": "r0::shell::root_overbar::shell-root-j-1erym2x-0001:root_overbar::4",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "shell-root-j-1erym2x-0001",
              "sourceShellId": "shell-root-j-1erym2x-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 0,
              "colEnd": 26
            },
            {
              "id": "r0::shell::root_hook::shell-root-j-1erym2x-0001:root_hook::3",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "shell-root-j-1erym2x-0001",
              "sourceShellId": "shell-root-j-1erym2x-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-root-j-1erym2x-0001",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "shell-root-j-1erym2x-0001",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 26
            }
          ]
        }
      ],
      "rootTracks": [
        {
          "id": "projection-0::root-geometry::shell-root-j-1erym2x-0001",
          "shellTrackId": "shell-root-j-1erym2x-0001",
          "memberNodeIds": [
            "r0::shell::root_overbar::shell-root-j-1erym2x-0001:root_overbar::4",
            "r0::shell::root_hook::shell-root-j-1erym2x-0001:root_hook::3",
            "shell-root-j-1erym2x-0001"
          ],
          "structuralNodeIds": [
            "r0::shell::root_overbar::shell-root-j-1erym2x-0001:root_overbar::4",
            "r0::shell::root_hook::shell-root-j-1erym2x-0001:root_hook::3",
            "shell-root-j-1erym2x-0001"
          ],
          "contentNodeIds": [
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
            "r0::content::content::atom-variable-j-1erym2x-0001::0",
            "r0::content::content::atom-operator-j-1erym2x-0001::1",
            "r0::content::content::atom-number-j-1erym2x-0001::2",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1"
          ],
          "childShellTrackIds": [
            "shell-group-j-1erym2x-0001"
          ],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 26
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 26
          },
          "hookBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 0
          },
          "overbarBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 0,
            "maxColumn": 26
          },
          "contentBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 14
          },
          "axisAbsoluteRow": 1,
          "overbarAbsoluteRow": 0,
          "hookColumn": 0,
          "contentColumnStart": 2,
          "contentColumnEnd": 14,
          "focusIds": [
            "r0::content::content::atom-variable-j-1erym2x-0001::0"
          ],
          "verticalProfile": {
            "topRow": 0,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "pythagoras-final-root",
      "title": "Spaete Wurzelszene mit Potenzen",
      "equation": "a^2+b^2=c^2",
      "targetVariable": "a",
      "sceneIndex": 2,
      "note": "Spaete Szene nach dem Umbau: Wurzel ueber Potenzen und innerer Shell-Struktur.",
      "sceneId": "projection-2",
      "strategyFamilies": [
        "addition_release",
        "root_power"
      ],
      "layout": {
        "anchorColumn": 13,
        "columnCount": 24,
        "rowCount": 3,
        "visualRowCount": 6,
        "stackedVisualRowCount": 6,
        "minColumn": 0,
        "maxColumn": 23,
        "minAbsoluteRow": 4,
        "maxAbsoluteRow": 5
      },
      "rowMeta": {
        "rowIndex": 2,
        "sourceRowId": "r2",
        "absoluteRowStart": 4,
        "absoluteRowEnd": 5,
        "axisAbsoluteRow": 5,
        "axisLocalRow": 1,
        "localRowCount": 2,
        "stackRowStart": 4,
        "stackRowEnd": 5,
        "axisStackedRow": 5
      },
      "counts": {
        "sceneNodes": 13,
        "shellTracks": 4,
        "rootTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-2::row-band::4",
          "absoluteRow": 4,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 15,
          "maxColumn": 23,
          "spanWidth": 9,
          "shellTrackIds": [
            "shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0003",
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        },
        {
          "id": "projection-2::row-band::5",
          "absoluteRow": 5,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 23,
          "spanWidth": 24,
          "shellTrackIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
            "shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0003"
          ],
          "focusNodeIds": [
            "r2::content::content::atom-variable-b-1gm5xsx-0001::0"
          ],
          "anchorColumns": [
            13
          ]
        }
      ],
      "nodes": [
        {
          "id": "r2::shell::root_overbar::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_overbar::4",
          "type": "root",
          "text": "",
          "projectionRole": "root_overbar",
          "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "shellTrackId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "functionName": null,
          "visualMode": "INVERSE_SHELL",
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 0,
            "absoluteRow": 4,
            "stackedRow": 4,
            "col": null,
            "colStart": 15,
            "colEnd": 23
          }
        },
        {
          "id": "shell-power-b-1gm5xsx-0003",
          "type": "power",
          "text": "",
          "projectionRole": "power",
          "sourceAtomId": "shell-power-b-1gm5xsx-0003",
          "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "shellTrackId": "shell-power-b-1gm5xsx-0003",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 0,
            "absoluteRow": 4,
            "stackedRow": 4,
            "col": 18,
            "colStart": 17,
            "colEnd": 19
          }
        },
        {
          "id": "r2::shell::power_exponent::shell-power-b-1gm5xsx-0003:power_exponent::0",
          "type": "power",
          "text": "2",
          "projectionRole": "power_exponent",
          "sourceAtomId": "shell-power-b-1gm5xsx-0003",
          "sourceShellId": "shell-power-b-1gm5xsx-0003",
          "shellTrackId": "shell-power-b-1gm5xsx-0003",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 0,
            "absoluteRow": 4,
            "stackedRow": 4,
            "col": 19,
            "colStart": 19,
            "colEnd": 19
          }
        },
        {
          "id": "shell-power-b-1gm5xsx-0002",
          "type": "power",
          "text": "",
          "projectionRole": "power",
          "sourceAtomId": "shell-power-b-1gm5xsx-0002",
          "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "shellTrackId": "shell-power-b-1gm5xsx-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 0,
            "absoluteRow": 4,
            "stackedRow": 4,
            "col": 22,
            "colStart": 21,
            "colEnd": 23
          }
        },
        {
          "id": "r2::shell::power_exponent::shell-power-b-1gm5xsx-0002:power_exponent::1",
          "type": "power",
          "text": "2",
          "projectionRole": "power_exponent",
          "sourceAtomId": "shell-power-b-1gm5xsx-0002",
          "sourceShellId": "shell-power-b-1gm5xsx-0002",
          "shellTrackId": "shell-power-b-1gm5xsx-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 0,
            "absoluteRow": 4,
            "stackedRow": 4,
            "col": 23,
            "colStart": 23,
            "colEnd": 23
          }
        },
        {
          "id": "r2::content::content::atom-variable-b-1gm5xsx-0001::0",
          "type": "atom",
          "text": "a",
          "projectionRole": "content",
          "sourceAtomId": "atom-variable-b-1gm5xsx-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": "EMERGED",
          "isFocus": true,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 0,
            "colStart": 0,
            "colEnd": 0
          }
        },
        {
          "id": "r2::anchor::equation_anchor::atom-anchor-b-1gm5xsx-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-b-1gm5xsx-0001",
          "sourceShellId": null,
          "shellTrackId": null,
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 13,
            "colStart": 13,
            "colEnd": 13
          }
        },
        {
          "id": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "type": "root",
          "text": "",
          "projectionRole": "root",
          "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "sourceShellId": null,
          "shellTrackId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "functionName": null,
          "visualMode": "INVERSE_SHELL",
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 19,
            "colStart": 15,
            "colEnd": 23
          }
        },
        {
          "id": "r2::shell::root_hook::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_hook::3",
          "type": "root",
          "text": "sqrt",
          "projectionRole": "root_hook",
          "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "shellTrackId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "functionName": null,
          "visualMode": "INVERSE_SHELL",
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 15,
            "colStart": 15,
            "colEnd": 15
          }
        },
        {
          "id": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "type": "group",
          "text": "",
          "projectionRole": "inverse_shell",
          "sourceAtomId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "shellTrackId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "functionName": null,
          "visualMode": "INVERSE_SHELL",
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 20,
            "colStart": 17,
            "colEnd": 23
          }
        },
        {
          "id": "r2::content::content::atom-variable-b-1gm5xsx-0003::0",
          "type": "power",
          "text": "c",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-variable-b-1gm5xsx-0003",
          "sourceShellId": "shell-power-b-1gm5xsx-0003",
          "shellTrackId": "shell-power-b-1gm5xsx-0003",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 17,
            "colStart": 17,
            "colEnd": 17
          }
        },
        {
          "id": "r2::shell::subtraction_operator::generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002:subtraction_operator::2",
          "type": "group",
          "text": "-",
          "projectionRole": "inverse_operator",
          "sourceAtomId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "shellTrackId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "functionName": null,
          "visualMode": "INVERSE_SHELL",
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 20,
            "colStart": 20,
            "colEnd": 20
          }
        },
        {
          "id": "r2::content::content::atom-variable-b-1gm5xsx-0002::1",
          "type": "power",
          "text": "b",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-variable-b-1gm5xsx-0002",
          "sourceShellId": "shell-power-b-1gm5xsx-0002",
          "shellTrackId": "shell-power-b-1gm5xsx-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 2,
            "localRow": 1,
            "absoluteRow": 5,
            "stackedRow": 5,
            "col": 21,
            "colStart": 21,
            "colEnd": 21
          }
        }
      ],
      "shellTracks": [
        {
          "id": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 5,
          "maxAbsoluteRow": 5,
          "minColumn": 17,
          "maxColumn": 23,
          "memberCount": 2,
          "hasFocusMember": false,
          "projectionRoles": [
            "inverse_shell",
            "inverse_operator"
          ],
          "memberTexts": [
            "-"
          ],
          "memberNodeIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
            "r2::shell::subtraction_operator::generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002:subtraction_operator::2"
          ],
          "sourceAtomIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002"
          ],
          "sourceShellIds": [
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002"
          ],
          "members": [
            {
              "id": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "type": "group",
              "text": "",
              "projectionRole": "inverse_shell",
              "sourceAtomId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 17,
              "colEnd": 23
            },
            {
              "id": "r2::shell::subtraction_operator::generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002:subtraction_operator::2",
              "type": "group",
              "text": "-",
              "projectionRole": "inverse_operator",
              "sourceAtomId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 20,
              "colEnd": 20
            }
          ]
        },
        {
          "id": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "kind": "root",
          "functionName": null,
          "minAbsoluteRow": 4,
          "maxAbsoluteRow": 5,
          "minColumn": 15,
          "maxColumn": 23,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "root_overbar",
            "root",
            "root_hook"
          ],
          "memberTexts": [
            "sqrt"
          ],
          "memberNodeIds": [
            "r2::shell::root_overbar::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_overbar::4",
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
            "r2::shell::root_hook::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_hook::3"
          ],
          "sourceAtomIds": [
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001"
          ],
          "sourceShellIds": [
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001"
          ],
          "members": [
            {
              "id": "r2::shell::root_overbar::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_overbar::4",
              "type": "root",
              "text": "",
              "projectionRole": "root_overbar",
              "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "absoluteRow": 4,
              "localRow": 0,
              "stackedRow": 4,
              "colStart": 15,
              "colEnd": 23
            },
            {
              "id": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "type": "root",
              "text": "",
              "projectionRole": "root",
              "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "sourceShellId": null,
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 15,
              "colEnd": 23
            },
            {
              "id": "r2::shell::root_hook::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_hook::3",
              "type": "root",
              "text": "sqrt",
              "projectionRole": "root_hook",
              "sourceAtomId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "sourceShellId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 15,
              "colEnd": 15
            }
          ]
        },
        {
          "id": "shell-power-b-1gm5xsx-0002",
          "kind": "power",
          "functionName": null,
          "minAbsoluteRow": 4,
          "maxAbsoluteRow": 5,
          "minColumn": 21,
          "maxColumn": 23,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "power",
            "power_exponent",
            "power_base"
          ],
          "memberTexts": [
            "2",
            "b"
          ],
          "memberNodeIds": [
            "shell-power-b-1gm5xsx-0002",
            "r2::shell::power_exponent::shell-power-b-1gm5xsx-0002:power_exponent::1",
            "r2::content::content::atom-variable-b-1gm5xsx-0002::1"
          ],
          "sourceAtomIds": [
            "shell-power-b-1gm5xsx-0002",
            "atom-variable-b-1gm5xsx-0002"
          ],
          "sourceShellIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0002"
          ],
          "members": [
            {
              "id": "shell-power-b-1gm5xsx-0002",
              "type": "power",
              "text": "",
              "projectionRole": "power",
              "sourceAtomId": "shell-power-b-1gm5xsx-0002",
              "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "absoluteRow": 4,
              "localRow": 0,
              "stackedRow": 4,
              "colStart": 21,
              "colEnd": 23
            },
            {
              "id": "r2::shell::power_exponent::shell-power-b-1gm5xsx-0002:power_exponent::1",
              "type": "power",
              "text": "2",
              "projectionRole": "power_exponent",
              "sourceAtomId": "shell-power-b-1gm5xsx-0002",
              "sourceShellId": "shell-power-b-1gm5xsx-0002",
              "absoluteRow": 4,
              "localRow": 0,
              "stackedRow": 4,
              "colStart": 23,
              "colEnd": 23
            },
            {
              "id": "r2::content::content::atom-variable-b-1gm5xsx-0002::1",
              "type": "power",
              "text": "b",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-variable-b-1gm5xsx-0002",
              "sourceShellId": "shell-power-b-1gm5xsx-0002",
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 21,
              "colEnd": 21
            }
          ]
        },
        {
          "id": "shell-power-b-1gm5xsx-0003",
          "kind": "power",
          "functionName": null,
          "minAbsoluteRow": 4,
          "maxAbsoluteRow": 5,
          "minColumn": 17,
          "maxColumn": 19,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "power",
            "power_exponent",
            "power_base"
          ],
          "memberTexts": [
            "2",
            "c"
          ],
          "memberNodeIds": [
            "shell-power-b-1gm5xsx-0003",
            "r2::shell::power_exponent::shell-power-b-1gm5xsx-0003:power_exponent::0",
            "r2::content::content::atom-variable-b-1gm5xsx-0003::0"
          ],
          "sourceAtomIds": [
            "shell-power-b-1gm5xsx-0003",
            "atom-variable-b-1gm5xsx-0003"
          ],
          "sourceShellIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0003"
          ],
          "members": [
            {
              "id": "shell-power-b-1gm5xsx-0003",
              "type": "power",
              "text": "",
              "projectionRole": "power",
              "sourceAtomId": "shell-power-b-1gm5xsx-0003",
              "sourceShellId": "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
              "absoluteRow": 4,
              "localRow": 0,
              "stackedRow": 4,
              "colStart": 17,
              "colEnd": 19
            },
            {
              "id": "r2::shell::power_exponent::shell-power-b-1gm5xsx-0003:power_exponent::0",
              "type": "power",
              "text": "2",
              "projectionRole": "power_exponent",
              "sourceAtomId": "shell-power-b-1gm5xsx-0003",
              "sourceShellId": "shell-power-b-1gm5xsx-0003",
              "absoluteRow": 4,
              "localRow": 0,
              "stackedRow": 4,
              "colStart": 19,
              "colEnd": 19
            },
            {
              "id": "r2::content::content::atom-variable-b-1gm5xsx-0003::0",
              "type": "power",
              "text": "c",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-variable-b-1gm5xsx-0003",
              "sourceShellId": "shell-power-b-1gm5xsx-0003",
              "absoluteRow": 5,
              "localRow": 1,
              "stackedRow": 5,
              "colStart": 17,
              "colEnd": 17
            }
          ]
        }
      ],
      "rootTracks": [
        {
          "id": "projection-2::root-geometry::generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "shellTrackId": "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
          "memberNodeIds": [
            "r2::shell::root_overbar::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_overbar::4",
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
            "r2::shell::root_hook::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_hook::3"
          ],
          "structuralNodeIds": [
            "r2::shell::root_overbar::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_overbar::4",
            "generated-root_power-root-from-shell-power-b-1gm5xsx-0001",
            "r2::shell::root_hook::generated-root_power-root-from-shell-power-b-1gm5xsx-0001:root_hook::3"
          ],
          "contentNodeIds": [
            "r2::shell::power_exponent::shell-power-b-1gm5xsx-0003:power_exponent::0",
            "r2::shell::power_exponent::shell-power-b-1gm5xsx-0002:power_exponent::1",
            "r2::content::content::atom-variable-b-1gm5xsx-0003::0",
            "r2::shell::subtraction_operator::generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002:subtraction_operator::2",
            "r2::content::content::atom-variable-b-1gm5xsx-0002::1"
          ],
          "childShellTrackIds": [
            "generated-addition_release-subtraction-from-shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0002",
            "shell-power-b-1gm5xsx-0003"
          ],
          "frameBounds": {
            "minAbsoluteRow": 4,
            "maxAbsoluteRow": 5,
            "minColumn": 15,
            "maxColumn": 23
          },
          "shellBounds": {
            "minAbsoluteRow": 5,
            "maxAbsoluteRow": 5,
            "minColumn": 15,
            "maxColumn": 23
          },
          "hookBounds": {
            "minAbsoluteRow": 5,
            "maxAbsoluteRow": 5,
            "minColumn": 15,
            "maxColumn": 15
          },
          "overbarBounds": {
            "minAbsoluteRow": 4,
            "maxAbsoluteRow": 4,
            "minColumn": 15,
            "maxColumn": 23
          },
          "contentBounds": {
            "minAbsoluteRow": 4,
            "maxAbsoluteRow": 5,
            "minColumn": 17,
            "maxColumn": 23
          },
          "axisAbsoluteRow": 5,
          "overbarAbsoluteRow": 4,
          "hookColumn": 15,
          "contentColumnStart": 17,
          "contentColumnEnd": 23,
          "focusIds": [],
          "verticalProfile": {
            "topRow": 4,
            "axisRow": 5,
            "bottomRow": 5
          }
        }
      ]
    }
  ]
};
export default RENDERER_KERNEL_ROOT_DEBUG_DATA;
