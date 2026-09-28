# Reading a source workflow

What to look for in a source, so the plain-words summary (inputs, steps, outputs) is right before any
Layer node is chosen.

## The four questions

Every workflow format, whatever the tool, answers the same four questions. Find each before mapping:

1. **Nodes.** A list or map of steps, each with a type (what it does) and settings.
2. **Connections.** Either an edge list, or references on the receiving side naming a source step and
   output. Build the dependency order from these.
3. **Inputs.** Steps or fields a person fills in at run time: often a "primitive", "parameter" or
   "input" node, or settings exposed on the workflow's form. Everything else is fixed.
4. **Outputs.** The save, export or terminal steps. Intermediate previews are not outputs.

## Recognising a format

- **An edge list** (`links`, `edges`, `connections`): each entry names a source node and output slot
  and a target node and input slot. Settings on a node may be positional (an array in widget order)
  rather than named; read them against the node type.
- **References on the receiving side**: a node's input holds a literal, or a pointer such as
  `[source_node_id, output_index]`. Named settings make this form easier to read.
- **A step list** (`flow`, `steps`): an ordered list where each step names the steps it consumes.
- **An image file**: some tools embed the workflow as JSON in the image's text metadata. Extract it
  and read it as above.
- **A screenshot or description**: list the nodes you can see and ask for any setting that is not
  visible (a model, a strength, a size) rather than guessing it.

## Common node patterns

| Pattern in the source                                 | Intent                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Model, checkpoint, encoder or decoder loaders         | Model choice. Discover a Layer model; never copy names.     |
| Style adapter or fine-tune weights loader             | A style or subject. Reference set, or prompt wording.       |
| Text encoder or prompt node (positive / negative)     | Prompt text. A literal is fixed; an exposed field is input. |
| Empty latent, canvas or size node                     | Output size.                                                |
| Sampler, scheduler, steps and guidance settings       | The generation step itself. These settings rarely carry.    |
| Load image, encode, then sample with strength below 1 | Image-to-image or an edit of an input image.                |
| Mask feeding an inpaint encode or edit                | Masked edit (inpaint).                                      |
| Pose, depth or edge guidance from an input image      | Structural guidance from a reference image.                 |
| Reference-image adapter                               | Style or subject taken from a reference image.              |
| Upscale model, resize                                 | Upscale or resize.                                          |
| Decode, preview                                       | Plumbing. No Layer node.                                    |
| String join, template, concatenate                    | One prompt with the user inputs spliced in.                 |
| Branch on whether an optional input is filled         | A prompt that includes the text when present.               |
| Loop or for-each over items                           | A list input feeding one node.                              |
| Save, export, video combine                           | Workflow outputs.                                           |

Model names in any source are that tool's own and map to no Layer id; read what the step generates
and discover a model. Asset ids in an export name files in that tool's library, not on Layer; upload
a sample instead. Custom or plugin nodes need reading case by case: background removal, face restore
and frame interpolation often have a Layer node; bespoke math or scripting nodes rarely do.
