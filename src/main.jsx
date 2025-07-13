
// 0.0 Importa el render de react
import ReactDOM from 'react-dom/client';
// 0.1 Importa lo componentes
import App from './App';
// 0.2 Importa los estilos
import './main.css';

// 1.0 Renderiza la dApp
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);


