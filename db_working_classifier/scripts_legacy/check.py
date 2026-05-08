from collections import Counter

fasta_files = [
    "CPAP.fasta",
    "CPAP1.fasta",
    "CPAP3.fasta",
]

# Exact ChtBD2 motif:
# C X(11-12) C X(5) C X(9-14) C X(12-16) C X(6-8) C
exact_ranges = [
    (11, 12),
    (5, 5),
    (9, 14),
    (12, 16),
    (6, 8),
]

# Relaxed version for diagnosis only, not final classification
relaxed_ranges = [
    (8, 16),
    (3, 8),
    (7, 18),
    (10, 20),
    (4, 12),
]


def read_fasta(path):
    records = []
    name = None
    seq_parts = []

    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if line.startswith(">"):
                if name is not None:
                    records.append((name, "".join(seq_parts).upper()))
                name = line[1:].split()[0]
                seq_parts = []
            else:
                seq_parts.append(line)

        if name is not None:
            records.append((name, "".join(seq_parts).upper()))

    return records


def spacing_matches(spacings, ranges):
    return all(lo <= spacing <= hi for spacing, (lo, hi) in zip(spacings, ranges))


def distance_from_ranges(spacings, ranges):
    distance = 0

    for spacing, (lo, hi) in zip(spacings, ranges):
        if spacing < lo:
            distance += lo - spacing
        elif spacing > hi:
            distance += spacing - hi

    return distance


def scan_cysteine_windows(seq):
    cysteine_positions = [i for i, aa in enumerate(seq) if aa == "C"]

    windows = []

    for i in range(0, len(cysteine_positions) - 5):
        six_cys = cysteine_positions[i:i+6]

        spacings = [
            six_cys[j+1] - six_cys[j] - 1
            for j in range(5)
        ]

        start = six_cys[0]
        end = six_cys[-1]

        exact = spacing_matches(spacings, exact_ranges)
        relaxed = spacing_matches(spacings, relaxed_ranges)
        distance = distance_from_ranges(spacings, exact_ranges)

        windows.append({
            "start": start + 1,  # 1-based
            "end": end + 1,
            "spacings": spacings,
            "exact": exact,
            "relaxed": relaxed,
            "distance": distance,
        })

    return cysteine_positions, windows


out_file = "CPAP_ChtBD2_cysteine_spacing_check.tsv"

with open(out_file, "w") as out:
    out.write(
        "protein_id\tsource_fasta\tlength\tcysteine_count\t"
        "exact_ChtBD2_count\trelaxed_ChtBD2_count\t"
        "best_distance_from_exact\tbest_spacing\tbest_window_start\tbest_window_end\n"
    )

    for fasta in fasta_files:
        records = read_fasta(fasta)

        exact_count_distribution = Counter()
        relaxed_count_distribution = Counter()
        cysteine_count_distribution = Counter()

        print(f"\n{fasta}")
        print("-" * len(fasta))

        for name, seq in records:
            cysteine_positions, windows = scan_cysteine_windows(seq)

            exact_windows = [w for w in windows if w["exact"]]
            relaxed_windows = [w for w in windows if w["relaxed"]]

            exact_count = len(exact_windows)
            relaxed_count = len(relaxed_windows)

            exact_count_distribution[exact_count] += 1
            relaxed_count_distribution[relaxed_count] += 1
            cysteine_count_distribution[len(cysteine_positions)] += 1

            if windows:
                best = min(windows, key=lambda w: w["distance"])
                best_distance = best["distance"]
                best_spacing = ",".join(str(x) for x in best["spacings"])
                best_start = best["start"]
                best_end = best["end"]
            else:
                best_distance = "NA"
                best_spacing = "NA"
                best_start = "NA"
                best_end = "NA"

            out.write(
                f"{name}\t{fasta}\t{len(seq)}\t{len(cysteine_positions)}\t"
                f"{exact_count}\t{relaxed_count}\t"
                f"{best_distance}\t{best_spacing}\t{best_start}\t{best_end}\n"
            )

        print("Exact ChtBD2 count distribution:")
        for count, n in sorted(exact_count_distribution.items()):
            print(f"  {count} exact motif(s): {n}")

        print("Relaxed ChtBD2-like count distribution:")
        for count, n in sorted(relaxed_count_distribution.items()):
            print(f"  {count} relaxed motif(s): {n}")

        print("Cysteine count distribution:")
        for count, n in sorted(cysteine_count_distribution.items()):
            print(f"  {count} cysteine(s): {n}")

print(f"\nWrote detailed spacing table to {out_file}")
