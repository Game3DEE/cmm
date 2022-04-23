import { BrowserImagePlugin } from "./browserimage.js"
import { PKMPlugin } from "./pkm.js"
import { TGAPlugin } from "./tga.js"
import { DDSPlugin } from "./dds.js"
import { CarnivoresPlugin } from "./carnivores.js"
import { VivisectorPlugin } from "./vivisector.js"
import { PrimalPreyPlugin } from './primalprey.js'
import { CityscapePlugin } from './cityscape.js'
import { Prism3DPlugin } from './prism3d.js'
import { ChasmPlugin } from './chasm.js'
import { Quickdraw3DPlugin } from './quickdraw3d.js'
import { GenericPlugin } from './generic.js'
export { DataType } from './plugin.js'

export function setupPlugins(gui, camera) {
    return [
        // mode plugins
        new CarnivoresPlugin(gui, camera),
        new PrimalPreyPlugin(gui),
        new VivisectorPlugin(gui),
        new CityscapePlugin(gui),
        new Prism3DPlugin(gui),
        new ChasmPlugin(gui),
        new Quickdraw3DPlugin(gui),
        new GenericPlugin(gui),
        // texture plugins
        new BrowserImagePlugin(gui),
        new PKMPlugin(gui),
        new TGAPlugin(gui),
        new DDSPlugin(gui),
    ]
}
