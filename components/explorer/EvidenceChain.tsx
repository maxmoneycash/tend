"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// ════════════════════════════════════════════════════════════════════
// Evidence Chain Explorer — Merkle tree visualization
//
// Shows how individual evidence packs roll up into a Shelby attestation.
// Tree: Shelby Blob → Merkle Nodes → Evidence Packs → Raw Data
// ════════════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────────

interface RawDataNode {
  id: string;
  type: "youtube" | "bot" | "payout" | "tx";
  label: string;
  summary: string;
  detail: Record<string, string | number>;
  link?: string;
}

interface EvidencePackNode {
  id: string;
  hash: string;
  clipId: string;
  views: number;
  viewsFormatted: string;
  payout: number;
  payoutFormatted: string;
  submissionAddress: string;
  timestamp: string;
  verified: boolean;
  children: RawDataNode[];
}

interface MerkleNode {
  id: string;
  hash: string;
  children: EvidencePackNode[];
}

interface RollupNode {
  id: string;
  blobName: string;
  merkleRoot: string;
  timestamp: string;
  explorerUrl: string;
  children: MerkleNode[];
}

type TreeNode =
  | { type: "rollup"; data: RollupNode }
  | { type: "merkle"; data: MerkleNode }
  | { type: "evidence"; data: EvidencePackNode }
  | { type: "raw"; data: RawDataNode };

// ── Demo Data ──────────────────────────────────────────────────────

