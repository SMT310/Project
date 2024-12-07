import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens export
// export const tokens = (mode) => ({
//   ...(mode === "dark"
//     ? {
//       grey: {
//         100: "#e0e0e0",
//         200: "#c2c2c2",
//         300: "#a3a3a3",
//         400: "#858585",
//         500: "#666666",
//         600: "#525252",
//         700: "#3d3d3d",
//         800: "#292929",
//         900: "#141414",
//       },
//       primary: {
//         100: "#d0d1d5",
//         200: "#a1a4ab",
//         300: "#727681",
//         400: "#1F2A40",
//         500: "#141b2d",
//         600: "#101624",
//         700: "#0c101b",
//         800: "#080b12",
//         900: "#040509",
//       },
//       greenAccent: {
//         100: "#dbf5ee",
//         200: "#b7ebde",
//         300: "#94e2cd",
//         400: "#70d8bd",
//         500: "#4cceac",
//         600: "#3da58a",
//         700: "#2e7c67",
//         800: "#1e5245",
//         900: "#0f2922",
//       },
//       redAccent: {
//         100: "#f8dcdb",
//         200: "#f1b9b7",
//         300: "#e99592",
//         400: "#e2726e",
//         500: "#db4f4a",
//         600: "#af3f3b",
//         700: "#832f2c",
//         800: "#58201e",
//         900: "#2c100f",
//       },
//       blueAccent: {
//         100: "#e1e2fe",
//         200: "#c3c6fd",
//         300: "#a4a9fc",
//         400: "#868dfb",
//         500: "#6870fa",
//         600: "#535ac8",
//         700: "#3e4396",
//         800: "#2a2d64",
//         900: "#151632",
//       },
//     }
//     : {
//       grey: {
//         100: "#141414",
//         200: "#292929",
//         300: "#3d3d3d",
//         400: "#525252",
//         500: "#666666",
//         600: "#858585",
//         700: "#a3a3a3",
//         800: "#c2c2c2",
//         900: "#e0e0e0",
//       },
//       primary: {
//         100: "#040509",
//         200: "#080b12",
//         300: "#0c101b",
//         400: "#f2f0f0", // manually changed
//         500: "#141b2d",
//         600: "#1F2A40",
//         700: "#727681",
//         800: "#a1a4ab",
//         900: "#d0d1d5",
//       },
//       greenAccent: {
//         100: "#0f2922",
//         200: "#1e5245",
//         300: "#2e7c67",
//         400: "#3da58a",
//         500: "#4cceac",
//         600: "#70d8bd",
//         700: "#94e2cd",
//         800: "#b7ebde",
//         900: "#dbf5ee",
//       },
//       redAccent: {
//         100: "#2c100f",
//         200: "#58201e",
//         300: "#832f2c",
//         400: "#af3f3b",
//         500: "#db4f4a",
//         600: "#e2726e",
//         700: "#e99592",
//         800: "#f1b9b7",
//         900: "#f8dcdb",
//       },
//       blueAccent: {
//         100: "#151632",
//         200: "#2a2d64",
//         300: "#3e4396",
//         400: "#535ac8",
//         500: "#6870fa",
//         600: "#868dfb",
//         700: "#a4a9fc",
//         800: "#c3c6fd",
//         900: "#e1e2fe",
//       },
//     }),
// });

