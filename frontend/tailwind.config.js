/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
import lineClamp from "@tailwindcss/line-clamp";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui, lineClamp],
};

// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [require("daisyui",require("@tailwindcss/line-clamp"))],
// }

