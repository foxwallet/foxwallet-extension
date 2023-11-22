import { AleoProvider } from "./AleoProvider";

const aleoProvider = new AleoProvider();

// @ts-expect-error window
window.foxwallet = {
  aleo: aleoProvider,
};

// @ts-expect-error window
window.aleo = aleoProvider;

// @ts-expect-error window
Object.freeze(window.foxwallet);

// @ts-expect-error window
Object.seal(window.aleo);
