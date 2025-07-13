// 0.0 Importo la librerias
import { useState, useEffect } from 'react';
// 0.1 Importo otros componentes de react
import CasillaApuesta from './CasillaApuesta.jsx';
// 0.2 Import de funciones
import ObtenerDatosApuestaExistentes from '../functions/ObtenerDatosApuestasExistentes.jsx';
// 0.3 Import de los estlos
import './ListaMercados.css';
// 0.4 Import del contexto
import { datosEthers } from '../contexts/ContextoEthereum.jsx';


//Nota Gus: el fetchmercados se ejecuta cada vez que "inicializas" la app. Para no tener problemas con la BBDD de EVM, lo que hago es que solo lo use la parte "admin" y ListaMercasdos va a leerlo de la red Ethereum

function ListaMercados() {

  // 1 - Declaro las variables de estado
  const [apuestasCargadas, setApuestasCargadas] = useState([]); //El array donde meto las apuestas
  const [cargando, setCargando] = useState(true); //para controlar la carga async
  const [error, setError] = useState(null); //para los errores

  // 2 - Cargo el hook para los datos de ethers
  const { provider, signer, contract, account, isLoading } = datosEthers();


  // 3 - useEffect para obtener los mercados existentes. (Se actualiza solo si se emite algun evento en la blockchain) y se renderiza despues
  useEffect(() => {

    // 2.0 - Genero una funcion asincrona para leer las apuestas
    const cargarApuestas = async () => {

      try {
        setCargando(true); // Indicar que la carga ha comenzado
        setError(null);    // Limpiar errores previos

        // 2.0.0 - Cargo los datos
        const datos = await ObtenerDatosApuestaExistentes(contract);

        // 2.0.1 Validar si 'datos' es un array y cargo los datos
        if (!datos) {
          console.log("La BBDD distribuida está vacia"); //luego abajo en el if de checks muestra que sacar por pantalla.
        } else if (Array.isArray(datos)) {
          setApuestasCargadas(datos);
        } else {
          console.error("Error de formato de datos de ObtenerDatosApuestaExistentes", datos);
          throw new Error("Error de formato de datos de ObtenerDatosApuestaExistentes");
        }

      } catch (err) {
        console.error("Error al cargar apuestas existentes:", err);
        setError(err);
      } finally {
        setCargando(false); // lo pongo a flase porque acaba la carga
      }
    }

    // 2.1 - Funcion con los listener para la blockchain
    const configurarListeners = async () => {

      try {
        // A - Recargo la lista si se crea algun evento de apuesta
        contract.on('EventoDeApuestaCreado', (_descripcion, _cuotaSi, _cuotaNo, fechaLimiteApuestas, sender, idActual, event) => {// Envia primero los no indexados, luegos los indexados y al final el evento
          console.log(
            `Nuevo evento de apuesta creado (ID: ${idActual}), recargando apuestas.`,
            { idActual: idActual.toString(), _descripcion, _cuotaSi: _cuotaSi.toString(), _cuotaNo: _cuotaNo.toString(), fechaLimiteApuestas: new Date(fechaLimiteApuestas.toNumber() * 1000).toLocaleString(), sender }
          );
          cargarApuestas(); // Vuelve a cargar las apuestas cuando el evento se dispara
        });

        // B - Recargo la lista si se edita algun evento de apuesta
        contract.on('EventoDeApuestaEditado', (_descripcion, _cuotaSi, _cuotaNo, idActual, event) => { // Envia primero los no indexados, luegos los indexados y al final el evento
          console.log(
            `Nuevo evento de apuesta editado (ID: ${idActual}), recargando apuestas.`,
            { idActual: idActual.toString(), _descripcion, _cuotaSi: _cuotaSi.toString(), _cuotaNo: _cuotaNo.toString() }
          );
          cargarApuestas(); // Vuelve a cargar las apuestas cuando el evento se dispara
        });

        // C - Recargo la lista si se cierra algun evento 
        contract.on('EventoMercadoCerrado', (_tiempo, idActual, event) => { // Envia primero los no indexados, luegos los indexados y al final el evento
          console.log(
            `Nuevo evento de apuesta cerrado (ID: ${idActual}), recargando apuestas.`,
            { idActual: idActual.toString(), tiempo: _tiempo.toString() }
          );
          cargarApuestas(); // Vuelve a cargar las apuestas cuando el evento se dispara
        });

        // D - Recargo la lista si se cierra algun evento 
        contract.on(' EventoMercadoResuelto', (_resultado, _dineroResuelto, idActual, event) => { // Envia primero los no indexados, luegos los indexados y al final el evento
          console.log(
            `Nuevo evento de apuesta resuelteo (ID: ${idActual}), recargando apuestas.`,
            { idActual: idActual.toString(), resultado: _resultado.toString() , dinero: _dineroResuelto.toString() }
          );
          cargarApuestas(); // Vuelve a cargar las apuestas cuando el evento se dispara
        });

        console.log('Listeners de eventos del contrato configurados');

      } catch (err) {
        console.error('Error al configurar listeners del contrato ', err);
      }
    };

    // 2.2 - Ejecuto las funciones
    if (contract && !isLoading) { //Solo si el contrato esta dispo o no esta carganfo para evitar que en el primer renderiza los cargue si el contracto no esta listo
      cargarApuestas();
      configurarListeners();
    }

  }, [contract, isLoading]);


  // 3 - IFs para informar al usuario del estado de la carga
  if (cargando) return <p>Cargando apuestas de la blockchain...</p>;
  if (error) return <p>Error al cargar las apuestas: {error.message}</p>;
  if (apuestasCargadas.length === 0) return <p>No hay apuestas activas para mostrar.</p>;

  // 4 - RENDERIZADO
  return (

    <div className="contenedor-listamercado"> {/* 4.1 CONTENEDOR 1 */}

      <h2>Mercados Activos de Polymarket (Gamma API)</h2> {/* 4.1.1 TITULO EN H2 */}

      <ul className="listamercado"> {/* 4.1.2 LISTA DESORDENADA */}
        {apuestasCargadas.map((apuesta, index) => {

          return (
            <li key={apuesta.id}>  {/* 4.1.2.1 Elemento de la lista */}
              <div className="contenedor-pregunta">
                <div className="numero-apuesta">ID {apuesta.id}</div>{/* 4.1.2.1.a SACO EL ID DE LA APUESTA  */}
                <div className="pregunta"> <strong>{apuesta.descripcion}</strong></div>{/* 4.1.2.1.b  Descripcion de la apuesta  */}
                <div className="opciones"> {/* 4.1.2.1.c  Cuota del si y del no  */}
                  <div className="opcion-positiva">
                    <span>Sí: </span>
                    <strong>{apuesta.cuotaSi ? apuesta.cuotaSi.toFixed(2) : 'N/A'}</strong>
                  </div>
                  <div className="opcion-negativa">
                    <span>No: </span>
                    <strong>{apuesta.cuotaNo ? apuesta.cuotaNo.toFixed(2) : 'N/A'}</strong>
                  </div>
                </div>

              </div>
              <div className="contenedor-datos">

                <div className="fecha-limite">{/* 4.1.2.1.d Fecha limite de la apuesta  */}
                  <span>Cierre: </span>
                  <strong>{apuesta.estaAbierta ? new Date(apuesta.fechaLimite).toLocaleString() : "Cerrada"}</strong>
                </div>
                <div className="resolucion">{/* 4.1.2.1.d Fecha limite de la apuesta  */}
                  <span>Evento resuelto: </span>
                  <strong>{apuesta.estaResuelta ? "SI" : "NO"}</strong>
                </div>
              </div>

              {/* 4.1.2.1.e Casilla de la apuesta  */}
              <CasillaApuesta
                textoBoton1={`Apostar Sí (${apuesta.cuotaSi.toFixed(2) ?? 'N/A'})`} //Por so acaso esta vacio que saque N/a
                textoBoton2={`Apostar No (${apuesta.cuotaNo.toFixed(2) ?? 'N/A'})`} //Por so acaso esta vacio que saque N/a
                apuestaData={apuesta}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ListaMercados;



