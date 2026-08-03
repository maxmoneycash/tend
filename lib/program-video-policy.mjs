/**
 * @typedef {object} ProgramVideoConditions
 * @property {boolean} dataSaver
 * @property {boolean} documentVisible
 * @property {boolean} inViewport
 * @property {boolean} reducedMotion
 */

/**
 * @param {ProgramVideoConditions} conditions
 */
export function shouldPlayProgramVideo({
  dataSaver,
  documentVisible,
  inViewport,
  reducedMotion,
}) {
  return inViewport && documentVisible && !reducedMotion && !dataSaver;
}

/**
 * @typedef {object} ProgramVideoElement
 * @property {(name: string) => string | null} getAttribute
 * @property {(name: string) => boolean} hasAttribute
 * @property {() => void} load
 * @property {() => void} pause
 * @property {() => Promise<void>} play
 * @property {(name: string) => void} removeAttribute
 * @property {(name: string, value: string) => void} setAttribute
 */

/**
 * @param {ProgramVideoElement} video
 * @param {string} src
 * @param {ProgramVideoConditions} conditions
 */
export function syncProgramVideo(video, src, conditions) {
  if (shouldPlayProgramVideo(conditions)) {
    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
    }
    void video.play().catch(() => undefined);
    return;
  }

  video.pause();
  if (
    (conditions.dataSaver || conditions.reducedMotion) &&
    video.hasAttribute("src")
  ) {
    video.removeAttribute("src");
    video.load();
  }
}
