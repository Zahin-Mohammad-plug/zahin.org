/**
 * Transition timing constants (fine-tuned values - keep exact)
 */

export const TRANSITION_CONSTANTS = {
  // Cinematic transition durations (milliseconds)
  CINEMATIC_DURATION: 2200, // Total duration of cinematic overlay
  CINEMATIC_SWITCH: 1250, // When to swap pages during cinematic transition
  CINEMATIC_UNVEIL: 1500, // When to allow page to render behind overlay

  // Standard page transition durations (milliseconds)
  STANDARD_TRANSITION_DELAY: 350, // Delay before page swap
  STANDARD_TRANSITION_DURATION: 700, // Total duration of standard transition

  // Scene reveal delays (milliseconds)
  SCENE_REVEAL_DELAY: 180, // Delay before scene becomes ready
  PINS_REVEAL_DELAY: 650, // Delay before pins become visible

  // Scroll/threshold values
  SCROLL_COOLDOWN: 1000, // Minimum time between scroll-triggered page changes
  SCROLL_THRESHOLD: 20, // Minimum scroll delta to trigger page change
  TOUCH_THRESHOLD: 50, // Minimum touch movement to trigger page change
} as const