const DEMO_TREE: RollupNode = {
  id: "rollup-1",
  blobName: "cr/rollups/yunakin-land-tax/1773726330990.json",
  merkleRoot: "0x9964874d5a2e8c1f0b3d7e6a4c9f2b1d8e5a3c7f0d2b9e6a4c1f8d5b3a7e2c",
  timestamp: "2026-03-15T14:32:07Z",
  explorerUrl:
    "https://explorer.shelby.xyz/testnet/account/0x943d8/blobs?name=cr%2Frollups%2Fyunakin-land-tax%2F1773726330990.json",
  children: [
    {
      id: "merkle-1",
      hash: "0x9964874d2e8c1f0b3d7e6a4c9f2b1d8e",
      children: [
        {
          id: "ep-1",
          hash: "0x6ce68f8f3a91bc024c1f0b3d7e6a9f2b",
          clipId: "zx8RsYjf",
          views: 1487994,
          viewsFormatted: "1,487,994",
          payout: 333.93,
          payoutFormatted: "$333.93",
          submissionAddress: "0xed863e61760fb70ca916…9108f",
          timestamp: "2026-03-15T14:28:12Z",
          verified: true,
          children: [
            {
              id: "raw-1a",
              type: "youtube",
              label: "YouTube API",
              summary: "1,487,994 views",
              detail: {
                viewCount: 1487994,
                likeCount: 42310,
                commentCount: 3891,
                responseHash: "0xa7b3e4f1c2d8a9b0e3f7",
                fetchedAt: "2026-03-15T14:28:10Z",
              },
            },
            {
              id: "raw-1b",
              type: "bot",
              label: "Bot Assessment",
              summary: "15/100 (clean)",
              detail: {
                score: 15,
                verdict: "clean",
                signal_velocity: "Normal",
                signal_engagement: "Organic",
                signal_accountAge: "Established",
                signal_viewFollower: "Healthy",
                signal_shareRatio: "Natural",
              },
            },
            {
              id: "raw-1c",
              type: "payout",
              label: "Payout Calc",
              summary: "$351.51 gross, $17.58 fee, $333.93 creator",
              detail: {
                grossUsd: "$351.51",
                platformFee: "$17.58 (5%)",
                creatorPayout: "$333.93",
                cpmRate: "$0.75 / 1K",
                newViews: 468660,
              },
            },
            {
              id: "raw-1d",
              type: "tx",
              label: "Chain TX",
              summary: "0x5f09...a35b",
              detail: {
                txHash: "0x5f09d9b53f6788bffea8672f95b751cb3ce416f42e1c562fdf4dff8489a35b3a",
                network: "Aptos Testnet",
                amount: "333.93 USDT",
                status: "Success",
              },
              link: "https://explorer.aptoslabs.com/txn/0x5f09d9b53f6788bffea8672f95b751cb3ce416f42e1c562fdf4dff8489a35b3a?network=testnet",
            },
          ],
        },
        {
          id: "ep-2",
          hash: "0x3a91bc024c1f0b3d7e6a9f2b1d8e5a3c",
          clipId: "jPThSwhJ8CE",
          views: 408969,
          viewsFormatted: "408,969",
          payout: 291.05,
          payoutFormatted: "$291.05",
          submissionAddress: "0x7b42a1e903c8d5f…c71d8",
          timestamp: "2026-03-15T14:29:44Z",
          verified: true,
          children: [
            {
              id: "raw-2a",
              type: "youtube",
              label: "YouTube API",
              summary: "408,969 views",
              detail: {
                viewCount: 408969,
                likeCount: 11204,
                commentCount: 982,
                responseHash: "0xb8c4d5e2f3a1b0c9d7e6",
                fetchedAt: "2026-03-15T14:29:42Z",
              },
            },
            {
              id: "raw-2b",
              type: "bot",
              label: "Bot Assessment",
              summary: "15/100 (clean)",
              detail: {
                score: 15,
                verdict: "clean",
                signal_velocity: "Normal",
                signal_engagement: "Organic",
                signal_accountAge: "Established",
                signal_viewFollower: "Healthy",
                signal_shareRatio: "Natural",
              },
            },
            {
              id: "raw-2c",
              type: "payout",
              label: "Payout Calc",
              summary: "$306.37 gross, $15.32 fee, $291.05 creator",
              detail: {
                grossUsd: "$306.37",
                platformFee: "$15.32 (5%)",
                creatorPayout: "$291.05",
                cpmRate: "$0.75 / 1K",
                newViews: 408490,
              },
            },
            {
              id: "raw-2d",
              type: "tx",
              label: "Chain TX",
              summary: "0x8b42...c71d",
              detail: {
                txHash: "0x8b42f1a3e7c9d5b0f2a4e6c8d0b3f5a7c9e1d3b5f7a9c2e4d6b8a0c3e5f7d9",
                network: "Aptos Testnet",
                amount: "291.05 USDT",
                status: "Success",
              },
              link: "https://explorer.aptoslabs.com/txn/0x8b42f1a3e7c9d5b0f2a4e6c8d0b3f5a7c9e1d3b5f7a9c2e4d6b8a0c3e5f7d9?network=testnet",
            },
          ],
        },
      ],
    },
    {
      id: "merkle-2",
      hash: "0x5b27c3a1e8d4f90b2c6a8e0d3f5b7c9a",
      children: [
        {
          id: "ep-3",
          hash: "0x7f2e8d91a4c1e5093d7b0f2a6c8e1d3b",
          clipId: "PpJY1Lyqdw4",
          views: 122001,
          viewsFormatted: "122,001",
          payout: 86.93,
          payoutFormatted: "$86.93",
          submissionAddress: "0xed863e61760fb70ca916…9108f",
          timestamp: "2026-03-15T14:30:18Z",
          verified: true,
          children: [
            {
              id: "raw-3a",
              type: "youtube",
              label: "YouTube API",
              summary: "122,001 views",
              detail: {
                viewCount: 122001,
                likeCount: 3440,
                commentCount: 287,
                responseHash: "0xc9d5e6f3a2b1c0d8e7f4",
                fetchedAt: "2026-03-15T14:30:16Z",
              },
            },
            {
              id: "raw-3b",
              type: "bot",
              label: "Bot Assessment",
              summary: "15/100 (clean)",
              detail: {
                score: 15,
                verdict: "clean",
                signal_velocity: "Normal",
                signal_engagement: "Organic",
                signal_accountAge: "Established",
                signal_viewFollower: "Healthy",
                signal_shareRatio: "Natural",
              },
            },
            {
              id: "raw-3c",
              type: "payout",
              label: "Payout Calc",
              summary: "$91.51 gross, $4.58 fee, $86.93 creator",
              detail: {
                grossUsd: "$91.51",
                platformFee: "$4.58 (5%)",
                creatorPayout: "$86.93",
                cpmRate: "$0.75 / 1K",
                newViews: 122001,
              },
            },
            {
              id: "raw-3d",
              type: "tx",
              label: "Chain TX",
              summary: "0xc7e3...9f1a",
              detail: {
                txHash: "0xc7e3d5b9a1f4e8c2d6b0a3f7e9c1d5b8a2f4e6c0d3b7a9f1e5c8d2b6a0f3e7",
                network: "Aptos Testnet",
                amount: "86.93 USDT",
                status: "Success",
              },
              link: "https://explorer.aptoslabs.com/txn/0xc7e3d5b9a1f4e8c2d6b0a3f7e9c1d5b8a2f4e6c0d3b7a9f1e5c8d2b6a0f3e7?network=testnet",
            },
          ],
        },
        {
          id: "ep-4",
          hash: "0xa4c1e509b3d7f2e80c6a9f1d5b8e3a7c",
          clipId: "kcGGSoaN2zA",
          views: 39987,
          viewsFormatted: "39,987",
          payout: 28.18,
          payoutFormatted: "$28.18",
          submissionAddress: "0x3f19b8a2c7d5e0…4a6b2",
          timestamp: "2026-03-15T14:31:02Z",
          verified: false,
          children: [
            {
              id: "raw-4a",
              type: "youtube",
              label: "YouTube API",
              summary: "39,987 views",
              detail: {
                viewCount: 39987,
                likeCount: 1102,
                commentCount: 94,
                responseHash: "0xd0e6f4a3b2c1d9e8f5a4",
                fetchedAt: "2026-03-15T14:30:59Z",
              },
            },
            {
              id: "raw-4b",
              type: "bot",
              label: "Bot Assessment",
              summary: "22/100 (clean)",
              detail: {
                score: 22,
                verdict: "clean",
                signal_velocity: "Normal",
                signal_engagement: "Organic",
                signal_accountAge: "Moderate",
                signal_viewFollower: "Healthy",
                signal_shareRatio: "Natural",
              },
            },
            {
              id: "raw-4c",
              type: "payout",
              label: "Payout Calc",
              summary: "$29.66 gross, $1.48 fee, $28.18 creator",
              detail: {
                grossUsd: "$29.66",
                platformFee: "$1.48 (5%)",
                creatorPayout: "$28.18",
                cpmRate: "$0.75 / 1K",
                newViews: 39540,
              },
            },
            {
              id: "raw-4d",
              type: "tx",
              label: "Chain TX",
              summary: "0xf2a1...e4b7",
              detail: {
                txHash: "0xf2a1b3c5d7e9f1a3c5d7e9b1f3a5c7d9e1b3f5a7c9d1e3b5f7a9c1d3e5b7f9",
                network: "Aptos Testnet",
                amount: "28.18 USDT",
                status: "Success",
              },
              link: "https://explorer.aptoslabs.com/txn/0xf2a1b3c5d7e9f1a3c5d7e9b1f3a5c7d9e1b3f5a7c9d1e3b5f7a9c1d3e5b7f9?network=testnet",
            },
          ],
        },
      ],
    },
  ],
};

