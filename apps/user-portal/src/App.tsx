import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

// Pages
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Subscription from './pages/Subscription';
import Downloads from './pages/Downloads';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/downloads" element={<Downloads />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
