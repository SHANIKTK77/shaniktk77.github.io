// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom has no WebGL. Report "no context" quietly so the scene takes its fallback path.
HTMLCanvasElement.prototype.getContext = () => null;