// ── Layout constants ───────────────────────────────────────────────

const NODE_W = 280;
const NODE_GAP_X = 32;
const NODE_GAP_Y = 80;
const RAW_NODE_W = 220;
const RAW_NODE_H = 48;

// ── Color palette ──────────────────────────────────────────────────

const COLORS = {
  bg: "#050505",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.04)",
  borderHover: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.9)",
  textDim: "rgba(255,255,255,0.5)",
  textMuted: "rgba(255,255,255,0.25)",
  purple: "#8B5CF6",
  purpleGlow: "rgba(139,92,246,0.20)",
  blue: "#3b82f6",
  blueGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e",
  greenGlow: "rgba(34,197,94,0.15)",
  yellow: "#eab308",
  yellowGlow: "rgba(234,179,8,0.15)",
  orange: "#f97316",
  orangeGlow: "rgba(249,115,22,0.15)",
  red: "#ef4444",
  mono: "'Geist Mono',monospace",
  heading: "'Space Grotesk', system-ui, sans-serif",
} as const;

const typeIcons: Record<RawDataNode["type"], { color: string; symbol: string }> = {
  youtube: { color: "#ef4444", symbol: "YT" },
  bot: { color: "#22c55e", symbol: "AI" },
  payout: { color: "#f97316", symbol: "$" },
  tx: { color: "#3b82f6", symbol: "TX" },
};

// ── Truncate hash helper ───────────────────────────────────────────

