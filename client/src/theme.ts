import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Electric Cyan
    },
    background: {
      default: '#0f172a', // Deep Navy
      paper: '#1e293b',   // Metallic Slate
    },
  },
});