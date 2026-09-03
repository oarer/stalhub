"""Build a JSON map between binary models, MCMTL materials and localized names.

The script does not copy assets. It records paths to the original files and
resolves references to local .ol files.

"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

MODEL_SUFFIXES = {"_hands", "_split", "_lod", "_lod1", "_lod2", "_lod3"}
IGNORED_TEXTURE_TOKENS = ("sleeves", "steve")
IGNORED_MATERIALS = {"glass"}
PRIORITIZED_MATERIALS = {"body"}
MAP_KEYS = {
    "diffuse map": "diffuse",
    "normal map": "normal",
    "specular map": "specular",
    "emission map": "emission",
}
REF_RE = re.compile(r"^(?P<key>diffuse|normal|specular|emission) map\s+(?P<value>\S+)", re.I)
LOC_RE = re.compile(r"^(?P<key>item\.(?P<namespace>.+)\.(?P<id>[^.=]+)\.name)=(?P<value>.*)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        "--source",
        dest="inputs",
        required=True,
        action="append",
        type=Path,
        metavar="PATH",
        help="source directory containing assets; repeat for multiple paths (alias: --source)",
    )
    parser.add_argument("--output", required=True, type=Path, help="JSON output path")
    parser.add_argument("--lang-dir", required=True, type=Path, help="directory containing *.lang files")
    parser.add_argument(
        "--materials-root",
        required=True,
        action="append",
        type=Path,
        metavar="PATH",
        help="assets root used namespaces; repeat for multiple roots",
    )
    parser.add_argument(
        "--paint-config-dir",
        type=Path,
        help="directory containing skins*.json paint configuration files",
    )
    parser.add_argument(
        "--paint-texture-root",
        action="append",
        type=Path,
        metavar="PATH",
        help="root containing local paint textures; repeat for multiple roots",
    )
    parser.add_argument("--interactive", action="store_true", help="choose between ambiguous or texture matches")
    parser.add_argument("--include-suffixed-models", action="store_true", help="also process _hands/_split/_lod models")
    parser.add_argument("--pretty", action="store_true", help="pretty-print JSON (default is already readable)")
    parser.add_argument("--quiet", action="store_true", help="suppress progress output")
    parser.add_argument("--cdn-base", default="https://cdn.stalhub.dev/sc", help="base URL for converted browser assets")
    return parser.parse_args()


def read_localizations(root: Path) -> tuple[dict[str, dict[str, str]], list[str]]:
    values: dict[str, dict[str, str]] = defaultdict(dict)
    warnings: list[str] = []
    if not root.is_dir():
        raise ValueError(f"localization directory does not exist: {root}")
    for path in sorted(root.glob("*.lang")):
        locale = path.stem
        try:
            text = path.read_text(encoding="utf-8-sig", errors="replace")
        except OSError as exc:
            warnings.append(f"cannot read localization {path}: {exc}")
            continue
        for line in text.splitlines():
            match = LOC_RE.match(line.strip())
            if match:
                localized = match.group("value")
                values[match.group("id")][locale] = localized
                values[match.group("key")[5:-5]][locale] = localized
    return dict(values), warnings


def choose(candidates: list[Path], label: str, interactive: bool) -> Path | None:
    candidates = sorted(set(candidates), key=lambda p: str(p).lower())
    if not candidates:
        return None
    if len(candidates) == 1 or not interactive:
        return candidates[0]
    print(f"\\nНесколько вариантов для {label}:")
    for index, path in enumerate(candidates, 1):
        print(f"  [{index}] {path}")
    while True:
        answer = input("Выберите номер (Enter — первый, q — пропустить): ").strip().lower()
        if answer == "":
            return candidates[0]
        if answer == "q":
            return None
        if answer.isdigit() and 1 <= int(answer) <= len(candidates):
            return candidates[int(answer) - 1]
        print("Некорректный выбор")


def parse_mcmtl(path: Path) -> list[dict[str, Any]]:
    materials: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return materials
    for raw in lines:
        line = raw.strip()
        if line.lower().startswith("newmtl "):
            name = line[7:].strip()
            if name.lower() in IGNORED_MATERIALS:
                current = None
                continue
            current = {"name": name, "maps": {}}
            materials.append(current)
            continue
        if current is None:
            continue
        match = REF_RE.match(line)
        if match:
            current["maps"][match.group("key").lower()] = match.group("value")
    materials.sort(key=lambda m: 0 if m["name"].lower() in PRIORITIZED_MATERIALS else 1)
    return materials


def parse_relaxed_json(path: Path) -> Any:
    """Parse extracted config JSON containing comments and trailing commas."""
    text = path.read_text(encoding="utf-8", errors="replace")
    text = re.sub(r"//[^\n\r]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def parse_paints(config_dir: Path | None, texture_roots: list[Path], localizations: dict[str, dict[str, str]], roots: tuple[Path, ...], cdn_base: str) -> tuple[list[dict[str, Any]], list[str]]:
    if config_dir is None:
        return [], []
    if not config_dir.is_dir():
        return [], [f"paint config directory does not exist: {config_dir}"]
    file_index = build_file_index(texture_roots)
    paints: list[dict[str, Any]] = []
    warnings: list[str] = []
    for config in sorted(config_dir.glob("skins*.json")):
        try:
            records = parse_relaxed_json(config)
        except (OSError, json.JSONDecodeError) as exc:
            warnings.append(f"cannot parse paint config {config}: {exc}")
            continue
        if not isinstance(records, list):
            warnings.append(f"paint config is not an array: {config}")
            continue
        for record in records:
            if not isinstance(record, dict) or record.get("type") not in {"item_skin", "armor_motif", "weapon_motif"}:
                continue
            key = record.get("unlocalized_name")
            if not isinstance(key, str):
                continue
            textures: dict[str, Any] = {}
            for config_key, output_key in (("diffuse_map", "diffuse"), ("normal_map", "normal"), ("specular_map", "specular"), ("emission_map", "emission")):
                reference = record.get(config_key)
                if not isinstance(reference, str):
                    continue
                filename = Path(reference.replace("\\", "/")).name
                candidates = list(dict.fromkeys(file_index.get(filename.lower(), []) + file_index.get(Path(filename).with_suffix(".ol").name.lower(), [])))
                textures[output_key] = {
                    "reference": reference,
                    "path": relative_or_absolute(candidates[0], roots) if candidates else None,
                    "url": reference_url(reference, cdn_base),
                }
                if not candidates:
                    warnings.append(f"paint texture not found: {reference}")
            paints.append({"id": record.get("item_id"), "unlocalized_name": key, "names": localizations.get(key, {}), "textures": textures, "source_config": relative_or_absolute(config, roots)})
    return paints, warnings


def namespace_references(value: str, materials_roots: list[Path]) -> list[Path]:
    if ":" not in value:
        return []
    namespace, relative = value.split(":", 1)
    relative = relative.replace("\\", "/").lstrip("/")
    return [root / namespace / relative for root in materials_roots]


def build_file_index(roots: list[Path]) -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = defaultdict(list)
    for root in roots:
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if path.is_file():
                resolved = path.resolve()
                if resolved not in index[path.name.lower()]:
                    index[path.name.lower()].append(resolved)
    return {name: sorted(paths, key=lambda path: str(path).lower()) for name, paths in index.items()}


def texture_candidates(reference: str, materials_roots: list[Path], input_root: Path, file_index: dict[str, list[Path]]) -> list[Path]:
    candidates: list[Path] = []
    for direct in namespace_references(reference, materials_roots):
        candidates.extend([direct, direct.with_suffix(".ol")])
        # Some extracted trees preserve the reference path below input.
        candidates.extend([input_root / direct.name, input_root / Path(direct).name])
    raw_name = Path(reference.split(":", 1)[-1].replace("\\", "/")).name
    candidates.extend(file_index.get(raw_name.lower(), []))
    candidates.extend(file_index.get(Path(raw_name).with_suffix(".ol").name.lower(), []))
    return [path for path in dict.fromkeys(candidates) if path.is_file()]


def texture_is_ignored(reference: str, path: str | None = None) -> bool:
    haystack = f"{reference} {path or ''}".lower()
    return any(token in haystack for token in IGNORED_TEXTURE_TOKENS)


def model_is_primary(path: Path, include_suffixed: bool) -> bool:
    if include_suffixed:
        return True
    stem = path.stem.lower()
    return not any(stem.endswith(suffix) for suffix in MODEL_SUFFIXES)


def relative_or_absolute(path: Path, roots: tuple[Path, ...]) -> str:
    for root in roots:
        try:
            return path.relative_to(root).as_posix()
        except ValueError:
            pass
    return str(path)


def source_url(path: str, cdn_base: str) -> str:
    normalized = path.replace("\\", "/")
    markers = (("/stalker/models/", "stalker/models/"), ("/weapons/models/", "weapons/models/"))
    for marker, prefix in markers:
        if marker in normalized:
            relative = prefix + normalized.split(marker, 1)[1]
            break
    else:
        relative = normalized.removeprefix("models/")
    return f"{cdn_base.rstrip('/')}/{relative}".replace(".mcsb", ".glb").replace(".ol", ".dds")


def reference_url(reference: str, cdn_base: str) -> str:
    if ":" in reference:
        namespace, relative = reference.split(":", 1)
        relative = relative.replace("\\", "/").lstrip("/")
        return f"{cdn_base.rstrip('/')}/{namespace}/{relative}".replace(".ol", ".dds")
    return f"{cdn_base.rstrip('/')}/{reference.lstrip('/')}".replace(".ol", ".dds")


def build_map(args: argparse.Namespace) -> dict[str, Any]:
    for input_root in args.inputs:
        if not input_root.is_dir():
            raise ValueError(f"input directory does not exist: {input_root}")
    localizations, localization_warnings = read_localizations(args.lang_dir)
    models = [p for root in args.inputs for p in sorted(root.rglob("*.mcsb")) if model_is_primary(p, args.include_suffixed_models)]
    indexed_roots = [*args.inputs, *args.materials_root, *(args.paint_texture_root or [])]
    file_index = build_file_index(indexed_roots)
    material_index = {
        name: paths for name, paths in file_index.items() if name.endswith(".mcmtl")
    }
    all_warnings = list(localization_warnings)
    items: list[dict[str, Any]] = []
    unmatched: dict[str, list[str]] = {"models": [], "materials": [], "textures": [], "localization": []}
    ambiguities: list[dict[str, Any]] = []
    roots = tuple(indexed_roots)

    total_models = len(models)
    if not args.quiet:
        print(f"Индексировано файлов: {sum(len(paths) for paths in file_index.values())}", flush=True)
        print(f"Моделей к обработке: {total_models}", flush=True)

    for model_number, model in enumerate(models, 1):
        if not args.quiet:
            print(f"[{model_number}/{total_models}] {relative_or_absolute(model, tuple(args.inputs))}", flush=True)
        item_id = model.stem
        names = localizations.get(item_id, {})
        if not names:
            unmatched["localization"].append(item_id)
        mcmtls = material_index.get(f"{model.stem}.mcmtl".lower(), [])
        if len(mcmtls) > 1:
            ambiguities.append({
                "type": "material",
                "item_id": item_id,
                "candidates": [relative_or_absolute(path, roots) for path in mcmtls],
                "selected": None,
            })
        selected_mtl = choose(mcmtls, f"MCMTL для {item_id}", args.interactive)
        for ambiguity in reversed(ambiguities):
            if ambiguity["type"] == "material" and ambiguity["item_id"] == item_id and ambiguity["selected"] is None:
                ambiguity["selected"] = relative_or_absolute(selected_mtl, roots) if selected_mtl else None
                break
        if not selected_mtl:
            unmatched["materials"].append(str(model))
        material_records: list[dict[str, Any]] = []
        texture_records: dict[str, list[dict[str, str]]] = {key: [] for key in MAP_KEYS.values()}
        seen: dict[str, set[str]] = defaultdict(set)
        if selected_mtl:
            for material in parse_mcmtl(selected_mtl):
                maps: dict[str, Any] = {}
                for map_key, reference in material["maps"].items():
                    if texture_is_ignored(reference):
                        continue
                    candidates = texture_candidates(reference, args.materials_root, args.inputs[0], file_index)
                    if len(candidates) > 1:
                        ambiguities.append({
                            "type": "texture",
                            "item_id": item_id,
                            "reference": reference,
                            "candidates": [relative_or_absolute(path, roots) for path in candidates],
                            "selected": None,
                        })
                    selected_texture = choose(candidates, f"текстура {reference}", args.interactive)
                    if not selected_texture:
                        unmatched["textures"].append(reference)
                        maps[map_key] = {"reference": reference, "path": None}
                        continue
                    path_string = relative_or_absolute(selected_texture, roots)
                    if texture_is_ignored(reference, path_string):
                        continue
                    for ambiguity in reversed(ambiguities):
                        if (
                            ambiguity["type"] == "texture"
                            and ambiguity["item_id"] == item_id
                            and ambiguity["reference"] == reference
                            and ambiguity["selected"] is None
                        ):
                            ambiguity["selected"] = path_string
                            break
                    maps[map_key] = {"reference": reference, "path": path_string}
                    if map_key in texture_records and path_string not in seen[map_key]:
                        seen[map_key].add(path_string)
                        texture_records[map_key].append({"path": path_string, "reference": reference})
                if maps:
                    material_records.append({"name": material["name"], "maps": maps})
        items.append({
            "id": item_id,
            "names": names,
            "models": [{"path": relative_or_absolute(model, roots), "url": source_url(str(model), args.cdn_base)}],
            "materials": [{"path": relative_or_absolute(selected_mtl, roots), "materials": material_records}] if selected_mtl else [],
            "textures": texture_records,
            "warnings": ([] if names else [f"no item.*.{item_id}.name localization"]),
        })

    paints, paint_warnings = parse_paints(args.paint_config_dir, args.paint_texture_root or [], localizations, roots, args.cdn_base)
    all_warnings.extend(paint_warnings)
    if not models:
        unmatched["models"].extend(str(root) for root in args.inputs)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "items": items,
        "paints": paints,
        "ambiguities": ambiguities,
    }


def main() -> int:
    args = parse_args()
    try:
        result = build_map(args)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    print(f"wrote {args.output}: {len(result['items'])} items")
    print(f"unmatched: {sum(len(v) for v in result['unmatched'].values())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
