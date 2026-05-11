import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, rm, writeFile } from "fs/promises";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

export type ClassifierConfidence =
  | "strong"
  | "ambiguous"
  | "weak"
  | "none"
  | string;

export type ClassifierHit = {
  model: string;
  evalue: number;
  bitscore: number;
  model_coverage: number;
  query_coverage: number;
};

export type RawClassifierResult = {
  prediction: string;
  confidence: ClassifierConfidence;
  best_hit: ClassifierHit | null;
  all_hits: ClassifierHit[];
  note?: string;
};

export type CuticularClassifierResult = RawClassifierResult & {
  queryLength: number;
  confidenceLabel: string;
  interpretation: string;
};

function getClassifierDirectory() {
  const environmentPath = process.env.CUTICULOME_CLASSIFIER_DIR;

  if (environmentPath && environmentPath.trim().length > 0) {
    return environmentPath.trim();
  }

  return path.join(process.cwd(), "db_working_classifier");
}

function getClassifierScriptPath() {
  return path.join(getClassifierDirectory(), "scripts", "classify_one.py");
}

async function findExecutable(name: string) {
  const environmentOverride =
    name === "python"
      ? process.env.CUTICULOME_CLASSIFIER_PYTHON
      : undefined;

  if (environmentOverride && environmentOverride.trim().length > 0) {
    return environmentOverride.trim();
  }

  try {
    const { stdout } = await execFileAsync("which", [name], {
      maxBuffer: 1024 * 1024,
    });

    const executablePath = stdout.trim().split(/\r?\n/)[0];

    return executablePath || null;
  } catch {
    return null;
  }
}

export function extractClassifierSequence(userInput: string) {
  const trimmedInput = userInput.trim();

  if (!trimmedInput) {
    return {
      sequence: "",
      error: "Please paste an amino acid sequence first.",
    };
  }

  const fastaHeaders = trimmedInput
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith(">"));

  if (fastaHeaders.length > 1) {
    return {
      sequence: "",
      error: "Please submit only one protein sequence at a time.",
    };
  }

  const sequenceLines = trimmedInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !line.startsWith(">"));

  let sequence = sequenceLines.join("");
  sequence = sequence.replace(/\s+/g, "").toUpperCase();

  if (sequence.endsWith("*")) {
    sequence = sequence.slice(0, -1);
  }

  return {
    sequence,
    error: null,
  };
}

export function validateClassifierSequence(sequence: string) {
  const allowedCharacters = new Set("ACDEFGHIKLMNPQRSTVWYXBZUO");

  if (!sequence) {
    return "No amino acid sequence was found.";
  }

  const invalidCharacters = Array.from(new Set(sequence.split("")))
    .filter((character) => !allowedCharacters.has(character))
    .sort();

  if (invalidCharacters.length > 0) {
    return `Invalid character(s) found in sequence: ${invalidCharacters.join(
      ", "
    )}`;
  }

  if (sequence.length < 20) {
    return (
      "This sequence is very short. Please check that you pasted a full or " +
      "meaningful protein sequence."
    );
  }

  return null;
}

function confidenceLabel(confidence: ClassifierConfidence) {
  const labels: Record<string, string> = {
    strong: "Strong",
    ambiguous: "Ambiguous",
    weak: "Weak / unsupported",
    none: "No confident classification",
  };

  return labels[confidence] ?? confidence;
}

function hitPassesDisplayThreshold(hit: ClassifierHit) {
  return (
    hit.evalue <= 1e-5 &&
    hit.bitscore >= 25 &&
    hit.model_coverage >= 0.3
  );
}

function secondaryHitSentence(result: RawClassifierResult) {
  const allHits = result.all_hits ?? [];

  if (allHits.length < 2) {
    return "";
  }

  const secondHit = allHits[1];

  if (!hitPassesDisplayThreshold(secondHit)) {
    return "";
  }

  return (
    ` A lower-scoring additional hit was also detected against ${secondHit.model} ` +
    `(E-value ${secondHit.evalue.toExponential(2)}, bit score ` +
    `${secondHit.bitscore.toFixed(1)}). Check the full HMM hit table below if ` +
    "this classification needs careful review."
  );
}

