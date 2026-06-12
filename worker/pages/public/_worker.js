import interactionWorker from '../../src/index.js';

export default {
  fetch(request, env, ctx) {
    return interactionWorker.fetch(request, env, ctx);
  },
};