function truncHash(h: string, pre = 8, suf = 4): string {
  if (h.length <= pre + suf + 4) return h;
  return `${h.slice(0, pre)}...${h.slice(-suf)}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// ── SVG connector path (bezier curve) ──────────────────────────────

function ConnectorPath({
  x1,
  y1,
  x2,
  y2,
  color,
  delay,
  visible,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  delay: number;
  visible: boolean;
}) {
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="6 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        visible
          ? { pathLength: 1, opacity: 0.6 }
          : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{
        filter: `drop-shadow(0 0 4px ${color}44)`,
      }}
    />
  );
}

// ── Animated dash flow overlay (optional second pass on paths) ─────

function FlowingDash({
  x1,
  y1,
  x2,
  y2,
  color,
  delay,
  visible,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  delay: number;
  visible: boolean;
}) {
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  if (!visible) return null;
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeDasharray="4 12"
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ delay: delay + 0.8, duration: 0.3 }}
      style={{
        animation: `dashFlow 2s linear infinite`,
      }}
    />
  );
}

// ── Node components ────────────────────────────────────────────────

// --- ROLLUP (Level 0, root) ---

function RollupNodeCard({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  delay,
}: {
  node: RollupNode;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
        onSelect();
      }}
      style={{
        width: NODE_W + 40,
        background: selected
          ? "rgba(139,92,246,0.05)"
          : "transparent",
        border: "none",
        borderLeft: `2px solid ${selected ? COLORS.purple : "rgba(139,92,246,0.3)"}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderRadius: 0,
        padding: "18px 20px",
        cursor: "pointer",
        position: "relative",
        boxShadow: selected
          ? `0 0 24px ${COLORS.purpleGlow}`
          : "none",
        transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s",
        userSelect: "none" as const,
      }}
    >
      {/* Shield icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(139,92,246,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.purple}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.purple,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              fontFamily: COLORS.heading,
            }}
          >
            Shelby Rollup Blob
          </div>
          <div
            style={{
              fontSize: 10,
              color: COLORS.textMuted,
              marginTop: 1,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            Immutable Data Layer
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: COLORS.textDim, flexShrink: 0 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>

      {/* Blob name */}
      <div
        style={{
          fontSize: 11,
          fontFamily: COLORS.mono,
          color: COLORS.textDim,
          background: "transparent",
          borderRadius: 0,
          padding: "4px 0",
          marginBottom: 8,
          wordBreak: "break-all" as const,
          lineHeight: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {node.blobName}
      </div>

      {/* Merkle root */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: COLORS.textMuted,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
          }}
        >
          Merkle Root
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: COLORS.mono,
            color: COLORS.purple,
          }}
        >
          {truncHash(node.merkleRoot, 10, 6)}
        </span>
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
        }}
      >
        {formatTimestamp(node.timestamp)}
      </div>

      {/* Explorer link */}
      <a
        href={node.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginTop: 10,
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.purple,
          textDecoration: "none",
          padding: "5px 0",
          borderRadius: 0,
          background: "transparent",
          transition: "color 0.15s",
        }}
      >
        View on Shelby Explorer
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </a>
    </motion.div>
  );
}

// --- MERKLE (Level 1) ---

