# Reading a source workflow

What to look for in each source, so the plain-words summary (inputs, steps, outputs) is right before
any Layer node is chosen.

## ComfyUI

Two JSON formats, both common:

- **UI format** (saved from the editor, also embedded in PNGs ComfyUI writes): top-level `nodes` and
  `links` arrays. Each node has a `type` (the node class), `widgets_values` (its settings, in widget
  order) and numbered input and output slots. Each link is
  `[link_id, from_node, from_slot, to_node, to_slot, type]`.
- **API format** ("Save (API)"): an object keyed by node id, each `{class_type, inputs}`. An input is
  either a literal or `[source_node_id, output_index]`, which is a connection.

A PNG from ComfyUI usually carries both in its text metadata, under `workflow` (UI) and `prompt`
(API). The API format is easier to read because settings are named.

Node classes and what they mean:

| Classes                                                           | Intent                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| `CheckpointLoaderSimple`, `UNETLoader`, `CLIPLoader`, `VAELoader` | Model choice. Discover a Layer model; never copy names. |
| `LoraLoader`                                                      | A style or subject. Reference set, or prompt wording.   |
| `CLIPTextEncode` (positive / negative)                            | Prompt text. A literal is fixed; a primitive is input.  |
| `EmptyLatentImage`                                                | Output size.                                            |
| `KSampler`, `KSamplerAdvanced`, `SamplerCustom`                   | The generation step itself. Steps and CFG rarely carry. |
| `LoadImage` + `VAEEncode` + sampler with denoise below 1          | Image-to-image or an edit of an input image.            |
| `VAEEncodeForInpaint`, mask nodes                                 | Masked edit (inpaint).                                  |
| `ControlNetLoader` + `ControlNetApply*`                           | Pose, depth or edge guidance from an input image.       |
| `IPAdapter*`                                                      | Style or subject taken from a reference image.          |
| `UpscaleModelLoader` + `ImageUpscaleWithModel`, `ImageScale`      | Upscale or resize.                                      |
| `VAEDecode`, `PreviewImage`                                       | Plumbing. No Layer node.                                |
| `SaveImage`, `SaveAnimatedWEBP`, `VHS_VideoCombine`               | Workflow outputs.                                       |

Custom node packs (class names outside core ComfyUI) need reading case by case: background removal,
face restore and frame interpolation often have a Layer node; bespoke math or scripting nodes rarely
do.

## Krea

Krea's node workflows chain generation, editing and enhancement steps on a canvas. When the user can
share an export, read it like a node list: find each node's type, its settings and what feeds it.
When all you have is a screenshot or a description, list the nodes you can see and ask for any
setting that is not visible (a model, a strength, a size) rather than guessing it.

## Scenario

A Scenario workflow is a flow of steps. Model steps name a Scenario model and its inputs; text steps
build a prompt by joining fixed text with user inputs; logic steps branch, usually on whether an
optional input was filled in; loop steps repeat a step per item. Scenario model names map to no Layer
model: read what the step generates (image, edit, video, 3D) and discover a Layer model for that use
case. A branch on "was this optional text filled" usually becomes a prompt that includes the text
when present; a loop over items usually becomes a list input feeding one node.

## Prose or screenshot

A pipeline described in words ("generate a character, then a turnaround, then remove the
background") is the plain-words summary already. Confirm the inputs and which values are fixed, then
build.
