"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Crosshair, ExternalLink, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { OhloneSite } from "@/lib/muwekma-content";

const BOUNDS = {
  east: -122.4,
  north: 37.815,
  south: 37.75,
  west: -122.49,
};

function position([longitude, latitude]: readonly [number, number]) {
  return {
    left: `${((longitude - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100}%`,
    top: `${((BOUNDS.north - latitude) / (BOUNDS.north - BOUNDS.south)) * 100}%`,
  };
}

export function ExplorerAtlas({ sites }: { sites: OhloneSite[] }) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState(sites[0]?.name ?? "");
  const visibleSites = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sites;
    return sites.filter((site) =>
      `${site.name} ${site.subtitle} ${site.record}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, sites]);
  const selected =
    sites.find((site) => site.name === selectedName) ?? visibleSites[0] ?? sites[0];

  return (
    <section className="explorer-atlas" aria-labelledby="atlas-heading">
      <header className="explorer-atlas-header">
        <div>
          <p className="explorer-kicker">Presidio Atlas view</p>
          <h2 id="atlas-heading">Places before paragraphs</h2>
          <p>
            Select a place to see what the cited record establishes and where
            its precision stops.
          </p>
        </div>
        <div className="explorer-evidence-key" aria-label="Map precision key">
          <span><i data-precision="exact" /> Exact public place</span>
          <span><i data-precision="approximate" /> Approximate vicinity</span>
        </div>
      </header>

      <div className="explorer-atlas-workbench">
        <aside className="explorer-site-rail" aria-label="Atlas places">
          <label className="explorer-site-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Filter atlas places</span>
            <input
              type="search"
              placeholder={`Filter ${sites.length} places`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <p className="explorer-site-count">
            {visibleSites.length} {visibleSites.length === 1 ? "place" : "places"}
          </p>
          <div className="explorer-site-list">
            {visibleSites.map((site) => {
              const active = site.name === selected?.name;
              return (
                <button
                  aria-pressed={active}
                  className="explorer-site-row"
                  key={site.name}
                  onClick={() => setSelectedName(site.name)}
                  type="button"
                >
                  <span className="explorer-site-dot" data-precision={site.precision} />
                  <span>
                    <strong>{site.name}</strong>
                    <small>{site.subtitle}</small>
                  </span>
                  <Crosshair size={14} aria-hidden="true" />
                </button>
              );
            })}
            {visibleSites.length === 0 && (
              <p className="explorer-site-empty">No places match “{query}”.</p>
            )}
          </div>
        </aside>

        <div className="explorer-map-stage" aria-label="Schematic map of sourced places">
          <svg aria-hidden="true" className="explorer-map-lines" viewBox="0 0 1000 620">
            <path d="M40 122C210 44 353 91 478 179c106 74 171 63 273 22 88-35 164-26 209 15" />
            <path d="M-20 241c173-68 307-18 426 65 126 88 224 82 335 28 86-42 181-32 289 50" />
            <path d="M-40 407c178-84 338-41 471 49 112 75 206 71 328 10 99-49 183-36 292 53" />
            <path d="M106 0c18 109 86 182 174 254 97 79 104 173 57 366" />
            <path d="M660-22c-53 104-54 213 24 300 78 88 99 173 55 364" />
          </svg>
          <div className="explorer-map-label explorer-map-label-water">Golden Gate</div>
          <div className="explorer-map-label explorer-map-label-city">San Francisco</div>
          {sites.map((site, index) => {
            const active = site.name === selected?.name;
            const visible = visibleSites.some((candidate) => candidate.name === site.name);
            return (
              <button
                aria-label={`Select ${site.name}`}
                aria-pressed={active}
                className="explorer-map-marker"
                data-precision={site.precision}
                data-visible={visible ? "true" : "false"}
                key={site.name}
                onClick={() => setSelectedName(site.name)}
                style={position(site.coordinates)}
                type="button"
              >
                <motion.span
                  animate={active && !reduceMotion ? { scale: [1, 1.22, 1] } : undefined}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  {index + 1}
                </motion.span>
                <small>{site.name}</small>
              </button>
            );
          })}
          <div className="explorer-map-scale" aria-hidden="true">
            <span /> Source coordinates · schematic ground
          </div>
        </div>

        <aside className="explorer-record-panel" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {selected && (
              <motion.div
                key={selected.name}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.22 }}
              >
                <div className="explorer-record-heading">
                  <span><MapPin size={14} aria-hidden="true" /> Selected place</span>
                  <b>{selected.precision}</b>
                </div>
                <h3>{selected.name}</h3>
                <p className="explorer-record-subtitle">{selected.subtitle}</p>
                <div className="explorer-record-rule" />
                <p className="explorer-record-body">{selected.record}</p>
                <dl className="explorer-record-coordinates">
                  <div><dt>Longitude</dt><dd>{selected.coordinates[0].toFixed(4)}</dd></div>
                  <div><dt>Latitude</dt><dd>{selected.coordinates[1].toFixed(4)}</dd></div>
                  <div><dt>Evidence</dt><dd>{selected.evidence}</dd></div>
                </dl>
                <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Read {selected.sourceName} <ExternalLink size={14} aria-hidden="true" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </section>
  );
}
