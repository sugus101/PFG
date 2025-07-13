//0.1 Importa los componentes
import ListaMercados from './components/ListaMercados.jsx';
import CuadroAcciones from './components/CuadroAcciones.jsx';
import PanelControlAdmin from './components/PanelControlAdmin.jsx';
//0.2 Importa los contextos
// import { FetchMercadosProvider } from './contexts/ContextoFetchMercados.jsx'; // Contexto para acceder a los datos de FetchMercados
import { ProveedorEthers } from './contexts/ContextoEthereum.jsx'; // Contexto para acceder a los datos de la conexion con la EVM
//0.3 Importa el estilo
import './App.css';

//1.1 Funcion raiz de la dApp 
const App = () => {

    const horaActual = new Date();
    console.log("Inicializacion de la dApp a las" + horaActual.toLocaleTimeString());

    return (
        <ProveedorEthers>

            <div className='app'>
                <h1>Bienvenido a la App de Apuestas</h1>
                <div className='contenedor-usuario'>
                    <ListaMercados />
                    <CuadroAcciones />
                </div>
                <div>
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
                <h1>Panel de Control del Admin</h1>
                <div className='contenedor-admin'>
                    <PanelControlAdmin />
                </div>
            </div>

        </ProveedorEthers>
    );
}

export default App;