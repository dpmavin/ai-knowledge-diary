@AGENTS.md

# Library Archives

Read @DESIGN.md and @BUILD.md before writing anything in this project.
@FLOWS.md is the interaction spec — screens, states, and edge cases.
@IA.md is the information architecture — hierarchy, navigation, screen priority.
@PRD.md is the product context — the why, the moat, the demo path.

- **DESIGN.md** is the single source of truth for every visual decision. No colour,
  font size, radius, or spacing value that isn't in that file. Its "Never" list is
  binding — no shadows, no gradients outside covers, no icon libraries, no Josefin
  Sans below 20px, and the passage is never set larger than my note.
- **BUILD.md** is the operative build plan: data model, stack, and 11 numbered steps.
- **FLOWS.md** specifies behaviour: the extension's five popup states, the app's four
  screens, and the edge cases each step has to handle. Where a BUILD.md step and
  FLOWS.md describe the same screen, build the step and satisfy FLOWS.md's states and
  edges for it. FLOWS.md is the newer doc — where it and BUILD.md describe the same
  behaviour differently, FLOWS.md is the current intent.
- **IA.md** fixes the hierarchy (Library > Shelf > Volume > Fragment), the two-screen
  navigation model, what each screen contains in priority order, and the ordering
  rules. The Fragment's thought is the primary object in the system.
- **PRD.md** explains what the product is for and why each choice was made. Read it
  for intent, not for instructions.

## When the docs disagree, DESIGN.md and BUILD.md win

PRD.md ends with an earlier "Starter prompt" that describes a different product:
vertical book spines, serif type, an off-white background, a 7-step build order, and
a `coverSpec` field. All of that is superseded — the real direction is DESIGN.md's
140x180 gradient covers in Josefin Sans and Inter on a white page, built in BUILD.md's
11 steps against its `coverFamily` field. Do not build from the PRD's starter prompt.

## Build discipline

Build only the step I ask for, then stop and report what you made and how to check
it. Do not run ahead to later steps.

## Vocabulary

The product calls it a **thought**, not a note. All UI copy says "thought" ("Your
thought", "Add a thought", "unannotated"). The data model field stays `myNote` as
BUILD.md defines it — copy and field name differ on purpose; do not rename one to
match the other.

## The one rule that matters

On any fragment card, MY THOUGHT is the largest text on screen, in Josefin Sans. The
highlighted passage sits below it, smaller, in Inter, in `--mute`. Never reverse it.

## The thought is optional but never invisible

A save with no thought still persists. The volume is then marked **unannotated** on
the shelf with a quieter marker than the unread dot, and the fragment shows the
passage alone with an "Add a thought" affordance. Never block a save on it, never nag.
`unannotated` is derived — a volume with no fragment carrying a non-empty `myNote` —
not a stored field.
