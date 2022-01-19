const magic = 'UBFC'

export function loadCMF(buffer, offset = 0) {
    const dv = new DataView(buffer)

    // Verify file magic
    for (let i = 0; i < magic.length; i++) {
        if (dv.getUint8(offset + i) !== magic.charCodeAt(i)) {
            throw new Error(`Invalid CMF format`)
        }
    }
    offset += magic.length
    offset += 4 // skip zero byte

    const vertices = []
    const faces = []

    function parseIndices(size) {
        console.log(`parseIndices(${size})`)
        for (let i = 0; i < size; i += 16) {
            faces.push({
                indices: [
                    dv.getUint32(offset + i + 0, true),
                    dv.getUint32(offset + i + 4, true),
                    dv.getUint32(offset + i + 8, true),
                ],
                uvs: [],
            })

            if (dv.getUint32(offset + i + 8, true) !== dv.getUint32(offset + i + 12, true)) {
                throw new Error(`Mismatch in indices at ${offset + i}`)
            }
        }
    }

    function parseVertices(size) {
        console.log(`parseVertices(${size})`)
        for (let i = 0; i < size; i += 12) {
            vertices.push({
                position: [
                    dv.getFloat32(offset + i + 0, true),
                    dv.getFloat32(offset + i + 4, true),
                    dv.getFloat32(offset + i + 8, true),
                ],
                bone: -1,
                hide: 0,
            })
        }    
    }

    function parseUVs(size) {
        console.log(`parseUVs(${size})`)
        let faceIdx = 0
        for (let i = 0; i < size; i+=32) {
            faces[faceIdx++].uvs = [
                dv.getFloat32(offset + i + 0, true) * 512, // a.uv
                dv.getFloat32(offset + i + 16, true) * 512,
                dv.getFloat32(offset + i + 4, true) * 512, // b.uv
                dv.getFloat32(offset + i + 20, true) * 512,
                dv.getFloat32(offset + i + 8, true) * 512, // c.uv
                dv.getFloat32(offset + i + 24, true) * 512,
            ]
        }
    }

    const stats = {}

    while(offset < buffer.byteLength) {
        const blockId = dv.getUint32(offset, true)
        const size = dv.getUint32(offset + 4, true)
        offset += 8

        const bidStr = blockId.toString(16)
        if (!stats[bidStr]) {
            stats[bidStr] = 1
        } else {
            stats[bidStr]++
        }

        // IDs:
        //  0x2000: [empty] start of object
        //  0x3000: [empty] end of objects / start of material

        //console.log(`0x${blockId.toString(16)}: ${size}`)
        switch(blockId) {
            case 0x2013: // indices
                parseIndices(size)
                break
            case 0x2020: // floats1 (uv set 1)
                parseUVs(size)
                break
            case 0x2021: // floats1 (uv set 2)
                //parseUVs(size)
                break
            case 0x2023: // vertices
                parseVertices(size)
                break
        }
        //
        offset += size
    }

    console.log(stats)

    return {
        vertices,
        faces,
    }
}


