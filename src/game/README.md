# Carnivores Online

Online implementation of Carnivores, supporting multiplayer.

## BUGS

* ThreeJS broke RGB565 in r136, while it worked in r128

## TODO

* setNewTargetPlace bugged (sometimes gets stuck in endless retries)
* Use bitecs to seperate game logic from renderer:
    - render system:
        - use enter/leave to create/remove objects from scene
        - use tick to update alive object position/rotation
* Add objects
    * Add object shadows to lightmap
    * Shader: Transparency / fog
* Add Mosh and sort out AI system (ambient)
    * AI is a set of phases, with logic like:
        - run away from user
        - move over land / in air
      and information per phase like:
        - movement/turn speed
* tiling of terrain
    - what tile size to use (how many cells in a tile?)
    - LODing of tiles?
    - Use instancing or use seperate objects with LOD for billboard
    - detail map for terrain?
* Investigate grass shader from mobile app

## Multiplayer issues / ideas

* ReplaceCharacterForward does not work in multiplayer
* Play as *either* a hunter or a dino
