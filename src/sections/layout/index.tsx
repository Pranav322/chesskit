import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { PropsWithChildren, useMemo } from "react";
import NavBar from "./NavBar";
import { red } from "@mui/material/colors";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Layout({ children }: PropsWithChildren) {
  const [useDarkMode, setDarkMode] = useLocalStorage("useDarkMode", true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: useDarkMode ? "dark" : "light",
          error: {
            main: red[400],
          },
          primary: {
            main: "#EC6700",
            light: "#EFA765",
          },
          secondary: {
            main: "#EFA765",
            dark: "#1D1922",
          },
          background: {
            default: useDarkMode ? "#1D1922" : "#ffffff",
            paper: useDarkMode ? "#1D1922" : "#ffffff",
          },
          text: {
            primary: useDarkMode ? "#ffffff" : "#1D1922",
            secondary: useDarkMode ? "#EFA765" : "#EC6700",
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '& .MuiToolbar-root': {
                  color: '#EC6700',
                },
                '& .MuiTypography-root': {
                  color: '#EC6700',
                  fontFamily: '"Roboto Slab", serif',
                  fontWeight: 500,
                },
                '& .MuiIconButton-root': {
                  color: '#EC6700',
                  '&:hover': {
                    backgroundColor: 'rgba(236, 103, 0, 0.1)',
                  },
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              contained: {
                backgroundColor: "#EFA765",
                color: "#1D1922",
                "&:hover": {
                  backgroundColor: "#EC6700",
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: "#EFA765",
                "&:hover": {
                  backgroundColor: "rgba(239, 167, 101, 0.1)",
                },
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: useDarkMode ? '#ffffff' : '#1D1922',
                '&.move-text': {
                  color: useDarkMode ? '#ffffff' : '#1D1922',
                },
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                color: useDarkMode ? '#ffffff' : '#1D1922',
                '&:hover': {
                  backgroundColor: useDarkMode ? 'rgba(239, 167, 101, 0.1)' : 'rgba(236, 103, 0, 0.1)',
                },
              },
            },
          },
        },
      }),
    [useDarkMode]
  );

  if (useDarkMode === null) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar
        darkMode={useDarkMode}
        switchDarkMode={() => setDarkMode((val) => !val)}
      />
      <main style={{ margin: "3vh 2vw" }}>{children}</main>
    </ThemeProvider>
  );
}
