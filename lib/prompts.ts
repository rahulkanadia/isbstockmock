export const CLASH_PROMPTS = [
  "2d anime fighting scene, character 1 modelled after '{user1}' character 2 modelled after '{user2}', pop art manga style, cinematic action scene, pop art background",
  "dramatic martial arts clash between {user1} and {user2}, bold comic book colors, dynamic action pose, striking silhouettes",
  "epic cinematic standoff, {user1} fighting {user2}, explosive energy auras, dark moody atmosphere, minimalist graphic novel art",
  "cyberpunk street fight, {user1} and {user2} engaged in combat, neon glow, dark alleyway background, anime key visual style",
  "high contrast ink wash style combat, {user1} versus {user2}, abstract background, fierce expressions, shonen manga cover art"
];

export type GenService = {
  name: string;
  models: string[];
  buildUrl: (prompt: string, model: string) => string;
};

export const GENERATIVE_SERVICES: GenService[] = [
  {
    name: "pollinations",
    models: ["flux", "zimage", "klein", "klein-large"],
    buildUrl: (prompt: string, model: string) => {
      // The backticks (`) here are critical so TypeScript knows this is a string template
      return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${model}&width=800&height=500&nologo=true`;
    }
  },
  /* // --- PLACEHOLDERS FOR FUTURE SERVICES ---
  {
    name: "fal-ai",
    models: ["fast-sdxl", "fast-flux"],
    buildUrl: (prompt: string, model: string) => {
      return `https://api.fal.ai/image?prompt=${encodeURIComponent(prompt)}&model=${model}`;
    }
  },
  {
    name: "openai",
    models: ["dall-e-3"],
    buildUrl: (prompt: string, model: string) => {
      return `https://api.openai.com/v1/images/generations`; 
    }
  }
  */
];