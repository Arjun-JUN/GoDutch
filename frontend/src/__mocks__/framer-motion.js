/**
 * Framer Motion mock for Jest.
 *
 * Framer Motion uses browser APIs (requestAnimationFrame, ResizeObserver, etc.)
 * that are not available in the jsdom test environment.  This mock replaces
 * every `motion.*` element with a plain React element so component tests can
 * render and assert without needing a real browser.
 */
const React = require('react');

// Proxy that returns a forwardRef wrapper for any HTML tag accessed as motion.div, etc.
const motion = new Proxy(
  {},
  {
    get: (_target, tag) => {
      const Component = React.forwardRef(({ children, ...props }, ref) => {
        // Strip framer-only props so React doesn't warn about unknown DOM attributes
        const {
          initial, animate, exit, variants, transition,
          whileHover, whileTap, whileFocus, whileInView,
          layout, layoutId, drag, dragConstraints,
          onAnimationStart, onAnimationComplete,
          ...domProps
        } = props;
        return React.createElement(tag, { ref, ...domProps }, children);
      });
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  }
);

const AnimatePresence = ({ children }) => children;

const useReducedMotion = () => false;

const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

module.exports = {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimation,
};
