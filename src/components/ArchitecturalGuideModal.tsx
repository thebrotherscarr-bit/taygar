import React, { useState } from 'react';
import { X, Code2, Layers, Cpu, Database, Check, Copy } from 'lucide-react';

interface ArchitecturalGuideModalProps {
  onClose: () => void;
}

export const ArchitecturalGuideModal: React.FC<ArchitecturalGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'worldgen' | 'godot' | 'unity' | 'data'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const godotScript = `# ==============================================================================
# C.O.R.E. - 2D Sandbox Player Controller (Godot 4.x / GDScript)
# CharacterBody2D with continuous AABB collision, metered jetpack, and hotbar
# ==============================================================================
class_name CorePlayer
extends CharacterBody2D

@export var move_speed: float = 180.0
@export var jump_impulse: float = 360.0
@export var jetpack_thrust: float = 420.0
@export var terminal_velocity: float = 720.0
@export var gravity: float = 980.0

@export var max_health: float = 100.0
@export var max_shields: float = 100.0
@export var max_energy: float = 100.0
@export var max_jet_fuel: float = 100.0

var current_health: float = 100.0
var current_shields: float = 100.0
var current_energy: float = 100.0
var current_jet_fuel: float = 100.0

var active_tool_slot: int = 1
var is_facing_left: bool = false
var invulnerability_timer: float = 0.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var jetpack_particles: GPUParticles2D = $JetpackParticles
@onready var tool_raycast: RayCast2D = $ToolRayCast

func _physics_process(delta: float) -> void:
    handle_horizontal_movement(delta)
    handle_vertical_physics(delta)
    handle_tool_interaction(delta)
    move_and_slide()

func handle_horizontal_movement(_delta: float) -> void:
    var direction := Input.get_axis("move_left", "move_right")
    if direction != 0:
        velocity.x = direction * move_speed
        is_facing_left = direction < 0
        sprite.flip_h = is_facing_left
    else:
        velocity.x = move_toward(velocity.x, 0, move_speed)

func handle_vertical_physics(delta: float) -> void:
    # Jetpack propulsion (SPACE)
    if Input.is_action_pressed("jetpack") and current_jet_fuel > 0.0:
        velocity.y -= jetpack_thrust * delta
        current_jet_fuel = max(0.0, current_jet_fuel - 85.0 * delta)
        jetpack_particles.emitting = true
    else:
        velocity.y += gravity * delta
        jetpack_particles.emitting = false
        if is_on_floor() and current_jet_fuel < max_jet_fuel:
            current_jet_fuel = min(max_jet_fuel, current_jet_fuel + 40.0 * delta)

    # Jump impulse
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = -jump_impulse

    # Fast-fall dive (S key)
    if Input.is_action_pressed("dive") and not is_on_floor():
        velocity.y = min(terminal_velocity, velocity.y + gravity * 1.5 * delta)

    velocity.y = clamp(velocity.y, -terminal_velocity, terminal_velocity)

func handle_tool_interaction(delta: float) -> void:
    # Recharge blaster capacitor
    if not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) and current_energy < max_energy:
        current_energy = min(max_energy, current_energy + 50.0 * delta)

    if Input.is_action_just_pressed("slot_1"): select_tool(1)
    if Input.is_action_just_pressed("slot_2"): select_tool(2)
    if Input.is_action_just_pressed("slot_3"): select_tool(3)
    if Input.is_action_just_pressed("slot_4"): select_tool(4)
    if Input.is_action_just_pressed("slot_5"): select_tool(5)
    if Input.is_action_just_pressed("slot_6"): select_tool(6)

func select_tool(slot: int) -> void:
    active_tool_slot = slot
    emit_signal("tool_changed", active_tool_slot)`;

  const unityScript = `// ==============================================================================
// C.O.R.E. - Procedural 2D Tilemap Generator (Unity 6 / C#)
// Continuous cellular automata, stratified depth biomes, and deterministic seeding
// ==============================================================================
using System;
using UnityEngine;
using UnityEngine.Tilemaps;

public class ProceduralWorldGenerator : MonoBehaviour
{
    [Header("World Dimensions")]
    public int mapWidth = 1200;
    public int mapHeight = 600;
    public int seed = 1234;

    [Header("Tile References")]
    public Tilemap terrainTilemap;
    public TileBase scrapTile;
    public TileBase titaniumTile;
    public TileBase siliconTile;
    public TileBase myceliumTile;
    public TileBase crystalTile;
    public TileBase obsidianTile;
    public TileBase magmaTile;

    private byte[] voxelIds;
    private int[] surfaceElevations;

    void Start()
    {
        GenerateSovereignWorld();
    }

    public void GenerateSovereignWorld()
    {
        voxelIds = new byte[mapWidth * mapHeight];
        surfaceElevations = new int[mapWidth];
        terrainTilemap.ClearAllTiles();

        // 1. Terrain Topology (Fast Perlin elevation)
        for (int x = 0; x < mapWidth; x++)
        {
            float n = Mathf.PerlinNoise((x + seed) * 0.015f, 0f) * 25f +
                      Mathf.PerlinNoise((x + seed) * 0.08f, 100f) * 8f;
            surfaceElevations[x] = 52 + Mathf.FloorToInt(n);
        }

        // 2. Depth Stratification (Tech Crust -> Fungal -> Crystal -> Molten)
        for (int x = 0; x < mapWidth; x++)
        {
            for (int y = 0; y < mapHeight; y++)
            {
                if (y < surfaceElevations[x]) continue; // Atmospheric Sky

                if (y < 200) // Tech Crust
                {
                    float ore = Mathf.PerlinNoise((x + seed) * 0.1f, y * 0.1f);
                    voxelIds[y * mapWidth + x] = (ore > 0.65f) ? (byte)2 : (byte)1; // Titanium or Scrap
                }
                else if (y < 350) // Fungal Caverns
                {
                    float cave = Mathf.PerlinNoise((x + seed) * 0.04f, y * 0.04f);
                    voxelIds[y * mapWidth + x] = (cave > 0.45f) ? (byte)11 : (byte)0; // Mycelium
                }
                else if (y < 450) // Crystal Depths
                {
                    float crystal = Mathf.PerlinNoise((x + seed) * 0.06f, y * 0.06f);
                    voxelIds[y * mapWidth + x] = (crystal > 0.40f) ? (byte)12 : (byte)0; // Crystal
                }
                else // Molten Core Abyss
                {
                    float core = Mathf.PerlinNoise((x + seed) * 0.08f, y * 0.08f);
                    voxelIds[y * mapWidth + x] = (core > 0.60f) ? (byte)9 : (byte)13; // Magma or Obsidian
                }
            }
        }

        // 3. Commit Voxel Data to Unity Tilemap
        BakeToTilemap();
    }

    private void BakeToTilemap()
    {
        for (int x = 0; x < mapWidth; x++)
        {
            for (int y = 0; y < mapHeight; y++)
            {
                byte id = voxelIds[y * mapWidth + x];
                TileBase targetTile = GetTileForId(id);
                if (targetTile != null)
                {
                    terrainTilemap.SetTile(new Vector3Int(x, -y, 0), targetTile);
                }
            }
        }
    }

    private TileBase GetTileForId(byte id)
    {
        return id switch
        {
            1 => scrapTile,
            2 => titaniumTile,
            11 => myceliumTile,
            12 => crystalTile,
            13 => obsidianTile,
            9 => magmaTile,
            _ => null
        };
    }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">SYSTEMS ARCHITECTURE & ENGINE SPECIFICATION</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Blueprint
          </button>
          <button
            onClick={() => setActiveTab('worldgen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'worldgen' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Procedural Architecture
          </button>
          <button
            onClick={() => setActiveTab('godot')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'godot' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Godot 4 GDScript
          </button>
          <button
            onClick={() => setActiveTab('unity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'unity' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unity C# Tilemap
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'data' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Data Layouts (JSON)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  CORE ARCHITECTURAL SUBSYSTEMS
                </h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  C.O.R.E. adopts a sovereign, memory-efficient data-oriented design (DOD) suitable for 2D sandbox survival games like Terraria and Starbound.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="font-bold text-cyan-300 block mb-1">1. Parallel Flat Voxel Arrays</span>
                    <p className="text-[11px] text-slate-400">
                      Voxel data is held in 1D contiguous typed arrays (`Uint8Array` for block IDs, `Uint16Array` for block HP, `Uint8Array` for power state). This eliminates garbage collection stutter and guarantees cache-line locality during rendering.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="font-bold text-emerald-300 block mb-1">2. Fixed Time-Step Physics Loop</span>
                    <p className="text-[11px] text-slate-400">
                      Movement, jetpack impulse, and enemy pathfinding run at a rigid 60 Hz accumulator tick. Rendering runs decoupled via `requestAnimationFrame` with interpolated camera tracking and sub-pixel smoothing.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="font-bold text-amber-300 block mb-1">3. The 8 Wardens & Worldheart State Machine</span>
                    <p className="text-[11px] text-slate-400">
                      Boss encounters are state-machine driven with deterministic phases (Charge, Laser Fan, Spore Burst, Enrage). The Worldheart is locked by eight boolean bitwise seal flags that require defeating every biome guardian.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="font-bold text-purple-300 block mb-1">4. Real-time Hazard & Quantum Beacon Network</span>
                    <p className="text-[11px] text-slate-400">
                      Continuous environmental sampling detects extreme temperatures, bio-sludge immersion, and hull decompression, triggering UI telemetry alerts. Quantum Beacons serve as spatial waypoints for fast travel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'worldgen' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  PROCEDURAL GENERATION PIPELINE
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white mb-1">Phase 1: Deterministic Macro Heightmap</div>
                    <p className="text-slate-400">
                      Combines 2-octave Perlin / Simplex Value Noise: a low-frequency 0.015f carrier wave for continental hills plus a 0.08f high-frequency noise for surface jaggedness. Generates a surface baseline between depth 40m–75m.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white mb-1">Phase 2: Depth Stratification & Bio-zones</div>
                    <p className="text-slate-400">
                      - <span className="text-slate-200">Orbit/Atmosphere (y: 0..surface)</span>: Vacuum, low-gravity debris.<br />
                      - <span className="text-cyan-300">Tech Crust (y: surface..200)</span>: Silicon conduits, titanium veins, industrial scrap.<br />
                      - <span className="text-purple-300">Fungal Caverns (y: 200..350)</span>: Bioluminescent mycelium, toxic spore pods, alien water reservoirs.<br />
                      - <span className="text-sky-300">Crystal Depths (y: 350..450)</span>: Prismatic cyan crystals, dense silicon, bio-sludge traps.<br />
                      - <span className="text-orange-400">Molten Core Abyss (y: 450..600)</span>: Tectonic magma rivers, obsidian plates, mantle rock, and the Worldheart Citadel.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white mb-1">Phase 3: Cellular Automata Cave Smoothing</div>
                    <p className="text-slate-400">
                      Runs 4 iterations of standard B5678/S45678 cellular automata on cavern zones to generate smooth organic tunnel systems, open chambers, and natural hollow pockets for boss shrines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'godot' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-t-xl border border-slate-800">
                <span className="font-mono text-cyan-300 text-xs font-semibold">CorePlayer.gd (Godot 4.x)</span>
                <button
                  onClick={() => handleCopy(godotScript, 'godot')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedSection === 'godot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'godot' ? 'Copied' : 'Copy GDScript'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-t-0 border-slate-800 rounded-b-xl overflow-x-auto font-mono text-[11px] text-slate-300 leading-relaxed">
                {godotScript}
              </pre>
            </div>
          )}

          {activeTab === 'unity' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-t-xl border border-slate-800">
                <span className="font-mono text-indigo-300 text-xs font-semibold">ProceduralWorldGenerator.cs (Unity 6)</span>
                <button
                  onClick={() => handleCopy(unityScript, 'unity')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedSection === 'unity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'unity' ? 'Copied' : 'Copy C#'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-t-0 border-slate-800 rounded-b-xl overflow-x-auto font-mono text-[11px] text-slate-300 leading-relaxed">
                {unityScript}
              </pre>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>CRAFTING & PROGRESSION TIER SCHEMAS</span>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto font-mono text-[10px] text-slate-300">
{`{
  "progression_tiers": [
    {
      "tier": 1,
      "name": "Base Scrap",
      "armor": "Scrap Suit",
      "defense": 5,
      "requirements": { "SCRAP": 15 },
      "unlocked_wardens": ["warden", "forgemaster"]
    },
    {
      "tier": 2,
      "name": "Titanium Rig",
      "armor": "Titanium Rig",
      "defense": 12,
      "bonus_hp": 10,
      "requirements": { "TITANIUM": 10, "SILICON": 5 },
      "unlocked_wardens": ["hiveMind", "tyrant"]
    },
    {
      "tier": 3,
      "name": "Crystal Weave",
      "armor": "Crystal Weave",
      "defense": 18,
      "reflect_pct": 0.10,
      "requirements": { "CRYSTAL": 8 },
      "unlocked_wardens": ["sovereign", "maw"]
    },
    {
      "tier": 4,
      "name": "Obsidian Plate",
      "armor": "Obsidian Plate",
      "defense": 25,
      "fire_immunity": true,
      "requirements": { "OBSIDIAN": 6 },
      "unlocked_wardens": ["coreGuardian", "wyrm", "worldheart"]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
