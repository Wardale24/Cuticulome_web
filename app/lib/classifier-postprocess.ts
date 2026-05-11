export type ClassifierHit = {
  model: string;
  evalue: number;
  bitscore: number;
  model_coverage: number;
  query_coverage: number;
};

export type ClassifierResult = {
  prediction: string;
  confidence: string;
  confidenceLabel?: string;
  queryLength: number;
  interpretation: string;
  best_hit: ClassifierHit | null;
  all_hits: ClassifierHit[];
  note?: string;
};

type HierarchyRule = {
  parent: string;
  children: string[];
  familyLabel: string;
  subclassLabel: string;
  subclassQuestion: string;
};

const HIERARCHY_RULES: HierarchyRule[] = [
  {
    parent: "CPR",
    children: [
      "CPR_RR-1",
      "CPR_RR-2",
      "CPR_RR_1",
      "CPR_RR_2",
      "CPR_RR1",
      "CPR_RR2",
      "CPR RR-1",
      "CPR RR-2",
    ],
    familyLabel: "CPR",
    subclassLabel: "RR subclass",
    subclassQuestion: "RR-1 or RR-2",
  },
  {
    parent: "CPAP",
    children: ["CPAP1", "CPAP3", "CPAP_1", "CPAP_3", "CPAP-1", "CPAP-3"],
    familyLabel: "CPAP",
    subclassLabel: "CPAP subclass",
    subclassQuestion: "CPAP1 or CPAP3",
  },
  {
    parent: "CPLC",
    children: ["CPLCA", "CPLCG", "CPLCP", "CPLCW"],
    familyLabel: "CPLC",
    subclassLabel: "CPLC subclass",
    subclassQuestion: "which CPLC subclass",
  },
];

function normalizeModelName(model: string) {
  return model
    .trim()
    .toUpperCase()
    .replace(/\.TRIMMED(?:\.HMM)?$/i, "")
    .replace(/\.HMM$/i, "")
    .replace(/[\s-]+/g, "_");
}

function cleanKnownModelNamesInText(text: string) {
  return text
    .replace(/CPR[\s_-]*RR[\s_-]*1(?:\.trimmed)?(?:\.hmm)?/gi, "CPR RR-1")
    .replace(/CPR[\s_-]*RR[\s_-]*2(?:\.trimmed)?(?:\.hmm)?/gi, "CPR RR-2")
    .replace(/CPAP[\s_-]*1(?:\.trimmed)?(?:\.hmm)?/gi, "CPAP1")
    .replace(/CPAP[\s_-]*3(?:\.trimmed)?(?:\.hmm)?/gi, "CPAP3");
}

function displayModelName(model: string) {
  const cleanedModel = cleanKnownModelNamesInText(model.trim());

  return cleanedModel
    .replace(/\.trimmed(?:\.hmm)?$/i, "")
    .replace(/\.hmm$/i, "");
}

function cleanHitModelName(hit: ClassifierHit): ClassifierHit {
  return {
    ...hit,
    model: displayModelName(hit.model),
  };
}

function cleanResultModelNames(result: ClassifierResult): ClassifierResult {
  return {
    ...result,
    prediction: displayModelName(result.prediction),
    interpretation: cleanKnownModelNamesInText(result.interpretation),
    best_hit: result.best_hit ? cleanHitModelName(result.best_hit) : null,
    all_hits: result.all_hits.map(cleanHitModelName),
  };
}

function modelMatches(model: string, expectedModel: string) {
  return normalizeModelName(model) === normalizeModelName(expectedModel);
}

function findHit(hits: ClassifierHit[], model: string) {
  return hits.find((hit) => modelMatches(hit.model, model)) ?? null;
}

