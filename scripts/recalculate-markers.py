#!/usr/bin/env python3
"""Recalculate marker coordinates when a map's source dimensions change.

The marker JSON stores pixel coordinates as:
  coordinates.lat = pixel Y
  coordinates.lng = pixel X

This script scales both point markers and polygon vertices. It keeps the
marker hierarchy and all presentation metadata unchanged.

Examples:
  python scripts/recalculate-markers.py \
    public/markers/sever.json \
    --width 5120 --height 5632 \
    --output public/markers/sever.json

  # Do not overwrite the input; write to a new file instead:
  python scripts/recalculate-markers.py \
    public/markers/sever.json \
    --width 5120 --height 5632 \
    --output /tmp/sever.json
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any


def positive_number(value: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("must be a finite number greater than zero")
    return number


def scale_point(point: dict[str, Any], x_ratio: float, y_ratio: float) -> None:
    coordinates = point.get("coordinates")
    if isinstance(coordinates, dict):
        if isinstance(coordinates.get("lng"), (int, float)):
            coordinates["lng"] *= x_ratio
        if isinstance(coordinates.get("lat"), (int, float)):
            coordinates["lat"] *= y_ratio

    polygon_points = point.get("points")
    if isinstance(polygon_points, list):
        for vertex in polygon_points:
            if isinstance(vertex, dict):
                scale_point({"coordinates": vertex}, x_ratio, y_ratio)


def iter_groups(data: dict[str, Any]):
    for cluster in data.get("markers_clusters", []):
        for group in cluster.get("markers", []):
            if isinstance(group, dict):
                yield group


def recalculate(data: dict[str, Any], width: float, height: float) -> tuple[int, int]:
    old_image = data.get("image") or {}
    old_width = old_image.get("width")
    old_height = old_image.get("height")
    if not isinstance(old_width, (int, float)) or not isinstance(old_height, (int, float)):
        raise ValueError("input JSON must contain numeric image.width and image.height")
    if old_width <= 0 or old_height <= 0:
        raise ValueError("input image dimensions must be greater than zero")

    x_ratio = width / old_width
    y_ratio = height / old_height
    marker_count = 0
    polygon_count = 0

    for group in iter_groups(data):
        for marker in group.get("markers", []):
            if isinstance(marker, dict):
                scale_point(marker, x_ratio, y_ratio)
                marker_count += 1
        for polygon in group.get("polygons", []):
            if isinstance(polygon, dict):
                scale_point(polygon, x_ratio, y_ratio)
                polygon_count += 1

    data["image"] = {**old_image, "width": width, "height": height}
    return marker_count, polygon_count


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="source marker JSON")
    parser.add_argument("--width", required=True, type=positive_number, help="new map width in pixels")
    parser.add_argument("--height", required=True, type=positive_number, help="new map height in pixels")
    parser.add_argument("--output", type=Path, help="output JSON; defaults to replacing input")
    args = parser.parse_args()

    output = args.output or args.input
    with args.input.open(encoding="utf-8") as stream:
        data = json.load(stream)
    if not isinstance(data, dict):
        raise ValueError("input JSON root must be an object")

    marker_count, polygon_count = recalculate(data, args.width, args.height)
    with output.open("w", encoding="utf-8") as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write("\n")

    print(
        f"updated {output}: {marker_count} markers, {polygon_count} polygons; "
        f"image={int(args.width) if args.width.is_integer() else args.width}x"
        f"{int(args.height) if args.height.is_integer() else args.height}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
