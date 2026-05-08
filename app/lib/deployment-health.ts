import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type DeploymentCheck = {
  label: string;
  ok: boolean;
  detail: string;
};

export type DeploymentHealth = {
  environment: {
    isVercel: boolean;
    vercelEnvironment: string;
    nodeEnvironment: string;
  };
  database: {
    ok: boolean;
    proteinCount: number;
    speciesCount: number;
    familyCount: number;
    detail: string;
  };
  files: DeploymentCheck[];
  executables: DeploymentCheck[];
  recommendations: string[];
};

function databasePath() {
  return path.join(process.cwd(), "data", "cuticulome.db");
}

function classifierDirectoryPath() {
  const environmentPath = process.env.CUTICULOME_CLASSIFIER_DIR;

  if (environmentPath && environmentPath.trim().length > 0) {
    return environmentPath.trim();
  }

  return path.join(process.cwd(), "db_working_classifier");
}

function classifierScriptPath() {
  return path.join(classifierDirectoryPath(), "scripts", "classify_one.py");
}

async function executableExists(command: string) {
  try {
    const { stdout } = await execFileAsync("which", [command], {
      maxBuffer: 1024 * 1024,
    });

    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

function getDatabaseStatus() {
  const filePath = databasePath();

  if (!fs.existsSync(filePath)) {
    return {
      ok: false,
      proteinCount: 0,
      speciesCount: 0,
      familyCount: 0,
      detail: "data/cuticulome.db was not found.",
    };
  }

  try {
    const database = new Database(filePath, {
      readonly: true,
      fileMustExist: true,
    });

    const proteinCount =
      (
        database
          .prepare("SELECT COUNT(*) AS count FROM proteins")
          .get() as { count: number }
      )?.count ?? 0;

    const speciesCount =
      (
        database
          .prepare("SELECT COUNT(*) AS count FROM species")
          .get() as { count: number }
      )?.count ?? 0;

    const familyCount =
      (
        database
          .prepare("SELECT COUNT(*) AS count FROM protein_family")
          .get() as { count: number }
      )?.count ?? 0;

    database.close();

    return {
      ok: true,
      proteinCount,
      speciesCount,
      familyCount,
      detail: "SQLite database is present and readable.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SQLite error.";

    return {
      ok: false,
      proteinCount: 0,
      speciesCount: 0,
      familyCount: 0,
      detail: `SQLite database could not be opened: ${message}`,
    };
  }
}

export async function getDeploymentHealth(): Promise<DeploymentHealth> {
  const dbStatus = getDatabaseStatus();

  const classifierDirectoryExists = fs.existsSync(classifierDirectoryPath());
  const classifierScriptExists = fs.existsSync(classifierScriptPath());

  const makeblastdbExists = await executableExists("makeblastdb");
  const blastpExists = await executableExists("blastp");
  const pythonExists =
    (await executableExists("python")) || (await executableExists("python3"));
  const hmmsearchExists = await executableExists("hmmsearch");
  const hmmscanExists = await executableExists("hmmscan");

  const files: DeploymentCheck[] = [
    {
      label: "SQLite database file",
      ok: fs.existsSync(databasePath()),
      detail: "Required for Browse, Species, Families, Downloads, Statistics, and protein record pages.",
    },
    {
      label: "Classifier directory",
      ok: classifierDirectoryExists,
      detail: "Required for the Cuticular Classifier tool.",
    },
    {
      label: "Classifier script",
      ok: classifierScriptExists,
      detail: "Expected at db_working_classifier/scripts/classify_one.py unless CUTICULOME_CLASSIFIER_DIR is set.",
    },
  ];

  const executables: DeploymentCheck[] = [
    {
      label: "makeblastdb",
      ok: makeblastdbExists,
      detail: "Required for miniBLAST database generation.",
    },
    {
      label: "blastp",
      ok: blastpExists,
      detail: "Required for miniBLAST protein search.",
    },
    {
      label: "python / python3",
      ok: pythonExists,
      detail: "Required for running the Cuticular Classifier Python script.",
    },
    {
      label: "hmmsearch",
      ok: hmmsearchExists,
      detail: "Usually required by HMMER-based classifier workflows.",
    },
    {
      label: "hmmscan",
      ok: hmmscanExists,
      detail: "Required only if the classifier script calls hmmscan.",
    },
  ];

  const recommendations: string[] = [];

  if (!dbStatus.ok) {
    recommendations.push(
      "Copy cuticulome.db into data/cuticulome.db and make sure it is committed or included in deployment output tracing."
    );
  }

  if (!makeblastdbExists || !blastpExists) {
    recommendations.push(
      "miniBLAST will not run until NCBI BLAST+ is available in the server environment."
    );
  }

  if (!pythonExists || !classifierScriptExists || !classifierDirectoryExists) {
    recommendations.push(
      "The Cuticular Classifier will not run until Python and db_working_classifier are available in the server environment."
    );
  }

  if (!hmmsearchExists && !hmmscanExists) {
    recommendations.push(
      "HMMER does not appear to be available. The classifier may fail if classify_one.py depends on hmmsearch or hmmscan."
    );
  }

  if (process.env.VERCEL === "1") {
    recommendations.push(
      "On Vercel, core database pages should work if the SQLite file is included. miniBLAST/classifier may need a separate backend unless BLAST+, Python, and HMMER are packaged into the deployment."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "All local checks passed. The core database site and local analysis tools appear ready."
    );
  }

  return {
    environment: {
      isVercel: process.env.VERCEL === "1",
      vercelEnvironment: process.env.VERCEL_ENV ?? "not detected",
      nodeEnvironment: process.env.NODE_ENV ?? "not detected",
    },
    database: dbStatus,
    files,
    executables,
    recommendations,
  };
}