/*                  #faces  #verts
                    0x2011  0x2012  0xf010  0x2030
k_512_64_64.cmf       12      8       1       18
grass01.cmf           16      32      1       


0x2033 long list of floats => animation frames? not in simple static objects!



File sizes (sorted biggest to smallest):

find . -type f -iname \*.cmf -exec du -h {} + | sort -r -h
2.2M    ./Characters/Bosses/DogRobot/DogRobot_cut.cmf
1.9M    ./Characters/Bosses/DogRobot/DogRobot.cmf
1.2M    ./Characters/Devices/Antenna/antenna.cmf
1.2M    ./Characters/Actors/Morhead/morhead_3_1b.cmf
1.2M    ./Characters/Actors/Morhead/morhead_2.cmf
1.1M    ./Characters/Actors/Morhead/morhead.cmf
1.1M    ./Characters/Actors/General/general.cmf
1016K   ./Characters/Bosses/Rhyno/rhyno.cmf
904K    ./Characters/Actors/Morhead/morhead_3_1a.cmf
788K    ./Characters/HumAnimals/HLeopard/hleopard.cmf
720K    ./Characters/OverBrutes/Panther/panther.cmf
708K    ./Characters/Actors/Lion_leader/lion_uni.cmf
700K    ./Characters/Actors/Kurt/kurt_uni.cmf
692K    ./Areas/Armored_car/atr_car.cmf
672K    ./Areas/Armored_car/armored_car.cmf
660K    ./Characters/Devices/Surg_subject/panther_surg.cmf
656K    ./Characters/Vehicles/Jeep/jeep12.cmf
656K    ./Characters/OverBrutes/Tiger/tiger.cmf
584K    ./Characters/SAS/soldier2.cmf
580K    ./Characters/Bosses/Bull/bull.cmf
576K    ./Characters/SAS/soldier3.cmf
548K    ./Characters/SAS/soldier1.cmf
540K    ./Characters/Actors/Liam/liam_uni.cmf
520K    ./Characters/Personnel/Medics/M/hmedman2.cmf
520K    ./Characters/Personnel/Medics/M/hmedman.cmf
504K    ./Characters/Personnel/Medics/M/hmedman3.cmf
496K    ./Characters/Actors/Fetus_b/fetus_b.cmf
496K    ./Characters/Actors/Fetus/fetus3.cmf
496K    ./Characters/Actors/Child_on_Board/child_a.cmf
488K    ./Characters/OverBrutes/BWolf/blackwolf.cmf
480K    ./Characters/Guards/IGuard/iguard_sn.cmf
480K    ./Areas/DRM37/panther2.cmf
472K    ./Characters/OverBrutes/WWolf/whitewolf.cmf
472K    ./Characters/Guards/IslandTracker/itracker.cmf
464K    ./Characters/Personnel/Medics/W/hmedwom2.cmf
464K    ./Characters/Personnel/Medics/W/hmedwom.cmf
460K    ./Characters/Guards/IGuard/iguard.cmf
444K    ./Characters/Actors/Child/child_a.cmf
440K    ./Characters/ModBeasts/Rhinoster/rhino.cmf
424K    ./Characters/Personnel/Steel_w/steel_w_nd.cmf
424K    ./Characters/Personnel/Steel_w/steel_w.cmf
420K    ./Characters/Devices/Surg_subject/blackwolf_surg.cmf
420K    ./Characters/Actors/Malica/malica_uni.cmf
408K    ./Areas/DRM37/whole_scene.cmf
404K    ./Characters/Personnel/Miner/miner.cmf
396K    ./Characters/OverBrutes/Helex/helex.cmf
388K    ./Characters/HumAnimals/HGepard/hgepard.cmf
380K    ./Characters/HumAnimals/HRam/hram.cmf
376K    ./Characters/ModBeasts/Bombear/bombear.cmf
360K    ./Characters/HumAnimals/HHyena/hhyena.cmf
356K    ./Areas/DRM36/progr_wag.cmf
336K    ./Entities/polka.cmf
332K    ./Characters/OverBrutes/BWolf/blackwolf_iced.cmf
328K    ./Weapon/Plasma/Plazma.cmf
320K    ./Characters/Devices/Manipulyator/manip_surg_r.cmf
320K    ./Characters/Devices/Manipulyator/manip_surg.cmf
316K    ./Characters/ModBeasts/Jag_fire/jag_fire.cmf
304K    ./Weapon/Bazooka/bazooka.cmf
304K    ./Characters/OverBrutes/Uncomplete/uncomplete.cmf
304K    ./Characters/ModBeasts/Lion_fire/lion_fire.cmf
304K    ./Characters/Devices/Surg_subject/uncomplete_surg.cmf
300K    ./Weapon/Howitzer/howitzer.cmf
296K    ./Weapon/Sniper_AP/sniper_ap.cmf
288K    ./Characters/ModBeasts/Panther_cyb/panther_cyb.cmf
284K    ./Characters/ModBeasts/Hyena_cyb/hyena_cyb_movie.cmf
284K    ./Characters/ModBeasts/Hyena_cyb/hyena_cyb.cmf
280K    ./Areas/blackwolf2_.cmf
280K    ./Areas/blackwolf2.cmf
280K    ./Areas/DRM37/scel_conv/manip_surg_Volf.cmf
280K    ./Areas/DRM37/blackwolf2.cmf
276K    ./Characters/Actors/PistolShell/shell.cmf
272K    ./Characters/ModBeasts/Gorilla_cyb/gorilla_cyb.cmf
248K    ./Items/Weapon/Plasma/w_plasma.cmf
248K    ./Items/Weapon/Bazooka/w_bazooka.cmf
244K    ./Characters/Devices/Engine/engine.cmf
244K    ./Areas/DRM37/hmedman_2.cmf
240K    ./Items/Weapon/Howitzer/w_howitzer.cmf
240K    ./Entities/Walls/blok_128x128x128.cmf
236K    ./Characters/Devices/Manip_Arms/manipstol_r.cmf
236K    ./Characters/Devices/Manip_Arms/manipstol.cmf
236K    ./Areas/DRM37/manip_surg.cmf
236K    ./Areas/DRM37/man_one_prep1.cmf
228K    ./Weapon/M60/m60.cmf
228K    ./Areas/DRM37/man_prep2.cmf
216K    ./Areas/DRM36/robots/scelfbr4.cmf
216K    ./Areas/DRM36/robots/scelfbr2.cmf
208K    ./Weapon/M16/m16.cmf
208K    ./Entities/mikroskop.cmf
204K    ./Weapon/Sniper/sniper.cmf
204K    ./Characters/Devices/Surg_subject/sceleton_surg.cmf
204K    ./Characters/Animals/Hammerhead/ham_head.cmf
196K    ./Weapon/DblShotgun/dblshotgun.cmf
188K    ./Weapon/LandMine/landmine.cmf
188K    ./Weapon/Gauss/gauss.cmf
188K    ./Items/Weapon/Sniper_AP/w_sniper_ap.cmf
188K    ./Areas/DRM37/scel_conv/sceleton_K.cmf
184K    ./Weapon/Tesla/Tesla.cmf
180K    ./Weapon/HandGrenade/HandGrenade.cmf
180K    ./Areas/engine/engine.cmf
176K    ./Weapon/Shotgun/shotgun.cmf
176K    ./Weapon/Pistol/pistol.cmf
176K    ./Characters/Animals/Stingray/stingray.cmf
176K    ./Characters/Animals/Shark/shark.cmf
172K    ./Characters/Bosses/MBeast/final_m.cmf
172K    ./Areas/DRM37/manipstol.cmf
168K    ./Items/Weapon/M60/w_m60.cmf
168K    ./Areas/uncomplete.cmf
168K    ./Areas/DRM37/uncomplete.cmf
168K    ./Areas/DRM37/scel_prep.cmf
160K    ./Weapon/PPSH/ppsh.cmf
156K    ./Characters/Vehicles/Helicopter/heli_shadow.cmf
152K    ./Characters/Bosses/MBeast/final.cmf
152K    ./Areas/DRM37/scel_conv/sceleton2.cmf
148K    ./Characters/Bosses/MBeast/final_m_f.cmf
144K    ./Items/Waypoint/portal_old.cmf
144K    ./Flora/vadim/bmb_011.cmf
144K    ./Flora/vadim/bmb_010.cmf
144K    ./Flora/vadim/bmb_001.cmf
144K    ./Flora/vadim/bmb_000.cmf
140K    ./Entities/Walls/blok_512x64x64.cmf
136K    ./Entities/stul_lab.cmf
132K    ./Characters/Devices/Scel_wheels/wheels_vesh.cmf
132K    ./Areas/DRM37/scel_conv/wheels_vesh.cmf
128K    ./Areas/pult/pln_pult.cmf
128K    ./Areas/DRM36/robots/scelfbr3.cmf
128K    ./Areas/DRM36/robots/scelfbr1.cmf
120K    ./Items/Weapon/Pistol/w_pistol.cmf
120K    ./Entities/Walls/blok_128x128x64.cmf
116K    ./Sky/ssphere.cmf
116K    ./Items/Weapon/Tesla/w_tesla.cmf
116K    ./Items/Weapon/Shotgun/w_shotgun.cmf
116K    ./Characters/Bosses/MBeast/final_m_b.cmf
108K    ./Characters/Animals/Moth/moth.cmf
104K    ./Items/Weapon/PPSH/w_ppsh.cmf
100K    ./Flora/vadim/pl_coc_001.cmf
100K    ./Flora/vadim/pl_coc_000.cmf
100K    ./Flora/vadim/pl_bnn_001.cmf
100K    ./Flora/vadim/pl_bnn_000.cmf
100K    ./Flora/vadim/pl_00_000.cmf
96K     ./Items/Weapon/Sniper/w_sniper.cmf
96K     ./Items/Weapon/M16/w_m16.cmf
96K     ./Items/Ammo/a_bazooka.cmf
96K     ./Flora/vadim/pl_coc_b01.cmf
96K     ./Flora/vadim/pl_00_002.cmf
96K     ./Flora/vadim/pl_00_001.cmf
96K     ./Flora/vadim/palm_test.cmf
96K     ./Flora/vadim/bmb_012.cmf
96K     ./Flora/vadim/bmb_002.cmf
96K     ./Areas/DRM37/scel_conv/scel_wheels.cmf
92K     ./Weapon/Knife/knife.cmf
92K     ./Flora/vadim/evk_12.cmf
88K     ./Weapon/Scalpel/scalpel.cmf
88K     ./Flora/vadim/evk_10.cmf
88K     ./Flora/vadim/evk_04.cmf
88K     ./Characters/Devices/Cable/cable.cmf
84K     ./Weapon/M16_ST/m16_ST.cmf
84K     ./Items/Weapon/LandMine/w_landmine.cmf
84K     ./Items/Ammo/a_sniper.cmf
84K     ./Flora/vadim/test_000.cmf
80K     ./Items/Ammo/a_landmine.cmf
80K     ./Flora/vadim/test_001.cmf
76K     ./Items/Weapon/M16_ST/w_m16_st.cmf
76K     ./Items/Ammo/a_m60.cmf
72K     ./Entities/board1.cmf
68K     ./Items/Weapon/HandGrenade/w_grenade.cmf
68K     ./Items/Ammo/a_m16.cmf
68K     ./Items/Ammo/a_grenade.cmf
68K     ./Entities/board2.cmf
68K     ./Characters/Vehicles/Jeep/car_shadow.cmf
64K     ./Items/Waypoint/portal.cmf
64K     ./Flora/vadim/evk_03.cmf
64K     ./Entities/Box/TechBox2.cmf
64K     ./Areas/DRM37/ice.cmf
60K     ./Items/Ammo/a_tesla.cmf
60K     ./Flora/vadim/pl_coc_b00.cmf
60K     ./Flora/vadim/evk_02.cmf
60K     ./Flora/vadim/evk_01.cmf
56K     ./Entities/board3.cmf
56K     ./Entities/Walls/blok_128x64x64.cmf
56K     ./Characters/Animals/Gull/gull.cmf
52K     ./Items/Ammo/a_shotgun.cmf
52K     ./Flora/vadim/pl_5p_002.cmf
52K     ./Flora/vadim/pl_5p_001.cmf
52K     ./Flora/vadim/pl_5p_000.cmf
48K     ./Flora/vadim/pl_5p_b01.cmf
48K     ./Flora/Winter/w_tree_03.cmf
48K     ./Flora/Trees/AF/af_tree_03.cmf
48K     ./Entities/Box/CargoBox.cmf
44K     ./Items/Ammo/a_sniper_ap.cmf
44K     ./Flora/vadim/evk_s02.cmf
44K     ./Flora/vadim/evk_00.cmf
44K     ./Flora/Trees/AF/af_tree_01.cmf
44K     ./Entities/Box/MilitaryBox.cmf
40K     ./Items/Weapon/Knife/knife.cmf
40K     ./Items/Weapon/DblShotgun/w_dblshotgun.cmf
40K     ./Flora/vadim/test_grass_00.cmf
40K     ./Flora/vadim/test_grass.cmf
40K     ./Flora/vadim/g_pap_00.cmf
40K     ./Flora/vadim/g_list_10.cmf
40K     ./Flora/vadim/evk_s01.cmf
40K     ./Flora/Winter/w_tree_02.cmf
40K     ./Flora/Trees/AF/af_tree_02.cmf
40K     ./Flora/Alien_world/meteor2.cmf
40K     ./Flora/Alien_world/meteor.cmf
40K     ./Characters/Devices/Huk_wolf/huk_wolf.cmf
40K     ./Characters/Animals/Fish/fish.cmf
36K     ./Items/Weapon/Gauss/w_gauss.cmf
36K     ./Items/Ammo/a_pistol.cmf
36K     ./Flora/vadim/pl_dr_000.cmf
36K     ./Flora/vadim/pl_5p_b00.cmf
36K     ./Flora/Misc/AF/af_d_tr_02.cmf
36K     ./Flora/Misc/AF/af_d_tr_01.cmf
32K     ./Items/Weapon/Scalpel/scalpel.cmf
32K     ./Flora/vadim/g_mox_001.cmf
32K     ./Flora/vadim/evk_s00.cmf
32K     ./Flora/Winter/w_tree_01.cmf
32K     ./Entities/flank03_03.cmf
32K     ./Entities/flank03_02.cmf
32K     ./Entities/flank03_01.cmf
32K     ./Entities/flank03.cmf
32K     ./Entities/flank01_04.cmf
32K     ./Entities/flank01_03.cmf
32K     ./Entities/flank01_02.cmf
32K     ./Entities/flank01_01.cmf
32K     ./Entities/flank01.cmf
32K     ./Entities/box03.cmf
32K     ./Entities/box01_s70.cmf
32K     ./Entities/box01_s50.cmf
32K     ./Entities/box01.cmf
32K     ./Entities/barrel.cmf
28K     ./Gfx/Water/rain_drop1.cmf
28K     ./Gfx/Explosion/tesla_expl.cmf
28K     ./Flora/Trees/AF/af_tree_13.cmf
28K     ./Flora/Trees/AF/af_tree_04.cmf
28K     ./Flora/Misc/w_/w_stone_13.cmf
28K     ./Flora/Misc/w_/w_stone_12.cmf
28K     ./Flora/Misc/w_/w_stone_11b.cmf
28K     ./Flora/Misc/w_/w_stone_11.cmf
28K     ./Entities/h_trig_d2.cmf
28K     ./Entities/flank02_05.cmf
28K     ./Entities/flank02_04.cmf
28K     ./Entities/flank02_03.cmf
28K     ./Entities/flank02_02.cmf
28K     ./Entities/flank02_01.cmf
28K     ./Entities/flank02.cmf
28K     ./Entities/fire02.cmf
28K     ./Entities/fire01.cmf
28K     ./Entities/box02.cmf
28K     ./Areas/DRM37/huk_wolf.cmf
24K     ./Sky/SkyPlane.cmf
24K     ./Flora/vadim/g_mox_00.cmf
24K     ./Flora/vadim/g_hire_00.cmf
24K     ./Flora/Winter/w_tree_11.cmf
24K     ./Flora/Trees/nv/nv_elk01.cmf
24K     ./Flora/Trees/nv/nv_elk00.cmf
24K     ./Flora/Trees/EU/eu_tree_50.cmf
24K     ./Flora/Trees/EU/eu_tree_41.cmf
24K     ./Flora/Trees/EU/eu_tree_00.cmf
24K     ./Flora/Trees/EU/eu_elk00.cmf
24K     ./Flora/Trees/AF/af_tree_11.cmf
24K     ./Flora/Misc/AF/af_g_tr_01.cmf
24K     ./Flora/Misc/AF/af_d_tr_04.cmf
24K     ./Flora/Misc/AF/af_d_tr_033.cmf
24K     ./Entities/kolba_lej.cmf
24K     ./Entities/kolba.cmf
24K     ./Entities/cap.cmf
24K     ./Entities/Box/MilitaryCargoBox.cmf
20K     ./Items/Health/health_50.cmf
20K     ./Items/Health/health_25.cmf
20K     ./Gfx/Shots/g_bomb1.cmf
20K     ./Flora/Winter/w_tree_22.cmf
20K     ./Flora/Trees/nv/nv_tree_32.cmf
20K     ./Flora/Trees/nv/nv_tree_31.cmf
20K     ./Flora/Trees/nv/nv_tree_30.cmf
20K     ./Flora/Trees/nv/nv_tree_11.cmf
20K     ./Flora/Trees/nv/nv_tree_10.cmf
20K     ./Flora/Trees/nv/nv_elk12.cmf
20K     ./Flora/Trees/nv/nv_elk11.cmf
20K     ./Flora/Trees/nv/nv_elk10.cmf
20K     ./Flora/Trees/KN/kn_elk_02.cmf
20K     ./Flora/Trees/KN/kn_elk_01.cmf
20K     ./Flora/Trees/KN/kn_elk_00.cmf
20K     ./Flora/Trees/EU/eu_tree_40.cmf
20K     ./Flora/Trees/EU/eu_tree_11.cmf
20K     ./Flora/Trees/EU/eu_tree_10.cmf
20K     ./Flora/Trees/EU/eu_tree_02.cmf
20K     ./Flora/Trees/EU/eu_tp_01.cmf
20K     ./Flora/Trees/EU/eu_tp_00.cmf
20K     ./Flora/Trees/EU/eu_sna01.cmf
20K     ./Flora/Trees/AF/af_tree_22.cmf
20K     ./Flora/Trees/AF/af_tree_00.cmf
20K     ./Flora/Misc/AF/af_g_tr_02.cmf
20K     ./Flora/Misc/AF/af_d_tr_05.cmf
20K     ./Flora/Misc/AF/af_d_tr_03.cmf
20K     ./Flora/Misc/AF/af_d_tr_00.cmf
20K     ./Flora/Misc/AF/af_d_pl_10.cmf
20K     ./Flora/Bushes/EU/eu_bsh_12.cmf
20K     ./Flora/Bushes/EU/eu_bsh_10.cmf
20K     ./Entities/sensor.cmf
20K     ./Entities/h_trig_d3.cmf
20K     ./Entities/h_trig_d.cmf
20K     ./Entities/h_trig.cmf
20K     ./Entities/box04_s50.cmf
20K     ./Entities/box04.cmf
20K     ./Entities/Box/TechBox.cmf
20K     ./Entities/Box/TNTBox.cmf
16K     ./Flora/vadim/g_list_00.cmf
16K     ./Flora/Winter/w_tree_20.cmf
16K     ./Flora/Winter/w_tree_12.cmf
16K     ./Flora/Trees/nv/nv_tree_01.cmf
16K     ./Flora/Trees/nv/nv_tree_00.cmf
16K     ./Flora/Trees/nv/nv_elk21.cmf
16K     ./Flora/Trees/nv/nv_elk20.cmf
16K     ./Flora/Trees/EU/eu_tree_30.cmf
16K     ./Flora/Trees/EU/eu_tree_23.cmf
16K     ./Flora/Trees/EU/eu_tree_22.cmf
16K     ./Flora/Trees/EU/eu_sna00.cmf
16K     ./Flora/Trees/EU/eu_elk01.cmf
16K     ./Flora/Trees/AF/af_tree_21.cmf
16K     ./Flora/Trees/AF/af_tree_20.cmf
16K     ./Flora/Trees/AF/af_tree_12.cmf
16K     ./Flora/Trees/AF/af_plm_02.cmf
16K     ./Flora/Misc/w_/w_stone_v4.cmf
16K     ./Flora/Misc/w_/w_stone_v2.cmf
16K     ./Flora/Misc/w_/w_stone_01.cmf
16K     ./Flora/Misc/LI/lilia_f.cmf
16K     ./Flora/Misc/LI/lilia.cmf
16K     ./Flora/Bushes/AF/af_pbush_05.cmf
16K     ./Flora/Bushes/AF/af_pbush_02.cmf
16K     ./Flora/Bushes/AF/af_bush_11.cmf
16K     ./Flora/Bushes/AF/af_bush_10.cmf
16K     ./Flora/Bushes/AF/af_bambuk_03.cmf
16K     ./Entities/sens_up_down.cmf
16K     ./Entities/boxN03.cmf
12K     ./Gfx/Shots/rocket.cmf
12K     ./Gfx/Shells/largebullet_shell.cmf
12K     ./Gfx/Objects/cylinder_hi.cmf
12K     ./Gfx/Gibs/smeat03.cmf
12K     ./Gfx/Gibs/meat04.cmf
12K     ./Flora/Trees/EU/eu_tree_21.cmf
12K     ./Flora/Trees/EU/eu_tree_20.cmf
12K     ./Flora/Trees/AF/af_plm_04.cmf
12K     ./Flora/Trees/AF/af_plm_03.cmf
12K     ./Flora/Trees/AF/af_banan_00.cmf
12K     ./Flora/Misc/w_/w_stone_v3.cmf
12K     ./Flora/Misc/w_/w_stone_v1.cmf
12K     ./Flora/Misc/w_/w_stone_10.cmf
12K     ./Flora/Misc/w_/w_stone_02.cmf
12K     ./Flora/Misc/AF/af_g_tr_03.cmf
12K     ./Flora/Bushes/EU/eu_bush00.cmf
12K     ./Flora/Bushes/EU/eu_bsh_11.cmf
12K     ./Flora/Bushes/AF/af_pbush_01.cmf
12K     ./Flora/Bushes/AF/af_bambuk_01.cmf
12K     ./Flora/Bushes/AF/af_bambuk_00.cmf
12K     ./Entities/stul_lab_k.cmf
12K     ./Entities/flank02_k.cmf
8.0K    ./Items/Weapon/HandGrenade/w_grenade_col.cmf
8.0K    ./Items/Health/health_05.cmf
8.0K    ./Gfx/Water/rain_drop.cmf
8.0K    ./Gfx/Shots/teslafire.cmf
8.0K    ./Gfx/Shots/plasmafire.cmf
8.0K    ./Gfx/Shots/g_bomb.cmf
8.0K    ./Gfx/Shots/fireball.cmf
8.0K    ./Gfx/Shells/shotgun_shell.cmf
8.0K    ./Gfx/Shells/projectile_shell.cmf
8.0K    ./Gfx/Shells/bullet_shell.cmf
8.0K    ./Gfx/Gibs/ugolek.cmf
8.0K    ./Gfx/Gibs/smeat04.cmf
8.0K    ./Gfx/Gibs/smeat01.cmf
8.0K    ./Gfx/Gibs/rock2.cmf
8.0K    ./Gfx/Gibs/rock1.cmf
8.0K    ./Gfx/Gibs/rock.cmf
8.0K    ./Gfx/Gibs/meat08.cmf
8.0K    ./Gfx/Gibs/meat07.cmf
8.0K    ./Gfx/Gibs/meat06.cmf
8.0K    ./Gfx/Gibs/meat03.cmf
8.0K    ./Gfx/Gibs/meat02.cmf
8.0K    ./Gfx/Gibs/glass_frag02.cmf
8.0K    ./Gfx/Explosion/gr_rock.cmf
8.0K    ./Flora/vadim/g_old_br_00.cmf
8.0K    ./Flora/Trees/AF/af_plm_01.cmf
8.0K    ./Flora/Trees/AF/af_plm_00.cmf
8.0K    ./Flora/Misc/AF/af_wot_03.cmf
8.0K    ./Flora/Misc/AF/af_wot_02.cmf
8.0K    ./Flora/Misc/AF/af_wot_01.cmf
8.0K    ./Flora/Misc/AF/af_wot_00.cmf
8.0K    ./Flora/Flames/flame3.cmf
8.0K    ./Flora/Flames/flame2.cmf
8.0K    ./Flora/Flames/flame1.cmf
8.0K    ./Flora/Bushes/EU/eu_bush01.cmf
8.0K    ./Flora/Bushes/AF/af_pig_00.cmf
8.0K    ./Flora/Bushes/AF/af_pbush_03.cmf
8.0K    ./Flora/Bushes/AF/af_pbush_00.cmf
8.0K    ./Flora/Bushes/AF/af_bush_00.cmf
8.0K    ./Entities/kolba_lej_coll.cmf
8.0K    ./Entities/kolba_coll.cmf
8.0K    ./Entities/ice_wall.cmf
8.0K    ./Entities/flank01_k.cmf
8.0K    ./Entities/cap_coll.cmf
8.0K    ./Entities/barrel_box.cmf
8.0K    ./Entities/Box/TechBox2_Col.cmf
4.0K    ./Weapon/gui_mask_guard.cmf
4.0K    ./Weapon/gui_mask.cmf
4.0K    ./Weapon/Sniper_AP/armorsniper_sight.cmf
4.0K    ./Weapon/Sniper/sniper_sight.cmf
4.0K    ./Weapon/Gauss/gauss_sight.cmf
4.0K    ./Sky/sun2.cmf
4.0K    ./Sky/moon.cmf
4.0K    ./Gfx/Water/wwave64.cmf
4.0K    ./Gfx/Water/wfall.cmf
4.0K    ./Gfx/Water/waterfall.cmf
4.0K    ./Gfx/Shots/teslafire2.cmf
4.0K    ./Gfx/Shots/shotgun_fire2.cmf
4.0K    ./Gfx/Shots/shotgun_fire.cmf
4.0K    ./Gfx/Shots/shot.cmf
4.0K    ./Gfx/Shots/rocket_fire.cmf
4.0K    ./Gfx/Shots/propeller.cmf
4.0K    ./Gfx/Shots/ppsh_fire.cmf
4.0K    ./Gfx/Shots/plasmafire2.cmf
4.0K    ./Gfx/Shots/pistol_fire.cmf
4.0K    ./Gfx/Shots/m16fire.cmf
4.0K    ./Gfx/Shots/jet_fire.cmf
4.0K    ./Gfx/Shots/howitzer_fire.cmf
4.0K    ./Gfx/Shots/gunfire.cmf
4.0K    ./Gfx/Shots/gorilla_fire.cmf
4.0K    ./Gfx/Shots/gauss_fire.cmf
4.0K    ./Gfx/Shots/fire.cmf
4.0K    ./Gfx/Objects/waypoint_wave.cmf
4.0K    ./Gfx/Objects/waypoint_flare.cmf
4.0K    ./Gfx/Objects/surface.cmf
4.0K    ./Gfx/Objects/no_texture_surf.cmf
4.0K    ./Gfx/Objects/knifer.cmf
4.0K    ./Gfx/Objects/cylinder_low.cmf
4.0K    ./Gfx/Objects/box.cmf
4.0K    ./Gfx/Gibs/smeat02.cmf
4.0K    ./Gfx/Gibs/meat05.cmf
4.0K    ./Gfx/Gibs/meat01.cmf
4.0K    ./Gfx/Gibs/glass_frag03.cmf
4.0K    ./Gfx/Gibs/glass_frag01.cmf
4.0K    ./Gfx/Gibs/blood_drop.cmf
4.0K    ./Gfx/Explosion/spark02.cmf
4.0K    ./Gfx/Explosion/snowboom.cmf
4.0K    ./Gfx/Explosion/sandboom.cmf
4.0K    ./Gfx/Explosion/glass_blast01.cmf
4.0K    ./Gfx/Explosion/electric_arc.cmf
4.0K    ./Gfx/Explosion/boom03.cmf
4.0K    ./Flora/Misc/EU/eu_plv_02.cmf
4.0K    ./Flora/Misc/EU/eu_plv_01.cmf
4.0K    ./Flora/Misc/EU/eu_plv_00.cmf
4.0K    ./Flora/Misc/AF/af_trv_02.cmf
4.0K    ./Flora/Misc/AF/af_trv_01.cmf
4.0K    ./Flora/Misc/AF/af_trv_00.cmf
4.0K    ./Flora/Bushes/AF/grass02.cmf
4.0K    ./Flora/Bushes/AF/grass01.cmf
4.0K    ./Entities/letter_U.cmf
4.0K    ./Entities/letter_T.cmf
4.0K    ./Entities/letter_R.cmf
4.0K    ./Entities/letter_K.cmf
4.0K    ./Entities/doska_4.cmf
4.0K    ./Entities/doska_3.cmf
4.0K    ./Entities/doska_2.cmf
4.0K    ./Entities/doska_1.cmf
4.0K    ./Entities/doska.cmf
4.0K    ./Entities/brus_m.cmf
4.0K    ./Entities/brus_b.cmf
4.0K    ./Entities/boxn03_col.cmf
4.0K    ./Entities/box04_s50_k.cmf
4.0K    ./Entities/box04_k.cmf
4.0K    ./Entities/box03_k.cmf
4.0K    ./Entities/box02_k.cmf
4.0K    ./Entities/box01_s70_k.cmf
4.0K    ./Entities/box01_s50_k.cmf
4.0K    ./Entities/box01_k.cmf
4.0K    ./Entities/Walls/k_512_64_64.cmf
4.0K    ./Entities/Walls/k_128_64_64.cmf
4.0K    ./Entities/Walls/k_128_128_64.cmf
4.0K    ./Entities/Walls/k_128_128.cmf
4.0K    ./Entities/Box/TechBox_Col.cmf
4.0K    ./Entities/Box/TNTBox_col.cmf
4.0K    ./Entities/Box/MilitaryCargoBox_col.cmf
4.0K    ./Entities/Box/MilitaryBox_col.cmf
4.0K    ./Entities/Box/CargoBox_col.cmf
4.0K    ./Characters/Devices/Camera/camera.cmf
4.0K    ./Areas/DRM37/wfall.cmf
4.0K    ./Areas/DRM37/molniya.cmf
4.0K    ./Areas/DRM31a/TrainDebris2.cmf
4.0K    ./Areas/DRM31a/TrainDebris1.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_34.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_33.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_32.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_31.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_30.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_29.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_28.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_27.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_26.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_25.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_24.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_23.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_22.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_21.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_20.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_19.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_18.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_17.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_16.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_15.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_14.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_13.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_12.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_11.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_10.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_09.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_08.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_07.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_06.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_05.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_04.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_03.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_02.cmf
4.0K    ./Areas/DRM21/GlassGFX/kusok_01.cmf

*/
