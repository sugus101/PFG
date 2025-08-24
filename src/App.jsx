//0.0 Importa las librerias
import { useState, useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
//0.1 Importa los componentes
import ListaMercados from './components/ListaMercados.jsx';
import CuadroAcciones from './components/CuadroAcciones.jsx';
import PanelControlAdmin from './components/PanelControlAdmin.jsx';
import { datosEthers } from './contexts/ContextoEthereum.jsx';
//0.3 Importa el estilo
import './App.css';
import banner from './assets/Banner.png';

//1.1 Funcion raiz de la dApp 
const App = () => {

    const horaActual = new Date();
    console.log("Inicializacion de la dApp a las" + horaActual.toLocaleTimeString());

    // para la visualizacion condicional del menu de admin
    const [esAdmin, setEsAdmin] = useState(false);
    const { provider, signer, contract, account, isLoading } = datosEthers();

    useEffect(() => {
        const checkAdminStatus = async () => {

            if (!signer || !contract) {
                console.log("Signer o Contract no estan disponibles aun.");
                setEsAdmin(false);
                return;
            }

            const direccionLogueada = await signer.getAddress();

            const direccionDueno = await contract.getDirecPropietario();

            // Las convierto a minusculas por si acaso
            if (direccionLogueada.toLowerCase() === direccionDueno.toLowerCase()) {
                setEsAdmin(true);
            } else {
                setEsAdmin(false);
            }

        };

        checkAdminStatus();

    }, [signer]);

    return (

        <div className='app'>
            <div className='contenedor-banner'>
                <img src={banner} className='banner' />
            </div>
            <div className='contenedor-principal'>
                <nav className="barra-navegacion-main">
                    <NavLink to="/mercados" className="nav-link">Mercados de apuestas</NavLink> {/* Rutas para el usuario */}
                    <NavLink to="/acciones" className="nav-link">Lector de apuestas</NavLink>
                    {esAdmin && <NavLink to="/admin" className="nav-link">Panel Admin</NavLink>}
                </nav>
                <Routes className="menu-central">

                    <Route path="/mercados" element={<div><ListaMercados /></div>} />
                    <Route path="/acciones" element={<div><CuadroAcciones /></div>} />

                    {esAdmin && (
                        <Route path="/admin/*" element={<div><PanelControlAdmin /></div>} />
                    )}

                </Routes>
            </div>
        </div >
    );
}

export default App;