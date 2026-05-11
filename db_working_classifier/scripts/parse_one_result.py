#!/usr/bin/env python3

import argparse
import json


RELATED_GROUPS = [
    {"CPAP1", "CPAP3"},
    {"CPR_RR-1", "CPR_RR-2"},
    {"CPF", "CPFL"},
]


def clean_model_name(model_name):
    """
    Make HMM model names nicer for display.

    Examples:
    CPAP3.aln -> CPAP3
    CPR_RR-1.clean_seed.aln -> CPR_RR-1
    CPR_combined.aln -> CPR
    Tweedle_Twdl.aln -> Tweedle
    """
    cleaned = (
        model_name
        .replace(".aln", "")
        .replace(".clean_seed", "")
    )

    display_names = {
        "CPR_combined": "CPR",
        "Tweedle_Twdl": "Tweedle",
    }

    return display_names.get(cleaned, cleaned)


def merged_coverage(ranges, length):
    """
    Calculate coverage from one or more coordinate ranges.
    """
    if not ranges or length == 0:
        return 0.0

    ranges = sorted(ranges)
    merged = []

    for start, end in ranges:
        if not merged or start > merged[-1][1] + 1:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)

    covered = sum(end - start + 1 for start, end in merged)
    return covered / length


def get_related_group(model):
    """
    Return the related-model group for models that need ambiguity checks.
    """
    for group in RELATED_GROUPS:
        if model in group:
            return group

    return None


def passes_basic_thresholds(hit):
    """
    Basic first-pass threshold for a meaningful classifier hit.
    """
    return (
        hit["evalue"] <= 1e-5
        and hit["bitscore"] >= 25
        and hit["model_coverage"] >= 0.30
    )


def assign_confidence(best_hit, ranked_hits):
    """
    Assign confidence using:
    1. Basic threshold checks.
    2. Ambiguity check among related classifier models.

    If a related model has a bit score within 10% of the best model,
    the result is marked ambiguous.
    """
    if not passes_basic_thresholds(best_hit):
        return "weak", "Best hit does not pass basic confidence thresholds."

    related_group = get_related_group(best_hit["model"])

    if related_group is not None:
        for hit in ranked_hits[1:]:
            if hit["model"] in related_group and passes_basic_thresholds(hit):
                score_ratio = hit["bitscore"] / best_hit["bitscore"]

                if score_ratio >= 0.90:
                    note = (
                        f"Ambiguous related hit: {hit['model']} has "
                        f"{score_ratio:.1%} of the best hit score."
                    )
                    return "ambiguous", note

    return "strong", "Best hit passes thresholds."


def parse_domtbl(domtbl):
    """
    Parse HMMER domtblout file and return ranked classifier hits.
    """
    hits = {}

    with open(domtbl) as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue

            parts = line.split()

            model = clean_model_name(parts[0])
            model_len = int(parts[2])
            query = parts[3]
            query_len = int(parts[5])

            full_evalue = float(parts[6])
            full_bitscore = float(parts[7])

            hmm_from = int(parts[15])
            hmm_to = int(parts[16])
            ali_from = int(parts[17])
            ali_to = int(parts[18])

            if model not in hits:
                hits[model] = {
                    "query": query,
                    "query_len": query_len,
                    "model": model,
                    "model_len": model_len,
                    "evalue": full_evalue,
                    "bitscore": full_bitscore,
                    "hmm_ranges": [],
                    "ali_ranges": [],
                }

            hits[model]["hmm_ranges"].append((hmm_from, hmm_to))
            hits[model]["ali_ranges"].append((ali_from, ali_to))

    for hit in hits.values():
        hit["model_coverage"] = merged_coverage(
            hit["hmm_ranges"],
            hit["model_len"]
        )
        hit["query_coverage"] = merged_coverage(
            hit["ali_ranges"],
            hit["query_len"]
        )

    ranked_hits = sorted(
        hits.values(),
        key=lambda x: x["bitscore"],
        reverse=True
    )

    return ranked_hits


def build_result(ranked_hits):
    """
    Build one structured classifier result.
    """
    if not ranked_hits:
        return {
            "query": None,
            "prediction": "No confident Cuticulome.org family detected",
            "confidence": "none",
            "best_hit": None,
            "all_hits": [],
            "note": "No HMM hits were found.",
        }

    best = ranked_hits[0]
    confidence, note = assign_confidence(best, ranked_hits)

    prediction = best["model"]

    if confidence == "weak":
        prediction = "No confident Cuticulome.org family detected"

    return {
        "query": best["query"],
        "prediction": prediction,
        "confidence": confidence,
        "best_hit": {
            "model": best["model"],
            "evalue": best["evalue"],
            "bitscore": best["bitscore"],
            "model_coverage": best["model_coverage"],
            "query_coverage": best["query_coverage"],
        },
        "all_hits": [
            {
                "model": hit["model"],
                "evalue": hit["evalue"],
                "bitscore": hit["bitscore"],
                "model_coverage": hit["model_coverage"],
                "query_coverage": hit["query_coverage"],
            }
            for hit in ranked_hits
        ],
        "note": note,
    }


def print_text_result(result):
    """
    Print human-readable result.
    """
    if result["best_hit"] is None:
        print("No HMM hits found.")
        return

    best = result["best_hit"]

    print("Best classifier hit")
    print("-------------------")
    print(f"Query:          {result['query']}")
    print(f"Best model:     {best['model']}")
    print(f"Prediction:     {result['prediction']}")
    print(f"Confidence:     {result['confidence']}")
    print(f"E-value:        {best['evalue']:.2e}")
    print(f"Bit score:      {best['bitscore']:.1f}")
    print(f"Model coverage: {best['model_coverage']:.2%}")
    print(f"Query coverage: {best['query_coverage']:.2%}")
    print(f"Note:           {result['note']}")

    print("\nAll model hits")
    print("--------------")

    for hit in result["all_hits"]:
        print(
            f"{hit['model']}\t"
            f"e={hit['evalue']:.2e}\t"
            f"score={hit['bitscore']:.1f}\t"
            f"model_cov={hit['model_coverage']:.2%}\t"
            f"query_cov={hit['query_coverage']:.2%}"
        )


def main():
    parser = argparse.ArgumentParser(
        description="Parse one Cuticulome.org HMMER domtblout result."
    )

    parser.add_argument(
        "domtbl",
        help="Input HMMER domtblout file."
    )

    parser.add_argument(
        "--json",
        action="store_true",
        help="Print result as JSON."
    )

    args = parser.parse_args()

    ranked_hits = parse_domtbl(args.domtbl)
    result = build_result(ranked_hits)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print_text_result(result)


if __name__ == "__main__":
    main()