function makeInterpretation(result: RawClassifierResult) {
  const confidence = result.confidence;
  const prediction = result.prediction;
  const bestHit = result.best_hit;

  if (!bestHit || confidence === "none") {
    return (
      "No convincing match was found against the current Cuticulome.org " +
      "classifier models. This sequence may belong to a family that is not " +
      "covered yet, or it may not be a cuticular protein."
    );
  }

  const secondaryNote = secondaryHitSentence(result);

  if (confidence === "strong") {
    return (
      `This sequence is classified as ${prediction}. The strongest match was ` +
      `${bestHit.model}, with an E-value of ${bestHit.evalue.toExponential(
        2
      )}, a bit score of ${bestHit.bitscore.toFixed(1)}, ` +
      `${(bestHit.model_coverage * 100).toFixed(1)}% model coverage, and ` +
      `${(bestHit.query_coverage * 100).toFixed(1)}% query coverage.` +
      secondaryNote
    );
  }

  if (confidence === "ambiguous") {
    return (
      "This sequence has classifier support, but the result is not clean-cut. " +
      `The best match was ${bestHit.model}, but another related classifier ` +
      "produced a similar score. Manual inspection is recommended before " +
      "assigning a final family label." +
      secondaryNote
    );
  }

  if (confidence === "weak") {
    return (
      `The closest HMM match was ${bestHit.model}, but the hit did not pass ` +
      "the current confidence thresholds. Treat this as unsupported for now, " +
      "or inspect it manually if there is other biological evidence." +
      secondaryNote
    );
  }

  return result.note ?? "Classifier finished, but no interpretation was available.";
}

function parseClassifierJson(stdout: string) {
  const trimmedStdout = stdout.trim();

  try {
    return JSON.parse(trimmedStdout) as RawClassifierResult;
  } catch {
    const jsonStart = trimmedStdout.indexOf("{");
    const jsonEnd = trimmedStdout.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error("The classifier ran, but the result could not be read as JSON.");
    }

    const jsonText = trimmedStdout.slice(jsonStart, jsonEnd + 1);

    return JSON.parse(jsonText) as RawClassifierResult;
  }
}

function normalizeClassifierResult(result: RawClassifierResult) {
  return {
    prediction: result.prediction ?? "Unclassified",
    confidence: result.confidence ?? "none",
    best_hit: result.best_hit ?? null,
    all_hits: Array.isArray(result.all_hits) ? result.all_hits : [],
    note: result.note,
  };
}

async function writeTemporaryFasta(sequence: string, temporaryDirectory: string) {
  const queryId = `query_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const fastaPath = path.join(temporaryDirectory, `${queryId}.faa`);

  await writeFile(fastaPath, `>${queryId}\n${sequence}\n`, "utf-8");

  return fastaPath;
}

export async function classifyCuticularProtein(
  userInput: string
): Promise<CuticularClassifierResult> {
  const { sequence, error } = extractClassifierSequence(userInput);

  if (error) {
    throw new Error(error);
  }

  const validationError = validateClassifierSequence(sequence);

  if (validationError) {
    throw new Error(validationError);
  }

  const classifierDirectory = getClassifierDirectory();
  const classifierScriptPath = getClassifierScriptPath();

  if (!fs.existsSync(classifierDirectory)) {
    throw new Error(
      `Classifier directory not found: ${classifierDirectory}. Copy db_working_classifier into the project root.`
    );
  }

  if (!fs.existsSync(classifierScriptPath)) {
    throw new Error(
      `Classifier script not found: ${classifierScriptPath}. Expected scripts/classify_one.py inside db_working_classifier.`
    );
  }

  const pythonExecutable =
    (await findExecutable("python")) ??
    (await findExecutable("python3"));

  if (!pythonExecutable) {
    throw new Error(
      "Python was not found in PATH. Install Python or set CUTICULOME_CLASSIFIER_PYTHON."
    );
  }

  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "cuticulome-classifier-")
  );

  try {
    const fastaPath = await writeTemporaryFasta(sequence, temporaryDirectory);

    const { stdout } = await execFileAsync(
      pythonExecutable,
      [
        "scripts/classify_one.py",
        "--fasta",
        fastaPath,
        "--outdir",
        temporaryDirectory,
        "--json",
      ],
      {
        cwd: classifierDirectory,
        maxBuffer: 100 * 1024 * 1024,
      }
    );

    const rawResult = normalizeClassifierResult(parseClassifierJson(stdout));

    return {
      ...rawResult,
      queryLength: sequence.length,
      confidenceLabel: confidenceLabel(rawResult.confidence),
      interpretation: makeInterpretation(rawResult),
    };
  } catch (error) {
    const classifierError = error as {
      stderr?: string;
      stdout?: string;
      message?: string;
    };

    const messageParts = [
      classifierError.stderr
        ? `The classifier failed while running HMMER or the Python classifier.\n\nSTDERR:\n${classifierError.stderr}`
        : "",
      classifierError.stdout ? `STDOUT:\n${classifierError.stdout}` : "",
      classifierError.message ? classifierError.message : "",
    ].filter(Boolean);

    throw new Error(
      messageParts.length > 0
        ? messageParts.join("\n\n")
        : "The classifier failed unexpectedly."
    );
  } finally {
    await rm(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
}
