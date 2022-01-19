# CMM design

CMM's design is plugin based, centered around textured, 3d geometry. The main viewer app has very little intelligence on what you're working with, just a valid 3D Geometry with one or more materials.

The plugins actually convert files to geometry, textures, and or animations. The main app shows the geometry, allows assigning textures to materials, and do some basic geometry operations.

The plugins handle loading data from files, as well as exporting to files.

When geometry is returned by the plugin, and the plugin is a mode plugin, it will switch the UI to the plugin's mode. Usually this is a format specific mode, e.g. Carnivores, PrimalPrey, etc.

When a mode is activated, the plugin is passed the UX interface, so it can add its own UI items, like export options, editing options, or anything else.

When switching modes with a geometry active, CMM will convert geometry/animations/textures to the new mode format to show preview what the geometry will look like. You will then be able to export to one of the modes format.
