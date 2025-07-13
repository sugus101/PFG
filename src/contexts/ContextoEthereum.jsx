// 0.0 Importa las funciones de React
import { createContext, useState, useEffect, useContext } from 'react';
// 0.1 Importa la libreria ethers
import { ethers } from 'ethers';
// 0.2 Importa los datos del contrato
import TuContratoABI from '../../utils/apuestasDistribuidasABI.json';
import { DIRECCION_CONTRATO } from '../contexts/ConstantesGlobales.jsx';

// 1.0 Variable que contiene el contexto
export const ContextoEthers = createContext();

// 2.0 Creo el proveedor de React
export const ProveedorEthers = ({ children }) => {

    // 2.1 Variables de estado
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2.2 Hook de react sin depndencias --> se ejecuta al principo solo
    useEffect(() => {

        // 2.2.0 Funcion que inicializa los datos de la red apoyandose en metamask
        const inicializa = async () => {
            setIsLoading(true);

            // A Compruebo si metamask esta instalado en el navegador


            // B Recupero los datos en un try catch por si falla
            try {
                // Recupero el proveedor (el nodo de la red - la coge de metamask)
                const newProvider = new ethers.providers.Web3Provider(window.ethereum);
                // Recupera el signer (la cuenta prvada que esta en metamask)
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const newSigner = newProvider.getSigner();
                // Recupero el contrato
                const newContract = new ethers.Contract(DIRECCION_CONTRATO, TuContratoABI.abi, newSigner);

                // los guardo
                setProvider(newProvider);                
                setAccount(await newSigner.getAddress());
                setSigner(newSigner);
                setContract(newContract);
            } catch (err) {
                console.error("Error en la conexion con Metamask", err);
            } finally {
                setIsLoading(false);
            }


        };

        // 2.2.1 Comprueba si metamask esta en el navegador al principio
        if (!window.ethereum) {
            console.log("Metamask no esta instalado o no lo encuentra");
            setIsLoading(false);
            return;
        }
        inicializa();

        // 2.2.2 Para tener en cuenta los cambios que haga de cuenta en metamask - Ejecta los listeners
        window.ethereum.on('accountsChanged', async (accounts) => { // A - Listener por si el usuario cambia la cuenta de metamask
            // Coge la cuenta 0 de la billetera para cargar su red ehtereum asi como signer, cuenta y contrato
            if (accounts.length > 0) {
                // Recupero el proveedor (el nodo de la red - la coge de metamask)
                const newProvider = new ethers.providers.Web3Provider(window.ethereum);
                // Recupera el signer (la cuenta prvada que esta en metamask)
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const newSigner = newProvider.getSigner();
                // Recupero el contrato
                const newContract = new ethers.Contract(DIRECCION_CONTRATO, TuContratoABI.abi, newSigner);

                // los guardo
                setProvider(newProvider);                
                setAccount(await newSigner.getAddress());
                setSigner(newSigner);
                setContract(newContract);
            } else {
                setProvider(null); 
                setAccount(null);
                setSigner(null);
                setContract(null);
            }

        });
        window.ethereum.on('chainChanged', (_redId) => window.location.reload()); // B - Listener por si metamask cambia de red - Recarga todo el navegador

    }, []);


    // 2.3 Devuelvo los datoss de la conexicion a la red ethereum
    return (
        <ContextoEthers.Provider value={{ provider, signer, contract, account, isLoading }}>
            {children}
        </ContextoEthers.Provider>
    );
};

// 3.0 Shortcut para acceder al contexto
export const datosEthers = () => {
    return useContext(ContextoEthers);
};