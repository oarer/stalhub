#!/usr/bin/env python3
"""Verify representative regressions fail, only in disposable source copies."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
MUTATIONS = [
    ("first shot incorrectly delayed", "src/views/calcs/ttk/utils/ttk.ts", "(shots - 1) * (60 / rofConfig.rof)", "shots * (60 / rofConfig.rof)", "ttk.test.ts"),
    ("caliber prefix collision", "src/views/calcs/ttk/utils/ammo.ts", "p === `item.amm.${itemCaliber}`", "`item.amm.${itemCaliber}`.startsWith(p)", "ttk.test.ts"),
    ("upgrade omits attempt cost", "src/views/calcs/upgrade/utils/upgrade.ts", "costs.attemptCost +", "0 +", "upgrade.test.ts"),
    ("boost multiplier removed", "src/views/calcs/bp/utils/bp.ts", "Math.round(daily * BP_BOOST_MULT)", "Math.round(daily)", "battle-pass.test.ts"),
    ("future import version accepted", "src/lib/localData.ts", "parsed.v === 1", "parsed.v === 2", "local-data.test.ts"),
    ("wrong stock affordability boundary", "src/views/calcs/barter/components/calcUtils.ts", "ev.total <= stock", "ev.total < stock", "barter.test.ts"),
]


def run(directory, testfile=None):
    command = ["bun", "--no-env-file", "test", "./tests" + ("/" + testfile if testfile else "")]
    result = subprocess.run(command, cwd=directory, capture_output=True, text=True, timeout=60)
    return result.returncode, result.stdout + result.stderr


def main():
    with tempfile.TemporaryDirectory(prefix="stalhub-regression-") as temporary:
        work = Path(temporary)
        for directory in ["src", "tests"]:
            shutil.copytree(ROOT / directory, work / directory, ignore=shutil.ignore_patterns(".env*", "__pycache__"))
        shutil.copyfile(ROOT / "tsconfig.json", work / "tsconfig.json")
        os.symlink(ROOT / "node_modules", work / "node_modules", target_is_directory=True)
        status, output = run(work)
        if status:
            print(output)
            raise SystemExit("Disposable-copy baseline failed")
        print("PASS: disposable-copy baseline")
        detected = 0
        for label, filename, original, replacement, testfile in MUTATIONS:
            target = work / filename
            source = target.read_text()
            if original not in source:
                raise SystemExit("Mutation target missing: " + label)
            target.write_text(source.replace(original, replacement, 1))
            try:
                status, output = run(work, testfile)
                if status != 1 or "(fail)" not in output or "error: expect(" not in output:
                    print(output)
                    raise SystemExit("Mutation survived or failed for wrong reason: " + label)
                detected += 1
                print("DETECTED: " + label)
            finally:
                target.write_text(source)
        print(f"PASS: {detected}/{len(MUTATIONS)} mutations detected by assertion failures")


if __name__ == "__main__":
    main()
