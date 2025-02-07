import './App.css';
import Dashboard from './components/ui/dashboard';
import { ThemeProvider } from './components/ui/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Dashboard/>
    </ThemeProvider>
  );
}

export default App;