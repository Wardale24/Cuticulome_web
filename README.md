# Cuticulome.org

Cuticulome.org is a curated database and web resource for arthropod cuticular proteins.

The database brings together literature-derived information on cuticular protein sequences, protein families, species, expression patterns, functional annotations, and standardized nomenclature. It is designed to support comparative studies of arthropod cuticles, cuticular protein evolution, and downstream functional analyses.

## What the site provides

Cuticulome.org allows users to:

- Browse curated arthropod cuticular protein records
- Search and filter proteins by species, family, function, and keyword
- Explore cuticular protein families
- View species-level cuticular protein repertoires
- Download custom protein datasets
- Compare query sequences against curated Cuticulome.org proteins using miniBLAST
- Classify query sequences into established cuticular protein families using HMM-based models
- Submit new protein annotations for review

## Database content

Each curated protein record includes (where available):

- Standardized protein name
- Original protein name
- Protein family assignment
- Species information
- Amino acid sequence
- Coding sequence
- Tissue or organ expression information
- Developmental stage information
- Experimentally supported functional annotations
- Literature references

The database is manually curated from published studies and sequence resources. Protein names are standardized to make cross-species comparisons easier while preserving original names from the source literature.

## Web application

Cuticulome.org is implemented as a Next.js web application using a SQLite database as the central data source.

The main sections of the site include:

- **Browse** — search and filter curated protein entries
- **Protein Families** — explore family-level summaries and examples
- **Species** — view species represented in the database
- **Downloads** — generate custom FASTA and CSV datasets
- **miniBLAST** — compare query proteins against database sequences
- **Classifier** — assign query proteins to cuticular protein families using HMM-based models
- **Submit** — suggest new protein annotations for curation
- **Help** — usage notes and database guidance

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open the local site in your browser:

```text
http://localhost:3000
```

The application expects the curated SQLite database to be available locally at:

```text
data/cuticulome.db
```

Some analysis tools may require additional local dependencies or an external tools backend, depending on the deployment environment.

## Project structure

```text
app/                    Next.js application pages, components, API routes, and library code
data/                   Local database files
db_working_classifier/  HMM classifier development files and models
```

## Data downloads

The Downloads page allows users to export selected records as FASTA or CSV files. Datasets can be customized by species, genus, protein family, function status, and search terms.

This allows users to generate datasets such as:

- all curated proteins from a selected species
- all proteins assigned to a selected family
- function-defined proteins only
- custom keyword-filtered protein sets

## Submissions

Users can suggest new protein annotations through the Submit page. Submitted records are reviewed manually before inclusion in the database.

## Citation

Cuticulome.org: A centralized database of protein in arthropod cuticles. Wardale A., Nakayama N., Finet C. (in preparation)

## License

License information will be added to this repository.
