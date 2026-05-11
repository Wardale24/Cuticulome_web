#!/usr/bin/env python3

import argparse
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="Classify one amino acid FASTA sequence using Cuticulome.org HMM classifiers."
    )

    parser.add_argument(
        "--fasta",
        required=True,
        help="Input FASTA file containing one amino acid sequence."
    )

    parser.add_argument(
        "--hmmdb",
        default="classifier_db/cuticulome_classifiers.hmm",
        help="Pressed HMM database."
    )

    parser.add_argument(
        "--outdir",
        default="test_results",
        help="Output directory for temporary/result files."
    )

    parser.add_argument(
        "--json",
        action="store_true",
        help="Print result as JSON."
    )

    args = parser.parse_args()

    fasta = Path(args.fasta)
    hmmdb = Path(args.hmmdb)
    outdir = Path(args.outdir)

    if not fasta.exists():
        sys.exit(f"ERROR: FASTA file not found: {fasta}")

    if not hmmdb.exists():
        sys.exit(f"ERROR: HMM database not found: {hmmdb}")

    outdir.mkdir(parents=True, exist_ok=True)

    stem = fasta.stem
    domtbl = outdir / f"{stem}.domtbl"
    hmmscan_txt = outdir / f"{stem}.hmmscan.txt"

    hmmscan_cmd = [
        "hmmscan",
        "--domtblout",
        str(domtbl),
        str(hmmdb),
        str(fasta),
    ]

    with open(hmmscan_txt, "w") as hmmscan_out:
        subprocess.run(
            hmmscan_cmd,
            stdout=hmmscan_out,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )

    parse_cmd = [
        "python",
        "scripts/parse_one_result.py",
        str(domtbl),
    ]

    if args.json:
        parse_cmd.append("--json")

    subprocess.run(parse_cmd, check=True)


if __name__ == "__main__":
    main()
