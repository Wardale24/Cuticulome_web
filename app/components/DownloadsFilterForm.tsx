"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  DownloadFilterOptions,
  DownloadFilters,
} from "../lib/download-filters";

type DownloadsFilterFormProps = {
  filters: DownloadFilters;
  options: DownloadFilterOptions;
  activeFilters: boolean;
};

function SelectArrow() {
  return (
    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6a5d4d]">
      ▼
    </span>
  );
}

export default function DownloadsFilterForm({
  filters,
  options,
  activeFilters,
}: DownloadsFilterFormProps) {
  const [query, setQuery] = useState(filters.query);
  const [functionQuery, setFunctionQuery] = useState(filters.functionQuery);
  const [selectedClass, setSelectedClass] = useState(filters.taxonomicClass);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(filters.speciesId);
  const [selectedFamily, setSelectedFamily] = useState(filters.family);
  const [selectedFunctionStatus, setSelectedFunctionStatus] = useState(
    filters.functionStatus
  );

  useEffect(() => {
    setQuery(filters.query);
    setFunctionQuery(filters.functionQuery);
    setSelectedClass(filters.taxonomicClass);
    setSelectedSpeciesId(filters.speciesId);
    setSelectedFamily(filters.family);
    setSelectedFunctionStatus(filters.functionStatus);
  }, [filters]);

  const filteredSpecies = useMemo(() => {
    if (!selectedClass) {
      return options.species;
    }

    return options.species.filter(
      (species) => species.taxonomicClass === selectedClass
    );
  }, [options.species, selectedClass]);

  useEffect(() => {
    if (!selectedSpeciesId) {
      return;
    }

    const selectedSpeciesStillAvailable = filteredSpecies.some(
      (species) => String(species.id) === selectedSpeciesId
    );

    if (!selectedSpeciesStillAvailable) {
      setSelectedSpeciesId("");
    }
  }, [filteredSpecies, selectedSpeciesId]);

  function resetFilters() {
    setQuery("");
    setFunctionQuery("");
    setSelectedClass("");
    setSelectedSpeciesId("");
    setSelectedFamily("");
    setSelectedFunctionStatus("all");
  }

  return (
    <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#2a2118]">
            Filter dataset
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
            Filter the database to create a tailored dataset, then download the
            matching proteins as FASTA or metadata as CSV.
          </p>
        </div>

        {activeFilters && (
          <Link
            href="/downloads"
            onClick={resetFilters}
            className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
          >
            Reset all filters
          </Link>
        )}
      </div>

      <form action="/downloads" method="get" className="mt-8 space-y-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="download-search"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Search proteins
            </label>
            <input
              id="download-search"
              name="q"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by protein name, accession, species, species code, or family..."
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />
          </div>

          <div>
            <label
              htmlFor="function-query"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Function or expression keyword
            </label>
            <input
              id="function-query"
              name="functionQuery"
              type="text"
              value={functionQuery}
              onChange={(event) => setFunctionQuery(event.target.value)}
              placeholder="Search curated function, expression timing, tissue, process, or notes..."
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="class-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Class
            </label>
            <div className="relative mt-2">
              <select
                id="class-filter"
                name="class"
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                  setSelectedSpeciesId("");
                }}
                className="w-full appearance-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 pr-11 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
              >
                <option value="">All classes</option>
                {options.classes.map((taxonomicClass) => (
                  <option key={taxonomicClass} value={taxonomicClass}>
                    {taxonomicClass}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>
          </div>

          <div>
            <label
              htmlFor="species-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Species
            </label>
            <div className="relative mt-2">
              <select
                id="species-filter"
                name="speciesId"
                value={selectedSpeciesId}
                onChange={(event) => setSelectedSpeciesId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 pr-11 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
              >
                <option value="">
                  {selectedClass
                    ? `All ${selectedClass} species`
                    : "All species"}
                </option>
                {filteredSpecies.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.species} ({species.speciesCode})
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>
          </div>

          <div>
            <label
              htmlFor="family-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Protein family
            </label>
            <div className="relative mt-2">
              <select
                id="family-filter"
                name="family"
                value={selectedFamily}
                onChange={(event) => setSelectedFamily(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 pr-11 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
              >
                <option value="">All families</option>
                {options.families.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>
          </div>

          <div>
            <label
              htmlFor="function-status-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Function status
            </label>
            <div className="relative mt-2">
              <select
                id="function-status-filter"
                name="functionStatus"
                value={selectedFunctionStatus}
                onChange={(event) =>
                  setSelectedFunctionStatus(
                    event.target.value as DownloadFilters["functionStatus"]
                  )
                }
                className="w-full appearance-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 pr-11 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
              >
                <option value="all">All proteins</option>
                <option value="defined">Function-defined only</option>
                <option value="lacking">Lacking defined function</option>
              </select>
              <SelectArrow />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
          >
            Apply filters
          </button>

          <Link
            href="/downloads"
            onClick={resetFilters}
            className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}
