"use client";

import { useEffect, useRef } from "react";
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
    <video
      aria-hidden="true"
      className={className}
      data-program-video="true"
      loop
      muted
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
    />
  );
}
