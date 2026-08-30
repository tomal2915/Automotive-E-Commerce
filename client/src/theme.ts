import { createTheme, type PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#38bdf8',
      },
      background:
        mode === 'dark'
          ? { default: '#0f172a', paper: '#1e293b' } // Deep Navy / Metallic Slate
          : { default: '#f8fafc', paper: '#ffffff' }, // Light mode background
    },
  });