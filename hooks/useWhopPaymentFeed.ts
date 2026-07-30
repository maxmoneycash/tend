"use client";

import { useEffect, useState } from "react";

const PUSHER_KEY = "bd3047e634454d306850";
const PUSHER_HOST = "ws-us3.pusher.com";

export type WhopPaymentLog = {
  amount: string;
  countAmount: number;
  currency: string;
  id: string;
  country: string;
  time: string;
  timestamp: number;
};

function formatCurrency(amount: number, currency: string): string {
  if (amount === 0) return "FREE";
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    cad: "CA$",
    aud: "A$",
    nzd: "NZ$",
  };
  const symbol = symbols[currency.toLowerCase()] || "$";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useWhopPaymentFeed(maxLogs = 10) {
  const [logs, setLogs] = useState<WhopPaymentLog[]>([]);
  const [count, setCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(2_805_620_430);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;

    function connect() {
      ws = new WebSocket(
        `wss://${PUSHER_HOST}/app/${PUSHER_KEY}?protocol=7&client=js&version=8.4.0&flash=false`,
      );

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            event: "pusher:subscribe",
            data: { channel: "segment" },
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === "segment-event") {
            const payload = JSON.parse(message.data);
            if (payload.event?.event === "payment_v2") {
              const props = payload.event.properties;
              const totalAmount = Number(props.total_amount) || 0;
              const currencyCode = String(props.currency || "usd");
              const timestamp = new Date(payload.event.timestamp).getTime();
              const log: WhopPaymentLog = {
                amount: formatCurrency(totalAmount, currencyCode),
                countAmount: totalAmount,
                currency: currencyCode.toUpperCase(),
                country: String(props.company_country || "??"),
                id: String(payload.event.id),
                time: new Date(timestamp).toLocaleTimeString("en-US", { hour12: true }),
                timestamp,
              };

              setLogs((prev) => [log, ...prev].slice(0, maxLogs));
              setCount((current) => current + 1);
              if (totalAmount > 0) {
                setTotalVolume((volume) => volume + totalAmount);
              }
            }
          }

          if (message.event === "pusher:ping") {
            ws?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
          }
        } catch {
          // Ignore malformed events from the upstream feed.
        }
      };

      ws.onclose = () => {
        if (alive) {
          setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      alive = false;
      ws?.close();
    };
  }, [maxLogs]);

  return { logs, count, totalVolume };
}
