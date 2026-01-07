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

  // Animation durations (milliseconds)
  FLOAT_DURATION: 8000, // Floating animation duration (slower, gentler)
  ROTATE_DURATION: 120000, // Slow rotation duration (120s)
  PULSE_DURATION: 4000, // Pulse/glow animation duration (slower)
  DRIFT_DURATION: 20000, // Sparkle drift duration
  TWINKLE_DURATION: 2000, // Twinkle animation duration
  SLIDE_UP_DURATION: 800, // Slide up entrance duration
  ZOOM_IN_DURATION: 1200, // Zoom in entrance duration
  ORBIT_TRAIL_DURATION: 1500, // Orbit trail duration
  PAN_DURATION: 180000, // Background pan duration (180s, very slow)

  // Parallax offsets (pixels/percentage)
  PARALLAX_BACKGROUND_OFFSET: 0.15, // Background moves at 15% speed (reduced for less distraction)
  PARALLAX_FOREGROUND_OFFSET: 1.05, // Foreground moves at 105% speed (reduced)
  PARALLAX_TRANSITION_OFFSET: 30, // Parallax offset during transitions (reduced)

  // Responsive breakpoints (pixels)
  MOBILE_BREAKPOINT: 768, // Mobile devices
  TABLET_BREAKPOINT: 1024, // Tablet devices
  DESKTOP_BREAKPOINT: 1280, // Desktop devices

  // Pin animation delays (milliseconds) - for stagger effect
  PIN_STAGGER_DELAY: 100, // Delay between each pin appearance
} as const

