import { BrowserImagePlugin } from "./browserimage.js"
import { PKMPlugin } from "./pkm.js"
import { TGAPlugin } from "./tga.js"
import { CarnivoresPlugin } from "./carnivores.js"
import { VivisectorPlugin } from "./vivisector.js"
import { PrimalPreyPlugin } from './primalprey.js'
import { CityscapePlugin } from './cityscape.js'
import { DDSPlugin } from "./dds.js"
export { DataType } from './plugin.js'

export function setupPlugins(gui) {
    return [
        // mode plugins
        new CarnivoresPlugin(gui),
        new PrimalPreyPlugin(gui),
        new VivisectorPlugin(gui),
        new CityscapePlugin(gui),
        // texture plugins
        new BrowserImagePlugin(gui),
        new PKMPlugin(gui),
        new TGAPlugin(gui),
        new DDSPlugin(gui),
    ]
}
