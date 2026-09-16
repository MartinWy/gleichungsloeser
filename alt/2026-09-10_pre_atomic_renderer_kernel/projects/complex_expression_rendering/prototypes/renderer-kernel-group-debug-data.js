export const RENDERER_KERNEL_GROUP_DEBUG_DATA = {
  "generatedAt": "2026-08-09T19:45:09.265Z",
  "source": "renderer_kernel_group_debug_v1",
  "examples": [
    {
      "id": "power-group",
      "title": "Klammer vor Potenz",
      "equation": "sin((x+1)^2)=3",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Die Klammer bleibt als Schale stehen, waehrend die Potenz darueber liegt.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "trig_inverse",
        "root_power",
        "addition_release"
      ],
      "layout": {
        "anchorColumn": 23,
        "columnCount": 36,
        "rowCount": 4,
        "visualRowCount": 8,
        "stackedVisualRowCount": 8,
        "minColumn": 0,
        "maxColumn": 31,
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
        "sceneNodes": 14,
        "shellTracks": 3,
        "groupTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 4,
          "maxColumn": 18,
          "spanWidth": 15,
          "shellTrackIds": [
            "shell-power-e-1qjxhs5-0001"
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
          "maxColumn": 31,
          "spanWidth": 32,
          "shellTrackIds": [
            "shell-power-e-1qjxhs5-0001",
            "shell-function-e-1qjxhs5-0001",
            "shell-group-e-1qjxhs5-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-e-1qjxhs5-0001::0"
          ],
          "anchorColumns": [
            23
          ]
        }
      ],
      "nodes": [
        {
          "id": "shell-power-e-1qjxhs5-0001",
          "type": "power",
          "text": "",
          "projectionRole": "power",
          "sourceAtomId": "shell-power-e-1qjxhs5-0001",
          "sourceShellId": "shell-function-e-1qjxhs5-0001",
          "shellTrackId": "shell-power-e-1qjxhs5-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 11,
            "colStart": 4,
            "colEnd": 18
          }
        },
        {
          "id": "r0::shell::power_exponent::shell-power-e-1qjxhs5-0001:power_exponent::1",
          "type": "power",
          "text": "2",
          "projectionRole": "power_exponent",
          "sourceAtomId": "shell-power-e-1qjxhs5-0001",
          "sourceShellId": "shell-power-e-1qjxhs5-0001",
          "shellTrackId": "shell-power-e-1qjxhs5-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 18,
            "colStart": 18,
            "colEnd": 18
          }
        },
        {
          "id": "r0::shell::function_name::shell-function-e-1qjxhs5-0001:function_name::2",
          "type": "function",
          "text": "sin",
          "projectionRole": "function_name",
          "sourceAtomId": "shell-function-e-1qjxhs5-0001",
          "sourceShellId": "shell-function-e-1qjxhs5-0001",
          "shellTrackId": "shell-function-e-1qjxhs5-0001",
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
          "id": "shell-function-e-1qjxhs5-0001",
          "type": "function",
          "text": "",
          "projectionRole": "function",
          "sourceAtomId": "shell-function-e-1qjxhs5-0001",
          "sourceShellId": null,
          "shellTrackId": "shell-function-e-1qjxhs5-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 10,
            "colStart": 0,
            "colEnd": 20
          }
        },
        {
          "id": "r0::shell::function_left_paren::shell-function-e-1qjxhs5-0001:paren_left::3",
          "type": "function",
          "text": "(",
          "projectionRole": "function_left",
          "sourceAtomId": "shell-function-e-1qjxhs5-0001",
          "sourceShellId": "shell-function-e-1qjxhs5-0001",
          "shellTrackId": "shell-function-e-1qjxhs5-0001",
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
          "id": "r0::shell::group_left_paren::shell-group-e-1qjxhs5-0001:paren_left::0",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-e-1qjxhs5-0001",
          "sourceShellId": "shell-group-e-1qjxhs5-0001",
          "shellTrackId": "shell-group-e-1qjxhs5-0001",
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
          "id": "shell-group-e-1qjxhs5-0001",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-e-1qjxhs5-0001",
          "sourceShellId": "shell-power-e-1qjxhs5-0001",
          "shellTrackId": "shell-group-e-1qjxhs5-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 10,
            "colStart": 4,
            "colEnd": 16
          }
        },
        {
          "id": "r0::content::content::atom-variable-e-1qjxhs5-0001::0",
          "type": "power",
          "text": "x",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-variable-e-1qjxhs5-0001",
          "sourceShellId": "shell-power-e-1qjxhs5-0001",
          "shellTrackId": "shell-power-e-1qjxhs5-0001",
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
          "id": "r0::content::content::atom-operator-e-1qjxhs5-0001::1",
          "type": "power",
          "text": "+",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-operator-e-1qjxhs5-0001",
          "sourceShellId": "shell-power-e-1qjxhs5-0001",
          "shellTrackId": "shell-power-e-1qjxhs5-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 10,
            "colStart": 10,
            "colEnd": 10
          }
        },
        {
          "id": "r0::content::content::atom-number-e-1qjxhs5-0001::2",
          "type": "power",
          "text": "1",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-number-e-1qjxhs5-0001",
          "sourceShellId": "shell-power-e-1qjxhs5-0001",
          "shellTrackId": "shell-power-e-1qjxhs5-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 14,
            "colStart": 14,
            "colEnd": 14
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-e-1qjxhs5-0001:paren_right::1",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-e-1qjxhs5-0001",
          "sourceShellId": "shell-group-e-1qjxhs5-0001",
          "shellTrackId": "shell-group-e-1qjxhs5-0001",
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
          "id": "r0::shell::function_right_paren::shell-function-e-1qjxhs5-0001:paren_right::4",
          "type": "function",
          "text": ")",
          "projectionRole": "function_right",
          "sourceAtomId": "shell-function-e-1qjxhs5-0001",
          "sourceShellId": "shell-function-e-1qjxhs5-0001",
          "shellTrackId": "shell-function-e-1qjxhs5-0001",
          "functionName": "sin",
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 20,
            "colStart": 20,
            "colEnd": 20
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-e-1qjxhs5-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-e-1qjxhs5-0001",
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
            "col": 23,
            "colStart": 23,
            "colEnd": 23
          }
        },
        {
          "id": "r0::content::content::atom-number-e-1qjxhs5-0002::0",
          "type": "atom",
          "text": "3",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-e-1qjxhs5-0002",
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
        }
      ],
      "shellTracks": [
        {
          "id": "shell-function-e-1qjxhs5-0001",
          "kind": "function",
          "functionName": "sin",
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 20,
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
            "r0::shell::function_name::shell-function-e-1qjxhs5-0001:function_name::2",
            "shell-function-e-1qjxhs5-0001",
            "r0::shell::function_left_paren::shell-function-e-1qjxhs5-0001:paren_left::3",
            "r0::shell::function_right_paren::shell-function-e-1qjxhs5-0001:paren_right::4"
          ],
          "sourceAtomIds": [
            "shell-function-e-1qjxhs5-0001"
          ],
          "sourceShellIds": [
            "shell-function-e-1qjxhs5-0001"
          ],
          "members": [
            {
              "id": "r0::shell::function_name::shell-function-e-1qjxhs5-0001:function_name::2",
              "type": "function",
              "text": "sin",
              "projectionRole": "function_name",
              "sourceAtomId": "shell-function-e-1qjxhs5-0001",
              "sourceShellId": "shell-function-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-function-e-1qjxhs5-0001",
              "type": "function",
              "text": "",
              "projectionRole": "function",
              "sourceAtomId": "shell-function-e-1qjxhs5-0001",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 20
            },
            {
              "id": "r0::shell::function_left_paren::shell-function-e-1qjxhs5-0001:paren_left::3",
              "type": "function",
              "text": "(",
              "projectionRole": "function_left",
              "sourceAtomId": "shell-function-e-1qjxhs5-0001",
              "sourceShellId": "shell-function-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "r0::shell::function_right_paren::shell-function-e-1qjxhs5-0001:paren_right::4",
              "type": "function",
              "text": ")",
              "projectionRole": "function_right",
              "sourceAtomId": "shell-function-e-1qjxhs5-0001",
              "sourceShellId": "shell-function-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 20,
              "colEnd": 20
            }
          ]
        },
        {
          "id": "shell-group-e-1qjxhs5-0001",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 4,
          "maxColumn": 16,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group_left",
            "group",
            "group_right"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-e-1qjxhs5-0001:paren_left::0",
            "shell-group-e-1qjxhs5-0001",
            "r0::shell::group_right_paren::shell-group-e-1qjxhs5-0001:paren_right::1"
          ],
          "sourceAtomIds": [
            "shell-group-e-1qjxhs5-0001"
          ],
          "sourceShellIds": [
            "shell-group-e-1qjxhs5-0001",
            "shell-power-e-1qjxhs5-0001"
          ],
          "members": [
            {
              "id": "r0::shell::group_left_paren::shell-group-e-1qjxhs5-0001:paren_left::0",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-e-1qjxhs5-0001",
              "sourceShellId": "shell-group-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 4
            },
            {
              "id": "shell-group-e-1qjxhs5-0001",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-e-1qjxhs5-0001",
              "sourceShellId": "shell-power-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 16
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-e-1qjxhs5-0001:paren_right::1",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-e-1qjxhs5-0001",
              "sourceShellId": "shell-group-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 16,
              "colEnd": 16
            }
          ]
        },
        {
          "id": "shell-power-e-1qjxhs5-0001",
          "kind": "power",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 4,
          "maxColumn": 18,
          "memberCount": 5,
          "hasFocusMember": true,
          "projectionRoles": [
            "power",
            "power_exponent",
            "power_base"
          ],
          "memberTexts": [
            "2",
            "x",
            "+",
            "1"
          ],
          "memberNodeIds": [
            "shell-power-e-1qjxhs5-0001",
            "r0::shell::power_exponent::shell-power-e-1qjxhs5-0001:power_exponent::1",
            "r0::content::content::atom-variable-e-1qjxhs5-0001::0",
            "r0::content::content::atom-operator-e-1qjxhs5-0001::1",
            "r0::content::content::atom-number-e-1qjxhs5-0001::2"
          ],
          "sourceAtomIds": [
            "shell-power-e-1qjxhs5-0001",
            "atom-variable-e-1qjxhs5-0001",
            "atom-operator-e-1qjxhs5-0001",
            "atom-number-e-1qjxhs5-0001"
          ],
          "sourceShellIds": [
            "shell-function-e-1qjxhs5-0001",
            "shell-power-e-1qjxhs5-0001"
          ],
          "members": [
            {
              "id": "shell-power-e-1qjxhs5-0001",
              "type": "power",
              "text": "",
              "projectionRole": "power",
              "sourceAtomId": "shell-power-e-1qjxhs5-0001",
              "sourceShellId": "shell-function-e-1qjxhs5-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 4,
              "colEnd": 18
            },
            {
              "id": "r0::shell::power_exponent::shell-power-e-1qjxhs5-0001:power_exponent::1",
              "type": "power",
              "text": "2",
              "projectionRole": "power_exponent",
              "sourceAtomId": "shell-power-e-1qjxhs5-0001",
              "sourceShellId": "shell-power-e-1qjxhs5-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 18,
              "colEnd": 18
            },
            {
              "id": "r0::content::content::atom-variable-e-1qjxhs5-0001::0",
              "type": "power",
              "text": "x",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-variable-e-1qjxhs5-0001",
              "sourceShellId": "shell-power-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 6,
              "colEnd": 6
            },
            {
              "id": "r0::content::content::atom-operator-e-1qjxhs5-0001::1",
              "type": "power",
              "text": "+",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-operator-e-1qjxhs5-0001",
              "sourceShellId": "shell-power-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 10,
              "colEnd": 10
            },
            {
              "id": "r0::content::content::atom-number-e-1qjxhs5-0001::2",
              "type": "power",
              "text": "1",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-number-e-1qjxhs5-0001",
              "sourceShellId": "shell-power-e-1qjxhs5-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 14,
              "colEnd": 14
            }
          ]
        }
      ],
      "groupTracks": [
        {
          "id": "projection-0::group-geometry::shell-group-e-1qjxhs5-0001",
          "shellTrackId": "shell-group-e-1qjxhs5-0001",
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-e-1qjxhs5-0001:paren_left::0",
            "shell-group-e-1qjxhs5-0001",
            "r0::shell::group_right_paren::shell-group-e-1qjxhs5-0001:paren_right::1"
          ],
          "structuralNodeIds": [
            "r0::shell::group_left_paren::shell-group-e-1qjxhs5-0001:paren_left::0",
            "shell-group-e-1qjxhs5-0001",
            "r0::shell::group_right_paren::shell-group-e-1qjxhs5-0001:paren_right::1"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-e-1qjxhs5-0001::0",
            "r0::content::content::atom-operator-e-1qjxhs5-0001::1",
            "r0::content::content::atom-number-e-1qjxhs5-0001::2"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 16
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 16
          },
          "leftParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 4,
            "maxColumn": 4
          },
          "rightParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 16,
            "maxColumn": 16
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 6,
            "maxColumn": 14
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 6,
          "contentColumnEnd": 14,
          "focusIds": [
            "r0::content::content::atom-variable-e-1qjxhs5-0001::0"
          ],
          "verticalProfile": {
            "topRow": 1,
            "centerRow": 1,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "fraction-split-groups",
      "title": "Getrennte Bruchklammern",
      "equation": "sqrt((x+1)/(2-a))=5",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Bewusster Diagnosefall: der Szenenplan liefert hier getrennte Gruppen fuer Zaehler und Nenner.",
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
        "groupTracks": 2
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
      "groupTracks": [
        {
          "id": "projection-0::group-geometry::shell-group-j-1erym2x-0001",
          "shellTrackId": "shell-group-j-1erym2x-0001",
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1",
            "shell-group-j-1erym2x-0001"
          ],
          "structuralNodeIds": [
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0001:paren_left::0",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0001:paren_right::1",
            "shell-group-j-1erym2x-0001"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-j-1erym2x-0001::0",
            "r0::content::content::atom-operator-j-1erym2x-0001::1",
            "r0::content::content::atom-number-j-1erym2x-0001::2"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 14
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 14
          },
          "leftParenBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 2,
            "maxColumn": 2
          },
          "rightParenBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 14,
            "maxColumn": 14
          },
          "contentBounds": {
            "minAbsoluteRow": 0,
            "maxAbsoluteRow": 0,
            "minColumn": 4,
            "maxColumn": 12
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 4,
          "contentColumnEnd": 12,
          "focusIds": [
            "r0::content::content::atom-variable-j-1erym2x-0001::0"
          ],
          "verticalProfile": {
            "topRow": 0,
            "centerRow": 0.5,
            "axisRow": 1,
            "bottomRow": 1
          }
        },
        {
          "id": "projection-0::group-geometry::shell-group-j-1erym2x-0002",
          "shellTrackId": "shell-group-j-1erym2x-0002",
          "memberNodeIds": [
            "shell-group-j-1erym2x-0002",
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0002:paren_left::1",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0002:paren_right::2"
          ],
          "structuralNodeIds": [
            "shell-group-j-1erym2x-0002",
            "r0::shell::group_left_paren::shell-group-j-1erym2x-0002:paren_left::1",
            "r0::shell::group_right_paren::shell-group-j-1erym2x-0002:paren_right::2"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-number-j-1erym2x-0002::3",
            "r0::content::content::atom-operator-j-1erym2x-0003::4",
            "r0::content::content::atom-variable-j-1erym2x-0002::5"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 2,
            "minColumn": 14,
            "maxColumn": 26
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 14,
            "maxColumn": 26
          },
          "leftParenBounds": {
            "minAbsoluteRow": 2,
            "maxAbsoluteRow": 2,
            "minColumn": 14,
            "maxColumn": 14
          },
          "rightParenBounds": {
            "minAbsoluteRow": 2,
            "maxAbsoluteRow": 2,
            "minColumn": 26,
            "maxColumn": 26
          },
          "contentBounds": {
            "minAbsoluteRow": 2,
            "maxAbsoluteRow": 2,
            "minColumn": 16,
            "maxColumn": 24
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 16,
          "contentColumnEnd": 24,
          "focusIds": [],
          "verticalProfile": {
            "topRow": 1,
            "centerRow": 1.5,
            "axisRow": 1,
            "bottomRow": 2
          }
        }
      ]
    },
    {
      "id": "nested-groups",
      "title": "Verschachtelte Klammern",
      "equation": "((x/2)+1)=3",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Die aeussere Klammer erbt die innere Gruppe als Kindspur.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "group_release",
        "addition_release",
        "group_release",
        "fraction_collapse"
      ],
      "layout": {
        "anchorColumn": 21,
        "columnCount": 32,
        "rowCount": 5,
        "visualRowCount": 13,
        "stackedVisualRowCount": 13,
        "minColumn": 0,
        "maxColumn": 23,
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
        "sceneNodes": 14,
        "shellTracks": 3,
        "groupTracks": 2
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 4,
          "maxColumn": 4,
          "spanWidth": 1,
          "shellTrackIds": [
            "shell-division-b-10w8fpo-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-b-10w8fpo-0001::0"
          ],
          "anchorColumns": []
        },
        {
          "id": "projection-0::row-band::1",
          "absoluteRow": 1,
          "rowKind": "axis",
          "localRowOffset": 1,
          "minColumn": 0,
          "maxColumn": 23,
          "spanWidth": 24,
          "shellTrackIds": [
            "shell-division-b-10w8fpo-0001",
            "shell-group-b-10w8fpo-0001",
            "shell-group-b-10w8fpo-0002"
          ],
          "focusNodeIds": [],
          "anchorColumns": [
            21
          ]
        },
        {
          "id": "projection-0::row-band::2",
          "absoluteRow": 2,
          "rowKind": "below_axis",
          "localRowOffset": 2,
          "minColumn": 8,
          "maxColumn": 8,
          "spanWidth": 1,
          "shellTrackIds": [
            "shell-division-b-10w8fpo-0001"
          ],
          "focusNodeIds": [],
          "anchorColumns": []
        }
      ],
      "nodes": [
        {
          "id": "r0::content::content::atom-variable-b-10w8fpo-0001::0",
          "type": "division",
          "text": "x",
          "projectionRole": "numerator",
          "sourceAtomId": "atom-variable-b-10w8fpo-0001",
          "sourceShellId": "shell-division-b-10w8fpo-0001",
          "shellTrackId": "shell-division-b-10w8fpo-0001",
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
          "id": "r0::shell::group_left_paren::shell-group-b-10w8fpo-0002:paren_left::2",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-b-10w8fpo-0002",
          "sourceShellId": "shell-group-b-10w8fpo-0002",
          "shellTrackId": "shell-group-b-10w8fpo-0002",
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
          "id": "shell-group-b-10w8fpo-0002",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-b-10w8fpo-0002",
          "sourceShellId": null,
          "shellTrackId": "shell-group-b-10w8fpo-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 9,
            "colStart": 0,
            "colEnd": 18
          }
        },
        {
          "id": "r0::shell::group_left_paren::shell-group-b-10w8fpo-0001:paren_left::1",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-b-10w8fpo-0001",
          "sourceShellId": "shell-group-b-10w8fpo-0001",
          "shellTrackId": "shell-group-b-10w8fpo-0001",
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
          "id": "shell-group-b-10w8fpo-0001",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-b-10w8fpo-0001",
          "sourceShellId": "shell-group-b-10w8fpo-0002",
          "shellTrackId": "shell-group-b-10w8fpo-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 6,
            "colStart": 2,
            "colEnd": 10
          }
        },
        {
          "id": "r0::shell::fraction_line::shell-division-b-10w8fpo-0001:fraction_line::0",
          "type": "fraction_line",
          "text": "",
          "projectionRole": "fraction_line",
          "sourceAtomId": "shell-division-b-10w8fpo-0001",
          "sourceShellId": "shell-division-b-10w8fpo-0001",
          "shellTrackId": "shell-division-b-10w8fpo-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": null,
            "colStart": 4,
            "colEnd": 8
          }
        },
        {
          "id": "shell-division-b-10w8fpo-0001",
          "type": "division",
          "text": "",
          "projectionRole": "fraction",
          "sourceAtomId": "shell-division-b-10w8fpo-0001",
          "sourceShellId": "shell-group-b-10w8fpo-0001",
          "shellTrackId": "shell-division-b-10w8fpo-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 6,
            "colStart": 4,
            "colEnd": 8
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-b-10w8fpo-0001:paren_right::2",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-b-10w8fpo-0001",
          "sourceShellId": "shell-group-b-10w8fpo-0001",
          "shellTrackId": "shell-group-b-10w8fpo-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 10,
            "colStart": 10,
            "colEnd": 10
          }
        },
        {
          "id": "r0::content::content::atom-operator-b-10w8fpo-0002::2",
          "type": "atom",
          "text": "+",
          "projectionRole": "content",
          "sourceAtomId": "atom-operator-b-10w8fpo-0002",
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
            "col": 12,
            "colStart": 12,
            "colEnd": 12
          }
        },
        {
          "id": "r0::content::content::atom-number-b-10w8fpo-0002::3",
          "type": "atom",
          "text": "1",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-b-10w8fpo-0002",
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
            "col": 16,
            "colStart": 16,
            "colEnd": 16
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-b-10w8fpo-0002:paren_right::3",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-b-10w8fpo-0002",
          "sourceShellId": "shell-group-b-10w8fpo-0002",
          "shellTrackId": "shell-group-b-10w8fpo-0002",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 18,
            "colStart": 18,
            "colEnd": 18
          }
        },
        {
          "id": "r0::anchor::equation_anchor::atom-anchor-b-10w8fpo-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-b-10w8fpo-0001",
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
        },
        {
          "id": "r0::content::content::atom-number-b-10w8fpo-0003::0",
          "type": "atom",
          "text": "3",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-b-10w8fpo-0003",
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
            "col": 23,
            "colStart": 23,
            "colEnd": 23
          }
        },
        {
          "id": "r0::content::content::atom-number-b-10w8fpo-0001::1",
          "type": "division",
          "text": "2",
          "projectionRole": "denominator",
          "sourceAtomId": "atom-number-b-10w8fpo-0001",
          "sourceShellId": "shell-division-b-10w8fpo-0001",
          "shellTrackId": "shell-division-b-10w8fpo-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 2,
            "absoluteRow": 2,
            "stackedRow": 2,
            "col": 8,
            "colStart": 8,
            "colEnd": 8
          }
        }
      ],
      "shellTracks": [
        {
          "id": "shell-division-b-10w8fpo-0001",
          "kind": "division",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 2,
          "minColumn": 4,
          "maxColumn": 8,
          "memberCount": 4,
          "hasFocusMember": true,
          "projectionRoles": [
            "numerator",
            "fraction_line",
            "fraction",
            "denominator"
          ],
          "memberTexts": [
            "x",
            "2"
          ],
          "memberNodeIds": [
            "r0::content::content::atom-variable-b-10w8fpo-0001::0",
            "r0::shell::fraction_line::shell-division-b-10w8fpo-0001:fraction_line::0",
            "shell-division-b-10w8fpo-0001",
            "r0::content::content::atom-number-b-10w8fpo-0001::1"
          ],
          "sourceAtomIds": [
            "atom-variable-b-10w8fpo-0001",
            "shell-division-b-10w8fpo-0001",
            "atom-number-b-10w8fpo-0001"
          ],
          "sourceShellIds": [
            "shell-division-b-10w8fpo-0001",
            "shell-group-b-10w8fpo-0001"
          ],
          "members": [
            {
              "id": "r0::content::content::atom-variable-b-10w8fpo-0001::0",
              "type": "division",
              "text": "x",
              "projectionRole": "numerator",
              "sourceAtomId": "atom-variable-b-10w8fpo-0001",
              "sourceShellId": "shell-division-b-10w8fpo-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 4,
              "colEnd": 4
            },
            {
              "id": "r0::shell::fraction_line::shell-division-b-10w8fpo-0001:fraction_line::0",
              "type": "fraction_line",
              "text": "",
              "projectionRole": "fraction_line",
              "sourceAtomId": "shell-division-b-10w8fpo-0001",
              "sourceShellId": "shell-division-b-10w8fpo-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 8
            },
            {
              "id": "shell-division-b-10w8fpo-0001",
              "type": "division",
              "text": "",
              "projectionRole": "fraction",
              "sourceAtomId": "shell-division-b-10w8fpo-0001",
              "sourceShellId": "shell-group-b-10w8fpo-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 4,
              "colEnd": 8
            },
            {
              "id": "r0::content::content::atom-number-b-10w8fpo-0001::1",
              "type": "division",
              "text": "2",
              "projectionRole": "denominator",
              "sourceAtomId": "atom-number-b-10w8fpo-0001",
              "sourceShellId": "shell-division-b-10w8fpo-0001",
              "absoluteRow": 2,
              "localRow": 2,
              "stackedRow": 2,
              "colStart": 8,
              "colEnd": 8
            }
          ]
        },
        {
          "id": "shell-group-b-10w8fpo-0001",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 2,
          "maxColumn": 10,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group_left",
            "group",
            "group_right"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0001:paren_left::1",
            "shell-group-b-10w8fpo-0001",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0001:paren_right::2"
          ],
          "sourceAtomIds": [
            "shell-group-b-10w8fpo-0001"
          ],
          "sourceShellIds": [
            "shell-group-b-10w8fpo-0001",
            "shell-group-b-10w8fpo-0002"
          ],
          "members": [
            {
              "id": "r0::shell::group_left_paren::shell-group-b-10w8fpo-0001:paren_left::1",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-b-10w8fpo-0001",
              "sourceShellId": "shell-group-b-10w8fpo-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "shell-group-b-10w8fpo-0001",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-b-10w8fpo-0001",
              "sourceShellId": "shell-group-b-10w8fpo-0002",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 10
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-b-10w8fpo-0001:paren_right::2",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-b-10w8fpo-0001",
              "sourceShellId": "shell-group-b-10w8fpo-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 10,
              "colEnd": 10
            }
          ]
        },
        {
          "id": "shell-group-b-10w8fpo-0002",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 18,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group_left",
            "group",
            "group_right"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0002:paren_left::2",
            "shell-group-b-10w8fpo-0002",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0002:paren_right::3"
          ],
          "sourceAtomIds": [
            "shell-group-b-10w8fpo-0002"
          ],
          "sourceShellIds": [
            "shell-group-b-10w8fpo-0002"
          ],
          "members": [
            {
              "id": "r0::shell::group_left_paren::shell-group-b-10w8fpo-0002:paren_left::2",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-b-10w8fpo-0002",
              "sourceShellId": "shell-group-b-10w8fpo-0002",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-group-b-10w8fpo-0002",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-b-10w8fpo-0002",
              "sourceShellId": null,
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 18
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-b-10w8fpo-0002:paren_right::3",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-b-10w8fpo-0002",
              "sourceShellId": "shell-group-b-10w8fpo-0002",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 18,
              "colEnd": 18
            }
          ]
        }
      ],
      "groupTracks": [
        {
          "id": "projection-0::group-geometry::shell-group-b-10w8fpo-0002",
          "shellTrackId": "shell-group-b-10w8fpo-0002",
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0002:paren_left::2",
            "shell-group-b-10w8fpo-0002",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0002:paren_right::3"
          ],
          "structuralNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0002:paren_left::2",
            "shell-group-b-10w8fpo-0002",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0002:paren_right::3"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-operator-b-10w8fpo-0002::2",
            "r0::content::content::atom-number-b-10w8fpo-0002::3"
          ],
          "childShellTrackIds": [
            "shell-group-b-10w8fpo-0001"
          ],
          "frameBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 18
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 18
          },
          "leftParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 0
          },
          "rightParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 18,
            "maxColumn": 18
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 16
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 2,
          "contentColumnEnd": 16,
          "focusIds": [],
          "verticalProfile": {
            "topRow": 1,
            "centerRow": 1,
            "axisRow": 1,
            "bottomRow": 1
          }
        },
        {
          "id": "projection-0::group-geometry::shell-group-b-10w8fpo-0001",
          "shellTrackId": "shell-group-b-10w8fpo-0001",
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0001:paren_left::1",
            "shell-group-b-10w8fpo-0001",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0001:paren_right::2"
          ],
          "structuralNodeIds": [
            "r0::shell::group_left_paren::shell-group-b-10w8fpo-0001:paren_left::1",
            "shell-group-b-10w8fpo-0001",
            "r0::shell::group_right_paren::shell-group-b-10w8fpo-0001:paren_right::2"
          ],
          "contentNodeIds": [],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 10
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 10
          },
          "leftParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 2
          },
          "rightParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 10,
            "maxColumn": 10
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 10
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 2,
          "contentColumnEnd": 10,
          "focusIds": [],
          "verticalProfile": {
            "topRow": 1,
            "centerRow": 1,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    },
    {
      "id": "pure-power-group",
      "title": "Reine Potenzgruppe",
      "equation": "(x+1)^2=9",
      "targetVariable": "x",
      "sceneIndex": 0,
      "note": "Ein kompakter Vergleichsfall fuer eine Klammer ohne Mehrzeileninhalt.",
      "sceneId": "projection-0",
      "strategyFamilies": [
        "root_power",
        "addition_release"
      ],
      "layout": {
        "anchorColumn": 17,
        "columnCount": 26,
        "rowCount": 3,
        "visualRowCount": 6,
        "stackedVisualRowCount": 6,
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
        "shellTracks": 2,
        "groupTracks": 1
      },
      "rowBands": [
        {
          "id": "projection-0::row-band::0",
          "absoluteRow": 0,
          "rowKind": "above_axis",
          "localRowOffset": 0,
          "minColumn": 0,
          "maxColumn": 14,
          "spanWidth": 15,
          "shellTrackIds": [
            "shell-power-9-1jsnlde-0001"
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
            "shell-power-9-1jsnlde-0001",
            "shell-group-9-1jsnlde-0001"
          ],
          "focusNodeIds": [
            "r0::content::content::atom-variable-9-1jsnlde-0001::0"
          ],
          "anchorColumns": [
            17
          ]
        }
      ],
      "nodes": [
        {
          "id": "shell-power-9-1jsnlde-0001",
          "type": "power",
          "text": "",
          "projectionRole": "power",
          "sourceAtomId": "shell-power-9-1jsnlde-0001",
          "sourceShellId": null,
          "shellTrackId": "shell-power-9-1jsnlde-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 0,
            "absoluteRow": 0,
            "stackedRow": 0,
            "col": 7,
            "colStart": 0,
            "colEnd": 14
          }
        },
        {
          "id": "r0::shell::power_exponent::shell-power-9-1jsnlde-0001:power_exponent::1",
          "type": "power",
          "text": "2",
          "projectionRole": "power_exponent",
          "sourceAtomId": "shell-power-9-1jsnlde-0001",
          "sourceShellId": "shell-power-9-1jsnlde-0001",
          "shellTrackId": "shell-power-9-1jsnlde-0001",
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
          "id": "r0::shell::group_left_paren::shell-group-9-1jsnlde-0001:paren_left::0",
          "type": "group",
          "text": "(",
          "projectionRole": "group_left",
          "sourceAtomId": "shell-group-9-1jsnlde-0001",
          "sourceShellId": "shell-group-9-1jsnlde-0001",
          "shellTrackId": "shell-group-9-1jsnlde-0001",
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
          "id": "shell-group-9-1jsnlde-0001",
          "type": "group",
          "text": "",
          "projectionRole": "group",
          "sourceAtomId": "shell-group-9-1jsnlde-0001",
          "sourceShellId": "shell-power-9-1jsnlde-0001",
          "shellTrackId": "shell-group-9-1jsnlde-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 6,
            "colStart": 0,
            "colEnd": 12
          }
        },
        {
          "id": "r0::content::content::atom-variable-9-1jsnlde-0001::0",
          "type": "power",
          "text": "x",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-variable-9-1jsnlde-0001",
          "sourceShellId": "shell-power-9-1jsnlde-0001",
          "shellTrackId": "shell-power-9-1jsnlde-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": true,
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
          "id": "r0::content::content::atom-operator-9-1jsnlde-0001::1",
          "type": "power",
          "text": "+",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-operator-9-1jsnlde-0001",
          "sourceShellId": "shell-power-9-1jsnlde-0001",
          "shellTrackId": "shell-power-9-1jsnlde-0001",
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
          "id": "r0::content::content::atom-number-9-1jsnlde-0001::2",
          "type": "power",
          "text": "1",
          "projectionRole": "power_base",
          "sourceAtomId": "atom-number-9-1jsnlde-0001",
          "sourceShellId": "shell-power-9-1jsnlde-0001",
          "shellTrackId": "shell-power-9-1jsnlde-0001",
          "functionName": null,
          "visualMode": null,
          "isFocus": false,
          "position": {
            "rowIndex": 0,
            "localRow": 1,
            "absoluteRow": 1,
            "stackedRow": 1,
            "col": 10,
            "colStart": 10,
            "colEnd": 10
          }
        },
        {
          "id": "r0::shell::group_right_paren::shell-group-9-1jsnlde-0001:paren_right::1",
          "type": "group",
          "text": ")",
          "projectionRole": "group_right",
          "sourceAtomId": "shell-group-9-1jsnlde-0001",
          "sourceShellId": "shell-group-9-1jsnlde-0001",
          "shellTrackId": "shell-group-9-1jsnlde-0001",
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
          "id": "r0::anchor::equation_anchor::atom-anchor-9-1jsnlde-0001::0",
          "type": "anchor",
          "text": "=",
          "projectionRole": "anchor",
          "sourceAtomId": "atom-anchor-9-1jsnlde-0001",
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
        },
        {
          "id": "r0::content::content::atom-number-9-1jsnlde-0002::0",
          "type": "atom",
          "text": "9",
          "projectionRole": "content",
          "sourceAtomId": "atom-number-9-1jsnlde-0002",
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
          "id": "shell-group-9-1jsnlde-0001",
          "kind": "group",
          "functionName": null,
          "minAbsoluteRow": 1,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 12,
          "memberCount": 3,
          "hasFocusMember": false,
          "projectionRoles": [
            "group_left",
            "group",
            "group_right"
          ],
          "memberTexts": [
            "(",
            ")"
          ],
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-9-1jsnlde-0001:paren_left::0",
            "shell-group-9-1jsnlde-0001",
            "r0::shell::group_right_paren::shell-group-9-1jsnlde-0001:paren_right::1"
          ],
          "sourceAtomIds": [
            "shell-group-9-1jsnlde-0001"
          ],
          "sourceShellIds": [
            "shell-group-9-1jsnlde-0001",
            "shell-power-9-1jsnlde-0001"
          ],
          "members": [
            {
              "id": "r0::shell::group_left_paren::shell-group-9-1jsnlde-0001:paren_left::0",
              "type": "group",
              "text": "(",
              "projectionRole": "group_left",
              "sourceAtomId": "shell-group-9-1jsnlde-0001",
              "sourceShellId": "shell-group-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 0
            },
            {
              "id": "shell-group-9-1jsnlde-0001",
              "type": "group",
              "text": "",
              "projectionRole": "group",
              "sourceAtomId": "shell-group-9-1jsnlde-0001",
              "sourceShellId": "shell-power-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 0,
              "colEnd": 12
            },
            {
              "id": "r0::shell::group_right_paren::shell-group-9-1jsnlde-0001:paren_right::1",
              "type": "group",
              "text": ")",
              "projectionRole": "group_right",
              "sourceAtomId": "shell-group-9-1jsnlde-0001",
              "sourceShellId": "shell-group-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 12,
              "colEnd": 12
            }
          ]
        },
        {
          "id": "shell-power-9-1jsnlde-0001",
          "kind": "power",
          "functionName": null,
          "minAbsoluteRow": 0,
          "maxAbsoluteRow": 1,
          "minColumn": 0,
          "maxColumn": 14,
          "memberCount": 5,
          "hasFocusMember": true,
          "projectionRoles": [
            "power",
            "power_exponent",
            "power_base"
          ],
          "memberTexts": [
            "2",
            "x",
            "+",
            "1"
          ],
          "memberNodeIds": [
            "shell-power-9-1jsnlde-0001",
            "r0::shell::power_exponent::shell-power-9-1jsnlde-0001:power_exponent::1",
            "r0::content::content::atom-variable-9-1jsnlde-0001::0",
            "r0::content::content::atom-operator-9-1jsnlde-0001::1",
            "r0::content::content::atom-number-9-1jsnlde-0001::2"
          ],
          "sourceAtomIds": [
            "shell-power-9-1jsnlde-0001",
            "atom-variable-9-1jsnlde-0001",
            "atom-operator-9-1jsnlde-0001",
            "atom-number-9-1jsnlde-0001"
          ],
          "sourceShellIds": [
            "shell-power-9-1jsnlde-0001"
          ],
          "members": [
            {
              "id": "shell-power-9-1jsnlde-0001",
              "type": "power",
              "text": "",
              "projectionRole": "power",
              "sourceAtomId": "shell-power-9-1jsnlde-0001",
              "sourceShellId": null,
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 0,
              "colEnd": 14
            },
            {
              "id": "r0::shell::power_exponent::shell-power-9-1jsnlde-0001:power_exponent::1",
              "type": "power",
              "text": "2",
              "projectionRole": "power_exponent",
              "sourceAtomId": "shell-power-9-1jsnlde-0001",
              "sourceShellId": "shell-power-9-1jsnlde-0001",
              "absoluteRow": 0,
              "localRow": 0,
              "stackedRow": 0,
              "colStart": 14,
              "colEnd": 14
            },
            {
              "id": "r0::content::content::atom-variable-9-1jsnlde-0001::0",
              "type": "power",
              "text": "x",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-variable-9-1jsnlde-0001",
              "sourceShellId": "shell-power-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 2,
              "colEnd": 2
            },
            {
              "id": "r0::content::content::atom-operator-9-1jsnlde-0001::1",
              "type": "power",
              "text": "+",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-operator-9-1jsnlde-0001",
              "sourceShellId": "shell-power-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 6,
              "colEnd": 6
            },
            {
              "id": "r0::content::content::atom-number-9-1jsnlde-0001::2",
              "type": "power",
              "text": "1",
              "projectionRole": "power_base",
              "sourceAtomId": "atom-number-9-1jsnlde-0001",
              "sourceShellId": "shell-power-9-1jsnlde-0001",
              "absoluteRow": 1,
              "localRow": 1,
              "stackedRow": 1,
              "colStart": 10,
              "colEnd": 10
            }
          ]
        }
      ],
      "groupTracks": [
        {
          "id": "projection-0::group-geometry::shell-group-9-1jsnlde-0001",
          "shellTrackId": "shell-group-9-1jsnlde-0001",
          "memberNodeIds": [
            "r0::shell::group_left_paren::shell-group-9-1jsnlde-0001:paren_left::0",
            "shell-group-9-1jsnlde-0001",
            "r0::shell::group_right_paren::shell-group-9-1jsnlde-0001:paren_right::1"
          ],
          "structuralNodeIds": [
            "r0::shell::group_left_paren::shell-group-9-1jsnlde-0001:paren_left::0",
            "shell-group-9-1jsnlde-0001",
            "r0::shell::group_right_paren::shell-group-9-1jsnlde-0001:paren_right::1"
          ],
          "contentNodeIds": [
            "r0::content::content::atom-variable-9-1jsnlde-0001::0",
            "r0::content::content::atom-operator-9-1jsnlde-0001::1",
            "r0::content::content::atom-number-9-1jsnlde-0001::2"
          ],
          "childShellTrackIds": [],
          "frameBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 12
          },
          "shellBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 12
          },
          "leftParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 0,
            "maxColumn": 0
          },
          "rightParenBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 12,
            "maxColumn": 12
          },
          "contentBounds": {
            "minAbsoluteRow": 1,
            "maxAbsoluteRow": 1,
            "minColumn": 2,
            "maxColumn": 10
          },
          "axisAbsoluteRow": 1,
          "contentColumnStart": 2,
          "contentColumnEnd": 10,
          "focusIds": [
            "r0::content::content::atom-variable-9-1jsnlde-0001::0"
          ],
          "verticalProfile": {
            "topRow": 1,
            "centerRow": 1,
            "axisRow": 1,
            "bottomRow": 1
          }
        }
      ]
    }
  ]
};
export default RENDERER_KERNEL_GROUP_DEBUG_DATA;
