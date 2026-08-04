"use client";

import Image from "next/image";
import { Film } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { syncProgramVideo } from "@/lib/program-video-policy.mjs";

type DataSaverConnection = EventTarget & {
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: DataSaverConnection;
};

export function ProgramVideo({
  className,
  poster,
  src,
}: {
  className: string;
  poster: string;
  src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaState, setMediaState] = useState<
    "poster" | "loading" | "ready"
  >("poster");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const connection = (navigator as NavigatorWithConnection).connection;
    let inViewport = false;

    const updatePlayback = () => {
      const dataSaver = connection?.saveData === true;
      const shouldLoad =
        !dataSaver &&
        !reducedMotion.matches &&
        document.visibilityState === "visible" &&
        inViewport;
      setMediaState((current) =>
        shouldLoad ? (current === "ready" ? "ready" : "loading") : "poster",
      );
      syncProgramVideo(video, src, {
        dataSaver,
        documentVisible: document.visibilityState === "visible",
        inViewport,
        reducedMotion: reducedMotion.matches,
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry?.isIntersecting === true;
      updatePlayback();
    });

    observer.observe(video);
    reducedMotion.addEventListener("change", updatePlayback);
    connection?.addEventListener("change", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      connection?.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [src]);

  return (
    <div className={`${className} program-media`} data-media-state={mediaState}>
      <Image
        alt=""
        aria-hidden="true"
        className="program-media-poster"
        fill
        priority
        sizes="(min-width: 1024px) 35vw, 100vw"
        src={poster}
      />
      <video
        aria-hidden="true"
        className="program-media-video"
        data-program-video="true"
        loop
        muted
        onCanPlay={() => setMediaState("ready")}
        onError={() => setMediaState("poster")}
        playsInline
        poster={poster}
        preload="none"
        ref={videoRef}
      />
      <div className="program-media-loading" aria-hidden="true">
        <span className="program-media-loading-bar" />
        <span><Film size={14} /> Loading program film</span>
      </div>
    </div>
  );
}