function MerkleNodeCard({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  delay,
}: {
  node: MerkleNode;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
        onSelect();
      }}
      style={{
        width: NODE_W,
        background: selected
          ? "rgba(59,130,246,0.04)"
          : "transparent",
        border: "none",
        borderLeft: `2px solid ${selected ? COLORS.blue : "rgba(59,130,246,0.2)"}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderRadius: 0,
        padding: "14px 16px",
        cursor: "pointer",
        position: "relative",
        boxShadow: "none",
        transition: "border-color 0.3s, background 0.3s",
        userSelect: "none" as const,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.blue}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.blue,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontFamily: COLORS.heading,
            }}
          >
            Merkle Node
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: COLORS.mono,
              color: COLORS.textDim,
              marginTop: 2,
            }}
          >
            {truncHash(node.hash, 10, 4)}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: COLORS.textMuted, flexShrink: 0 }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
          marginTop: 6,
        }}
      >
        {node.children.length} evidence pack{node.children.length !== 1 ? "s" : ""}
      </div>
    </motion.div>
  );
}

// --- EVIDENCE PACK (Level 2) ---

function EvidencePackCard({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  delay,
}: {
  node: EvidencePackNode;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  delay: number;
}) {
  const accentColor = node.verified ? COLORS.green : COLORS.yellow;
  const leftBorderColor = node.verified
    ? expanded || selected
      ? COLORS.green
      : "rgba(34,197,94,0.3)"
    : expanded || selected
      ? COLORS.yellow
      : "rgba(234,179,8,0.3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
        onSelect();
      }}
      style={{
        width: NODE_W,
        background: selected
          ? `rgba(${node.verified ? "34,197,94" : "234,179,8"},0.03)`
          : "transparent",
        border: "none",
        borderLeft: `2px solid ${leftBorderColor}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderRadius: 0,
        padding: "14px 16px",
        cursor: "pointer",
        position: "relative",
        boxShadow: "none",
        transition: "border-color 0.3s, background 0.3s",
        userSelect: "none" as const,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            {node.verified ? (
              <path d="M9 12l2 2 4-4" />
            ) : (
              <>
                <circle cx="12" cy="10" r="1" fill={accentColor} />
                <path d="M12 14v2" />
              </>
            )}
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: accentColor,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontFamily: COLORS.heading,
            }}
          >
            Evidence Pack
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: COLORS.mono,
              color: COLORS.textDim,
              marginTop: 1,
            }}
          >
            {truncHash(node.hash, 10, 4)}
          </div>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}88`,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 11,
          marginBottom: 6,
        }}
      >
        <span style={{ color: COLORS.textDim }}>
          <span style={{ fontFamily: COLORS.mono, fontWeight: 500 }}>
            {node.clipId}
          </span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 11,
        }}
      >
        <span style={{ color: COLORS.textMuted }}>
          {node.viewsFormatted}{" "}
          <span style={{ fontSize: 9 }}>views</span>
        </span>
        <span
          style={{
            color: COLORS.green,
            fontWeight: 600,
            fontFamily: COLORS.mono,
          }}
        >
          {node.payoutFormatted}
        </span>
      </div>

      {/* Expand indicator */}
      <motion.div
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute" as const,
          bottom: 10,
          right: 14,
          color: COLORS.textMuted,
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// --- RAW DATA (Level 3) ---

function RawDataCard({
  node,
  delay,
  selected,
  onSelect,
}: {
  node: RawDataNode;
  delay: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const iconInfo = typeIcons[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.95 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        width: RAW_NODE_W,
        minHeight: RAW_NODE_H,
        background: selected
          ? "rgba(255,255,255,0.03)"
          : "transparent",
        border: "none",
        borderBottom: `1px solid ${selected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
        borderRadius: 0,
        padding: "10px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "border-color 0.2s, background 0.2s",
        userSelect: "none" as const,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: `${iconInfo.color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 9,
          fontWeight: 700,
          color: iconInfo.color,
          fontFamily: COLORS.mono,
        }}
      >
        {iconInfo.symbol}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          {node.label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textDim,
            marginTop: 1,
            whiteSpace: "nowrap" as const,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.summary}
        </div>
      </div>
      {node.link && (
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: COLORS.blue,
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      )}
    </motion.div>
  );
}

// ── Detail Panel (JSON viewer) ─────────────────────────────────────

function DetailPanel({
  node,
  onClose,
}: {
  node: TreeNode | null;
  onClose: () => void;
}) {
  if (!node) return null;

  let title = "";
  let data: Record<string, unknown> = {};
  let accentColor: string = COLORS.textDim;

  switch (node.type) {
    case "rollup":
      title = "Shelby Rollup Blob";
      accentColor = COLORS.purple;
      data = {
        blobName: node.data.blobName,
        merkleRoot: node.data.merkleRoot,
        timestamp: node.data.timestamp,
        explorerUrl: node.data.explorerUrl,
        merkleNodes: node.data.children.length,
        totalEvidencePacks: node.data.children.reduce(
          (s, m) => s + m.children.length,
          0
        ),
      };
      break;
    case "merkle":
      title = "Merkle Internal Node";
      accentColor = COLORS.blue;
      data = {
        hash: node.data.hash,
        childHashes: node.data.children.map((c) => c.hash),
        childCount: node.data.children.length,
      };
      break;
    case "evidence":
      title = "Evidence Pack";
      accentColor = node.data.verified ? COLORS.green : COLORS.yellow;
      data = {
        hash: node.data.hash,
        clipId: node.data.clipId,
        views: node.data.views,
        payout: node.data.payout,
        submissionAddress: node.data.submissionAddress,
        timestamp: node.data.timestamp,
        verified: node.data.verified,
        dataLayers: node.data.children.map((c) => c.label),
      };
      break;
    case "raw":
      title = node.data.label;
      accentColor = typeIcons[node.data.type].color;
      data = node.data.detail;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "none",
        borderRadius: 12,
        padding: "16px 18px",
        marginTop: 20,
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute" as const,
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            fontFamily: COLORS.heading,
          }}
        >
          {title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "4px 8px",
            cursor: "pointer",
            color: COLORS.textMuted,
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
          }}
        >
          Close
        </button>
      </div>

      {/* JSON code block */}
      <pre
        style={{
          background: "rgba(0,0,0,0.4)",
          borderRadius: 10,
          padding: "14px 16px",
          fontSize: 11,
          fontFamily: COLORS.mono,
          color: COLORS.textDim,
          overflow: "auto" as const,
          maxHeight: 300,
          lineHeight: 1.6,
          margin: 0,
          WebkitOverflowScrolling: "touch" as const,
        }}
      >
        {Object.entries(data).map(([key, value]) => {
          const valueStr =
            typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value);
          const valueColor =
            typeof value === "number"
              ? "#fbbf24"
              : typeof value === "boolean"
                ? value
                  ? COLORS.green
                  : COLORS.red
                : key.toLowerCase().includes("hash") ||
                    key.toLowerCase().includes("address")
                  ? COLORS.purple
                  : "rgba(255,255,255,0.7)";
          return (
            <div key={key}>
              <span style={{ color: COLORS.textMuted }}>{key}</span>
              <span style={{ color: COLORS.textMuted }}>: </span>
              <span style={{ color: valueColor }}>{valueStr}</span>
            </div>
          );
        })}
      </pre>
    </motion.div>
  );
}

// ── Tree Layout Engine ─────────────────────────────────────────────
//
// Computes { x, y } positions for every node in the tree.
// The layout is centered, top-to-bottom.

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  parentId?: string;
  depth: number;
}

function computeLayout(
  tree: RollupNode,
  expandedNodes: Set<string>
): {
  nodes: Map<string, LayoutNode>;
  connections: Array<{
    from: string;
    to: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    depth: number;
  }>;
  totalWidth: number;
  totalHeight: number;
} {
  const nodes = new Map<string, LayoutNode>();
  const connections: Array<{
    from: string;
    to: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    depth: number;
  }> = [];

  // Layer heights (approx)
  const rollupH = 220;
  const merkleH = 90;
  const evidenceH = 135;
  const rawH = RAW_NODE_H + 6;

  // First: compute subtree widths bottom-up
  function subtreeWidth(
    nodeId: string,
    children: Array<{ id: string; children?: unknown[] }>,
    depth: number,
    nodeW: number
  ): number {
    if (!expandedNodes.has(nodeId) || children.length === 0) {
      return nodeW;
    }
    const childWidths = children.map((child, _i) => {
      if (depth === 0) {
        // rollup children are merkle nodes
        const mn = child as MerkleNode;
        return subtreeWidth(mn.id, mn.children as any, 1, NODE_W);
      } else if (depth === 1) {
        // merkle children are evidence packs
        const ep = child as EvidencePackNode;
        return subtreeWidth(ep.id, ep.children as any, 2, NODE_W);
      } else {
        return RAW_NODE_W;
      }
    });
    const totalChildWidth =
      childWidths.reduce((a, b) => a + b, 0) +
      (children.length - 1) * NODE_GAP_X;
    return Math.max(nodeW, totalChildWidth);
  }

  const totalW = subtreeWidth(tree.id, tree.children, 0, NODE_W + 40);

  // Place nodes
  let maxY = 0;

  function placeNode(
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    parentId: string | undefined,
    depth: number,
    children: Array<{ id: string; children?: unknown[] }>
  ) {
    nodes.set(id, { id, x, y, w, h, parentId, depth });
    if (y + h > maxY) maxY = y + h;

    if (parentId) {
      const parent = nodes.get(parentId);
      if (parent) {
        connections.push({
          from: parentId,
          to: id,
          x1: parent.x + parent.w / 2,
          y1: parent.y + parent.h,
          x2: x + w / 2,
          y2: y,
          depth,
        });
      }
    }

    if (!expandedNodes.has(id) || children.length === 0) return;

    const childNodeW =
      depth === 2 ? RAW_NODE_W : depth === -1 ? NODE_W + 40 : NODE_W;
    const childH =
      depth === 0 ? merkleH : depth === 1 ? evidenceH : rawH;
    const nextDepth = depth + 1;

    const childWidths = children.map((child) => {
      if (depth === 0) {
        return subtreeWidth(
          child.id,
          (child as MerkleNode).children as any,
          1,
          NODE_W
        );
      } else if (depth === 1) {
        return subtreeWidth(
          child.id,
          (child as EvidencePackNode).children as any,
          2,
          NODE_W
        );
      }
      return RAW_NODE_W;
    });

    const totalChildWidth =
      childWidths.reduce((a, b) => a + b, 0) +
      (children.length - 1) * NODE_GAP_X;

    const childY = y + h + NODE_GAP_Y;
    let childX = x + w / 2 - totalChildWidth / 2;

    children.forEach((child, i) => {
      const cw = childWidths[i];
      const actualW = depth === 2 ? RAW_NODE_W : NODE_W;
      const cx = childX + cw / 2 - actualW / 2;

      const grandchildren =
        depth === 0
          ? (child as MerkleNode).children
          : depth === 1
            ? (child as EvidencePackNode).children
            : [];

      placeNode(child.id, cx, childY, actualW, childH, id, nextDepth, grandchildren as any);
      childX += cw + NODE_GAP_X;
    });
  }

  const rootX = totalW / 2 - (NODE_W + 40) / 2;
  placeNode(tree.id, rootX, 0, NODE_W + 40, rollupH, undefined, 0, tree.children);

  return {
    nodes,
    connections,
    totalWidth: Math.max(totalW, NODE_W + 40),
    totalHeight: maxY + 40,
  };
}

// ── Keyframe injection for dash animation ──────────────────────────

function DashFlowStyle() {
  return (
    <style>{`
      @keyframes dashFlow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -32; }
      }
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      .evidence-chain-scroll::-webkit-scrollbar {
        height: 6px;
      }
      .evidence-chain-scroll::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.03);
        border-radius: 3px;
      }
      .evidence-chain-scroll::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
      }
      .evidence-chain-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.18);
      }
    `}</style>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function EvidenceChain() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set([DEMO_TREE.id])
  );
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to trigger tree drawing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectNode = useCallback((node: TreeNode) => {
    setSelectedNode((prev) =>
      prev && "data" in prev && "id" in prev.data && prev.data.id === node.data.id
        ? null
        : node
    );
  }, []);

  // Compute layout
  const layout = useMemo(
    () => computeLayout(DEMO_TREE, expandedNodes),
    [expandedNodes]
  );

  // Build lookup maps for quick access
  const merkleMap = useMemo(() => {
    const m = new Map<string, MerkleNode>();
    DEMO_TREE.children.forEach((mn) => m.set(mn.id, mn));
    return m;
  }, []);

  const evidenceMap = useMemo(() => {
    const m = new Map<string, EvidencePackNode>();
    DEMO_TREE.children.forEach((mn) => {
      mn.children.forEach((ep) => m.set(ep.id, ep));
    });
    return m;
  }, []);

  const rawMap = useMemo(() => {
    const m = new Map<string, RawDataNode>();
    DEMO_TREE.children.forEach((mn) => {
      mn.children.forEach((ep) => {
        ep.children.forEach((rd) => m.set(rd.id, rd));
      });
    });
    return m;
  }, []);

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        style={{
          minHeight: 400,
          background: "transparent",
        }}
      />
    );
  }

  // Connection colors by depth
  const connColor = (depth: number) => {
    if (depth === 1) return COLORS.purple;
    if (depth === 2) return COLORS.blue;
    return COLORS.green;
  };

  // Stagger delay by depth
  const staggerDelay = (depth: number, index: number) => {
    return depth * 0.3 + index * 0.1;
  };

  // Count evidence packs and compute total payout for summary
  const totalPacks = DEMO_TREE.children.reduce(
    (s, m) => s + m.children.length,
    0
  );
  const totalPayout = DEMO_TREE.children.reduce(
    (s, m) => s + m.children.reduce((s2, ep) => s2 + ep.payout, 0),
    0
  );

  return (
    <div
      ref={containerRef}
      style={{
        background: "transparent",
        overflow: "hidden" as const,
        position: "relative" as const,
      }}
    >
      <DashFlowStyle />

      {/* Header */}
      <div
        style={{
          padding: "20px 24px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap" as const,
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: COLORS.heading,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.purple}
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Evidence Chain Explorer
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              marginTop: 4,
            }}
          >
            Merkle tree showing how {totalPacks} evidence packs roll up into a
            Shelby attestation
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 11,
          }}
        >
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: COLORS.text, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 16, fontVariantNumeric: "tabular-nums" as const }}>
              {totalPacks}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 9, letterSpacing: "0.1em" }}>
              PACKS
            </div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: COLORS.green, fontWeight: 700, fontFamily: "'Geist Mono', monospace", fontSize: 14, fontVariantNumeric: "tabular-nums" as const }}>
              ${totalPayout.toFixed(2)}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 9, letterSpacing: "0.1em" }}>
              TOTAL
            </div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: COLORS.purple, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 16, fontVariantNumeric: "tabular-nums" as const }}>
              1
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 9, letterSpacing: "0.1em" }}>
              ROLLUP
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "12px 24px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap" as const,
          fontSize: 10,
        }}
      >
        {[
          { color: COLORS.purple, label: "Shelby Rollup" },
          { color: COLORS.blue, label: "Merkle Node" },
          { color: COLORS.green, label: "Verified" },
          { color: COLORS.yellow, label: "Pending" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
                boxShadow: `0 0 6px ${item.color}66`,
              }}
            />
            <span style={{ color: COLORS.textDim }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tree Canvas */}
      <div
        className="evidence-chain-scroll"
        style={{
          overflowX: "auto" as const,
          overflowY: "hidden" as const,
          padding: "10px 24px 24px",
          WebkitOverflowScrolling: "touch" as const,
        }}
      >
        <div
          style={{
            position: "relative" as const,
            width: layout.totalWidth,
            height: layout.totalHeight,
            minWidth: "100%",
            margin: "0 auto",
          }}
        >
          {/* SVG Connectors */}
          <svg
            style={{
              position: "absolute" as const,
              top: 0,
              left: 0,
              width: layout.totalWidth,
              height: layout.totalHeight,
              pointerEvents: "none" as const,
            }}
          >
            {layout.connections.map((conn, i) => (
              <React.Fragment key={`${conn.from}-${conn.to}`}>
                <ConnectorPath
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  color={connColor(conn.depth)}
                  delay={conn.depth * 0.3 + i * 0.05}
                  visible={true}
                />
                <FlowingDash
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  color={connColor(conn.depth)}
                  delay={conn.depth * 0.3 + i * 0.05}
                  visible={true}
                />
              </React.Fragment>
            ))}
          </svg>

          {/* Rollup node */}
          {(() => {
            const n = layout.nodes.get(DEMO_TREE.id);
            if (!n) return null;
            return (
              <div style={{ position: "absolute" as const, left: n.x, top: n.y }}>
                <RollupNodeCard
                  node={DEMO_TREE}
                  expanded={expandedNodes.has(DEMO_TREE.id)}
                  selected={
                    selectedNode?.type === "rollup" &&
                    selectedNode.data.id === DEMO_TREE.id
                  }
                  onToggle={() => toggleNode(DEMO_TREE.id)}
                  onSelect={() =>
                    selectNode({ type: "rollup", data: DEMO_TREE })
                  }
                  delay={0}
                />
              </div>
            );
          })()}

          {/* Merkle nodes */}
          {expandedNodes.has(DEMO_TREE.id) &&
            DEMO_TREE.children.map((mn, mi) => {
              const n = layout.nodes.get(mn.id);
              if (!n) return null;
              return (
                <div
                  key={mn.id}
                  style={{ position: "absolute" as const, left: n.x, top: n.y }}
                >
                  <MerkleNodeCard
                    node={mn}
                    expanded={expandedNodes.has(mn.id)}
                    selected={
                      selectedNode?.type === "merkle" &&
                      selectedNode.data.id === mn.id
                    }
                    onToggle={() => toggleNode(mn.id)}
                    onSelect={() =>
                      selectNode({ type: "merkle", data: mn })
                    }
                    delay={staggerDelay(1, mi)}
                  />
                </div>
              );
            })}

          {/* Evidence pack nodes */}
          {DEMO_TREE.children.map((mn) =>
            expandedNodes.has(mn.id)
              ? mn.children.map((ep, ei) => {
                  const n = layout.nodes.get(ep.id);
                  if (!n) return null;
                  return (
                    <div
                      key={ep.id}
                      style={{
                        position: "absolute" as const,
                        left: n.x,
                        top: n.y,
                      }}
                    >
                      <EvidencePackCard
                        node={ep}
                        expanded={expandedNodes.has(ep.id)}
                        selected={
                          selectedNode?.type === "evidence" &&
                          selectedNode.data.id === ep.id
                        }
                        onToggle={() => toggleNode(ep.id)}
                        onSelect={() =>
                          selectNode({ type: "evidence", data: ep })
                        }
                        delay={staggerDelay(2, ei)}
                      />
                    </div>
                  );
                })
              : null
          )}

          {/* Raw data nodes */}
          {DEMO_TREE.children.map((mn) =>
            mn.children.map((ep) =>
              expandedNodes.has(ep.id)
                ? ep.children.map((rd, ri) => {
                    const n = layout.nodes.get(rd.id);
                    if (!n) return null;
                    return (
                      <div
                        key={rd.id}
                        style={{
                          position: "absolute" as const,
                          left: n.x,
                          top: n.y,
                        }}
                      >
                        <RawDataCard
                          node={rd}
                          delay={staggerDelay(3, ri)}
                          selected={
                            selectedNode?.type === "raw" &&
                            selectedNode.data.id === rd.id
                          }
                          onSelect={() =>
                            selectNode({ type: "raw", data: rd })
                          }
                        />
                      </div>
                    );
                  })
                : null
            )
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ padding: "0 24px 24px" }}>
        <AnimatePresence mode="wait">
          {selectedNode && (
            <DetailPanel
              key={
                selectedNode.data.id
              }
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer with interaction hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          padding: "0 24px 16px",
          textAlign: "center" as const,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 15l-2 5L9 9l11 4-5 2z" />
          </svg>
          Click nodes to expand the tree. Click again to view full data.
        </span>
      </motion.div>
    </div>
  );
}