function formatEvalue(value: number) {
  if (value === 0) {
    return "0";
  }

  return value.toExponential(2);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function describeHit(hit: ClassifierHit) {
  return `${displayModelName(hit.model)}: E-value ${formatEvalue(
    hit.evalue
  )}, bit score ${hit.bitscore.toFixed(1)}, model coverage ${formatPercent(
    hit.model_coverage
  )}, query coverage ${formatPercent(hit.query_coverage)}`;
}

function isSupportedSubclassHit(hit: ClassifierHit) {
  return (
    hit.evalue <= 1e-5 &&
    hit.bitscore >= 20 &&
    hit.model_coverage >= 0.25
  );
}

function isStrongSubclassHit(hit: ClassifierHit) {
  return (
    hit.evalue <= 1e-10 &&
    hit.bitscore >= 40 &&
    hit.model_coverage >= 0.4
  );
}

function sortHitsByStrength(a: ClassifierHit, b: ClassifierHit) {
  if (a.evalue !== b.evalue) {
    return a.evalue - b.evalue;
  }

  if (b.bitscore !== a.bitscore) {
    return b.bitscore - a.bitscore;
  }

  if (b.model_coverage !== a.model_coverage) {
    return b.model_coverage - a.model_coverage;
  }

  return b.query_coverage - a.query_coverage;
}

function subclassIsCloseEnoughToParent({
  parentHit,
  subclassHit,
}: {
  parentHit: ClassifierHit;
  subclassHit: ClassifierHit;
}) {
  return (
    subclassHit.bitscore >= parentHit.bitscore * 0.7 ||
    subclassHit.evalue <= 1e-10
  );
}

function subclassWinnerIsClear({
  winner,
  runnerUp,
}: {
  winner: ClassifierHit;
  runnerUp: ClassifierHit | null;
}) {
  if (!runnerUp) {
    return true;
  }

  const bitScoreDifference = winner.bitscore - runnerUp.bitscore;
  const winnerMuchBetterByEvalue = winner.evalue <= runnerUp.evalue * 0.1;

  return bitScoreDifference >= 5 || winnerMuchBetterByEvalue;
}

function makeOtherSubclassText({
  selectedHit,
  subclassHits,
  rule,
}: {
  selectedHit: ClassifierHit;
  subclassHits: ClassifierHit[];
  rule: HierarchyRule;
}) {
  const otherSubclassHits = subclassHits.filter(
    (hit) => !modelMatches(hit.model, selectedHit.model)
  );

  if (otherSubclassHits.length === 0) {
    return "";
  }

  if (otherSubclassHits.length === 1) {
    const otherHit = otherSubclassHits[0];

    return ` Comparison model: ${describeHit(otherHit)}.`;
  }

  const otherHitsText = otherSubclassHits.map(describeHit).join("; ");

  return ` Comparison models: ${otherHitsText}.`;
}

function makeSubclassInterpretation({
  selectedHit,
  parentHit,
  subclassHits,
  rule,
}: {
  selectedHit: ClassifierHit;
  parentHit: ClassifierHit;
  subclassHits: ClassifierHit[];
  rule: HierarchyRule;
}) {
  const selectedModel = displayModelName(selectedHit.model);
  const parentModel = displayModelName(parentHit.model);

  const otherSubclassText = makeOtherSubclassText({
    selectedHit,
    subclassHits,
    rule,
  });

  return `Best fitting model: ${selectedModel} (${describeHit(
    selectedHit
  )}). Parent-family support: ${parentModel} (${describeHit(
    parentHit
  )}). Subclassification rule: ${parentModel} is treated as the broad ${rule.familyLabel} family model; supported ${rule.subclassLabel} models are evaluated for a more specific assignment. Result: ${selectedModel} is reported as the most specific supported classification.${otherSubclassText}`;
}

function makeAmbiguousSubclassInterpretation({
  parentHit,
  subclassHits,
  rule,
}: {
  parentHit: ClassifierHit;
  subclassHits: ClassifierHit[];
  rule: HierarchyRule;
}) {
  const parentModel = displayModelName(parentHit.model);
  const subclassText = subclassHits.map(describeHit).join("; ");

  return `Best fitting broad-family model: ${parentModel} (${describeHit(
    parentHit
  )}). Subclassification rule: supported ${rule.subclassLabel} models were evaluated for a more specific assignment. Result: ${parentModel} is retained because the subclass evidence is ambiguous. Subclass hits: ${subclassText}. Manual review is recommended before assigning a specific subtype.`;
}

export function postprocessClassifierResult(
  result: ClassifierResult
): ClassifierResult {
  const cleanedResult = cleanResultModelNames(result);

  if (!cleanedResult.all_hits || cleanedResult.all_hits.length === 0) {
    return cleanedResult;
  }

  const sortedHits = [...cleanedResult.all_hits].sort(sortHitsByStrength);
  const strongestHit = sortedHits[0];

  for (const rule of HIERARCHY_RULES) {
    const parentHit = findHit(cleanedResult.all_hits, rule.parent);

    if (!parentHit) {
      continue;
    }

    const subclassHits = rule.children
      .map((childModel) => findHit(cleanedResult.all_hits, childModel))
      .filter((hit): hit is ClassifierHit => hit !== null)
      .filter(isSupportedSubclassHit)
      .filter((hit) =>
        subclassIsCloseEnoughToParent({
          parentHit,
          subclassHit: hit,
        })
      )
      .sort(sortHitsByStrength);

    const uniqueSubclassHits = Array.from(
      new Map(
        subclassHits.map((hit) => [normalizeModelName(hit.model), hit])
      ).values()
    ).sort(sortHitsByStrength);

    if (uniqueSubclassHits.length === 0) {
      continue;
    }

    const selectedSubclassHit = uniqueSubclassHits[0];
    const runnerUpSubclassHit = uniqueSubclassHits[1] ?? null;

    const parentIsStrongest =
      strongestHit && modelMatches(strongestHit.model, parentHit.model);

    const currentPredictionIsParent = modelMatches(
      cleanedResult.prediction,
      rule.parent
    );

    const currentPredictionIsSubclass = uniqueSubclassHits.some((hit) =>
      modelMatches(cleanedResult.prediction, hit.model)
    );

    if (
      !parentIsStrongest &&
      !currentPredictionIsParent &&
      !currentPredictionIsSubclass
    ) {
      continue;
    }

    const clearSubclassWinner = subclassWinnerIsClear({
      winner: selectedSubclassHit,
      runnerUp: runnerUpSubclassHit,
    });

    if (!clearSubclassWinner) {
      return {
        ...cleanedResult,
        prediction: displayModelName(parentHit.model),
        confidence: "ambiguous",
        confidenceLabel: "Ambiguous",
        best_hit: cleanHitModelName(parentHit),
        note: `${rule.familyLabel} classification retained because the ${rule.subclassLabel} evidence is ambiguous.`,
        interpretation: makeAmbiguousSubclassInterpretation({
          parentHit,
          subclassHits: uniqueSubclassHits,
          rule,
        }),
      };
    }

    const confidence = isStrongSubclassHit(selectedSubclassHit)
      ? "strong"
      : "moderate";

    const confidenceLabel = confidence === "strong" ? "Strong" : "Moderate";

    return {
      ...cleanedResult,
      prediction: displayModelName(selectedSubclassHit.model),
      confidence,
      confidenceLabel,
      best_hit: cleanHitModelName(selectedSubclassHit),
      note: `${displayModelName(
        selectedSubclassHit.model
      )} selected as the most specific supported ${rule.subclassLabel}.`,
      interpretation: makeSubclassInterpretation({
        selectedHit: selectedSubclassHit,
        parentHit,
        subclassHits: uniqueSubclassHits,
        rule,
      }),
    };
  }

  return cleanedResult;
}