// // mui theme settings
// export const themeSettings = (mode) => {
//   const colors = tokens(mode);
//   return {
//     palette: {
//       mode: mode,
//       ...(mode === "dark"
//         ? {
//           // palette values for dark mode
//           primary: {
//             main: colors.primary[500],
//           },
//           secondary: {
//             main: colors.greenAccent[500],
//           },
//           neutral: {
//             dark: colors.grey[700],
//             main: colors.grey[500],
//             light: colors.grey[100],
//           },
//           background: {
//             default: colors.primary[500],
//           },
//         }
//         : {
//           // palette values for light mode
//           primary: {
//             main: colors.primary[100],
//           },
//           secondary: {
//             main: colors.greenAccent[500],
//           },
//           neutral: {
//             dark: colors.grey[700],
//             main: colors.grey[500],
//             light: colors.grey[100],
//           },
//           background: {
//             default: "#fcfcfc",
//           },
//         }),
//     },
//     typography: {
//       fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//       fontSize: 12,
//       h1: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 40,
//       },
//       h2: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 32,
//       },
//       h3: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 24,
//       },
//       h4: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 20,
//       },
//       h5: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 16,
//       },
//       h6: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 14,
//       },
//     },
//   };
// };

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
      grey: {
        100: "#e0e0e0",
        200: "#c2c2c2",
        300: "#a3a3a3",
        400: "#858585",
        500: "#666666",
        600: "#525252",
        700: "#3d3d3d",
        800: "#292929",
        900: "#141414",
      },
      primary: {
        100: "#d0d1d5",
        200: "#a1a4ab",
        300: "#727681",
        400: "#1F2A40",
        500: "#141b2d",
        600: "#101624",
        700: "#0c101b",
        800: "#080b12",
        900: "#040509",
      },
      greenAccent: {
        100: "#dbf5ee",
        200: "#b7ebde",
        300: "#94e2cd",
        400: "#70d8bd",
        500: "#4cceac",
        600: "#3da58a",
        700: "#2e7c67",
        800: "#1e5245",
        900: "#0f2922",
      },
      redAccent: {
        100: "#f8dcdb",
        200: "#f1b9b7",
        300: "#e99592",
        400: "#e2726e",
        500: "#db4f4a",
        600: "#af3f3b",
        700: "#832f2c",
        800: "#58201e",
        900: "#2c100f",
      },
      blueAccent: {
        100: "#e1e2fe",
        200: "#c3c6fd",
        300: "#a4a9fc",
        400: "#868dfb",
        500: "#6870fa",
        600: "#535ac8",
        700: "#3e4396",
        800: "#2a2d64",
        900: "#151632",
      },
    }
    : {
      grey: {
        100: "#f5f8fa", // Light background
        200: "#e1e8ed", // Slightly darker grey for borders
        300: "#c8d6dd", // Light gray for muted text
        400: "#aab8c2", // Subtle contrast for borders
        500: "#8899a6", // Main text color
        600: "#657786", // Text color for lower priority
        700: "#4e5b64", // Stronger dark gray for headings
        800: "#2d3d48", // Darker gray for low contrast areas
        900: "#1c2a32", // Darker gray for text
      },
      primary: {
        100: "#e6f7ff", // Soft blue background for buttons
        200: "#b3e0ff", // Lighter blue for hover effects
        300: "#80c5ff", // Muted blue for buttons
        400: "#4da8ff", // Soft blue for highlighting
        500: "#1DA1F2", // Twitter blue
        600: "#1A91D1", // Slightly darker blue for active states
        700: "#1681B0", // More subtle blue for less emphasis
        800: "#126A90", // Deeper blue for less important sections
        900: "#0E4F70", // Dark blue for footer or background
      },
      greenAccent: {
        100: "#dbf5ee",
        200: "#b7ebde",
        300: "#94e2cd",
        400: "#70d8bd",
        500: "#4cceac",
        600: "#3da58a",
        700: "#2e7c67",
        800: "#1e5245",
        900: "#0f2922",
      },
      redAccent: {
        100: "#f8dcdb",
        200: "#f1b9b7",
        300: "#e99592",
        400: "#e2726e",
        500: "#db4f4a",
        600: "#af3f3b",
        700: "#832f2c",
        800: "#58201e",
        900: "#2c100f",
      },
      blueAccent: {
        100: "#e6f7ff",
        200: "#b3e0ff",
        300: "#80c5ff",
        400: "#4da8ff",
        500: "#1DA1F2",
        600: "#1A91D1",
        700: "#1681B0",
        800: "#126A90",
        900: "#0E4F70",
      },
    }),
});

// MUI theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
          primary: {
            main: colors.primary[500],
          },
          secondary: {
            main: colors.greenAccent[500],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100],
          },
          background: {
            default: colors.primary[500],
          },
        }
        : {
          primary: {
            main: colors.primary[500],
          },
          secondary: {
            main: colors.greenAccent[500],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100],
          },
          background: {
            default: colors.grey[100], // Soft background color
          },
        }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 14,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 36,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 28,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 22,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};


// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => { },
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
