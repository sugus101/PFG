// 0.0 Importa las librerias
import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
// 0.1 Importa las funciones
import FetchMercados from '../functions/FetchMercados.jsx';
import CargarMercadosIniciales from '../functions/CargarMercadosIniciales.jsx'; // Cuando haces un export default no se pone las llaves tronco
import CargarMercadosInicialesBatch from '../functions/CargarMercadosInicialesBatch.jsx';
import LeerEventosEmitidos from '../functions/LeerEventosEmitidos.jsx';
import LeerMercadosExistentes from '../functions/LeerMercadosExistentes.jsx';
import EditarMercado from '../functions/EditarMercado.jsx';
import ResolverMercado from '../functions/ResolverMercado.jsx';
import CerrarMercado from '../functions/CerrarMercado.jsx';
import FondearContrato from '../functions/FondearContrato.jsx';
import RetirarFondosContrato from '../functions/RetirarFondosContrato.jsx';
import { DIRECCION_CONTRATO } from '../contexts/ConstantesGlobales.jsx';
import { datosEthers } from '../contexts/ContextoEthereum.jsx';
// 0.2 Importa los estilosx
import './PanelControlAdmin.css';


function PanelControlAdmin() {


  
  // 0.3 Cargo las variables de estado-------------
  const [resultadoCargaMercados, setResultadoCargaMercados] = useState(''); //este para el TEXTARE del primer bloque (1)
  const [tipoMercado, setTipoMercado] = useState('volume24hr'); //este para el DESPLEGABLE del primer bloque (1)
  const [seccionEdicion, setSeccionEdicion] = useState({ numeroID: '', textoDescripcion: '', numeroCuotaSi: '', numeroCuotaNo: '', }); //este lo uso para el campo de edicion (2)
  const [resultadoEventos, setResultadoEventos] = useState(''); //para el campo TEXTAREA de eventos (3)
  const [resultadoMercado, setResultadoMercado] = useState(''); //para el TEXTAREA del cierre / resolucion mercados (4)
  const [mercadoCierre, setMercadoCierre] = useState(''); //este para el CAMPO del cierre de mercado (4)
  const [mercadoResolucion, setMercadoResolucion] = useState({ numeroMercado: '', resultado: 'Nula', }); //este lo uso para el CAMPO de resolucion (4)
  const [cantidadFondeo, setCantidadFondeo] = useState(''); //este lo uso para el CAMPO que fondeo en el contrato (5)
  const [resultadoFondeo, setResultadoFondeo] = useState(''); //para el TEXTAREA del fondeo (5)
  const [cantidadRetirada, setCantidadRetirada] = useState(''); //este lo uso para el CAMPO que retirada de dinero en el contrato (6)
  const [resultadoRetirada, setResultadoRetirada] = useState(''); //para el TEXTAREA de la retirada de dinero (6)

  // 0.4 Cargo fetchmercadors & los datos del contrato-------------
  const { mercados, cargando, error } = FetchMercados(tipoMercado);
  const { provider, signer, contract, account, isLoading } = datosEthers();

  // 0.5 Manejadores para los campos
  const manejadorEdicion = (event) => { //Manejador para el campo de edicion (2)
    const { name, value } = event.target;
    setSeccionEdicion(prevState => ({
      ...prevState, //dejo las propiedades del anterior 
      [name]: value, //actualizo solo esta
    }));
  };
  const manejadorTipoEvento = (event) => { //Manejador para el campo de tipo de evento (1)
    setTipoMercado(event.target.value);
  };
  const manejadorResolucionApuestas = (event) => { //Manejador para el campo mercadoResolucion (4)
    const { name, value } = event.target;
    setMercadoResolucion(prevState => ({
      ...prevState, //dejo las propiedades del anterior 
      [name]: value, //actualizo solo esta
    }));
  };
  const manejadorCierreMercado = (event) => { //Manejador para elcampo del cierre de mercado (4)
    setMercadoCierre(event.target.value);
  };
  const manejadorCantidadFondeo = (event) => { //Manejador para elcampo del fondeo (5)
    setCantidadFondeo(event.target.value);
  };
  const manejadorCantidadRetirada = (event) => { //Manejador para elcampo de la retirada (6)
    setCantidadRetirada(event.target.value);
  };


  // 1.0 HANDLE PARA CARGAR 10 APUESTAS INICIALES
  const handleCargarApuestasIniciales = async () => {

    setResultadoCargaMercados('Iniciando...');

    // Se procesa todos los mercados y  se recopilan los datos en arrays
    const mercadosParaCargar = mercados.map(mercado => {
      console.log(`Cargando el mercado: ${mercado}`);
      try {
        // Carga los datos del mercado de polymarket
        const descripcion = mercado.question || "No hay descripcion disponible";
        const outcomePricesArray = mercado.outcomePrices ? JSON.parse(mercado.outcomePrices) : [];

        // Calcula la duracion de la apuesta en segundos
        const ahora = new Date();
        const tiempoAhora = ahora.getTime() / 1000; // Tiempo actual en segundos
        const fechaObjetivo = new Date(mercado.endDate);
        const tiempoObjetivo = fechaObjetivo.getTime() / 1000; // Tiempo objetivo en segundos
        const duracionSegundos = tiempoObjetivo - tiempoAhora; // Duración en segundos

        // Saca las cuotas
        const cuotaSi = 1.0 / outcomePricesArray[0];
        const cuotaNo = 1.0 / outcomePricesArray[1];

        return { descripcion, cuotaSi, cuotaNo, duracionSegundos };

      } catch (err) {
        console.error("Error al procesar un mercado:", err);
        return null; // Devuelve null para filtrar los mercados con error
      }
    }).filter(mercado => mercado != null); // 2. Filtra cualquier mercado que haya fallado

    // Se verifica si hay mercados para cargar
    if (mercadosParaCargar.length == 0) {
      setResultadoCargaMercados('Problema con la carga de mercados');
      return;
    }

    console.log("Se inicia la carga de los mercados...");

    // Se llama a la nueva función CargarMercadosInicialesBatch una sola vez
    await CargarMercadosInicialesBatch(mercadosParaCargar, contract);
    setResultadoCargaMercados('Apuestas cargadas correctamente.');

    return;
  };

  // 1.1 HANDLE PARA LEER LOS MERCADOS QUE HAY EN LA BLOCKCHAIN
  const handleLeerMercados = async () => {

    const resultadoStringApuestas = await LeerMercadosExistentes(contract);

    if (resultadoStringApuestas != undefined) {
      setResultadoCargaMercados('Apuestas cargadas correctamente. \n' + resultadoStringApuestas);
    } else {
      setResultadoCargaMercados('No hay ninguna apuesta en la blockchain \n');
    }

    return null;
  };

  // 2 HANDLE PARA EDITAR UN MERCADO
  const handleEditarMercado = async () => {

    EditarMercado(parseInt(seccionEdicion.numeroID), seccionEdicion.textoDescripcion,
      parseFloat(seccionEdicion.numeroCuotaSi), parseFloat(seccionEdicion.numeroCuotaNo),
      contract);

    return null;
  };

  // 3 LECTOR DE EVENTOS EMITIDOS
  const handleLeerEventosEmitidos = async () => {

    const resultadoEventos = await LeerEventosEmitidos(contract);
    let stringConTodo = '';
    resultadoEventos.forEach(evento => {
      stringConTodo += evento
    });
    setResultadoEventos('Los eventos registrados son: \n' + stringConTodo);
    return null;
  };

  // 4.0 CIERRE DE APUESTAS
  const handleCierreApuestas = async () => {

    setResultadoMercado("Iniciando cierre de mercado..."); // Feedback inicial

    // Validar entradas antes de llamar a la función de cierre
    if (!mercadoCierre || parseInt(mercadoCierre) <= 0) {
      setResultadoMercado("Error: Introduce un ID de evento/mercado válido.");
      return;
    }

    // Llama a la función CerrarMercado con los valores del estado
    const resultadoCierre = await CerrarMercado(mercadoCierre, contract);

    // 0 es exito, 1 es fracaso
    if (resultadoCierre == 0) {
      setResultadoMercado(`¡Mercado ID ${mercadoCierre} cerrado con éxito!`);
      setMercadoCierre(''); //Limpio la variable
    } else {
      setResultadoMercado("Ha habido un problema con el cierre de la apuesta. Revisa la consola para más detalles.");
    }

  };

  // 4.1 RESOLUCION DE APUESTAS
  const handleResolucionApuestas = async () => {

    setResultadoMercado("Iniciando cierre de mercado..."); // Feedback inicial

    // Validar entradas antes de llamar a la función de cierre
    if (!mercadoResolucion.numeroMercado || parseInt(mercadoResolucion.numeroMercado) <= 0) {
      setResultadoMercado("Error: Introduce un ID de evento/mercado valido.");
      return;
    }
    if (mercadoResolucion.resultado === 'Nula') {
      setResultadoMercado("Error: Selecciona un resultado (Si o No) para el cierre.");
      return;
    }

    // Llama a la funcion ResolverMercado con los valores del estado
    const resultadoResolucion = await ResolverMercado(
      mercadoResolucion.numeroMercado,
      mercadoResolucion.resultado,
      contract
    );

    // 0 es exito, 1 es fracaso
    if (resultadoResolucion === 0) {
      setResultadoMercado(`¡Mercado ID ${mercadoResolucion.numeroMercado} resuelto como "${mercadoResolucion.resultado}" con exito!`);
      // Limpiar los campos despues del éxito
      setMercadoResolucion({
        numeroMercado: '',
        resultado: 'Nula',
      });
    } else {
      setResultadoMercado("Ha habido un problema con la resolución de la apuesta. Revisa la consola para mas detalles.");
    }

  };

  // 5 FONDEO DEL CONTRATO
  const handleCantidadFondeo = async () => {

    setResultadoFondeo("Iniciando fondeo del contrato...");

    console.log("Has fondeado + ", cantidadFondeo);

    if (isNaN(parseFloat(cantidadFondeo)) || parseFloat(cantidadFondeo) <= 0) {
      setResultadoFondeo("Error: Introduce una cantidad de ETH positiva.");
      return;
    }

    // Llama a la funcion ResolverMercado con los valores del estado
    const resultadoResolucion = await FondearContrato(cantidadFondeo);

    // 0 es oxito, 1 es fracaso
    if (resultadoResolucion === 0) {
      setResultadoFondeo(`¡Se han transferido "${cantidadFondeo}" al contrato "${DIRECCION_CONTRATO}" con éxito!`);
      // Limpiar los campos después del éxito
      setCantidadFondeo('');
    } else {
      setResultadoFondeo("Ha habido un problema con el fondeo. Revisa la consola para más detalles.");
    }

  };

  // 6 RETIRADA DE FONDOS DEL CONTRATO
  const handleCantidadRetirada = async () => {

    setResultadoRetirada("Iniciando retirada de fondos del contrato...");
    console.log("Has retirado + ", cantidadRetirada);

    // Bloque de comporbaciones
    if (isNaN(parseFloat(cantidadRetirada)) || parseFloat(cantidadRetirada) <= 0) {
      setResultadoRetirada("Error: Introduce una cantidad de ETH positiva.");
      return;
    }

    // Llama a la funcion ResolverMercado con los valores del estado
    const resultadoResolucion = await RetirarFondosContrato(cantidadRetirada, contract);

    // 0 es oxito, 1 es fracaso
    if (resultadoResolucion === 0) {
      setResultadoRetirada(`¡Se han transferido "${cantidadRetirada}" del contrato "${DIRECCION_CONTRATO}" al dueño con éxito!`);
      // Limpiar los campos después del éxito
      setCantidadRetirada('');
    } else {
      setResultadoRetirada("Ha habido un problema con la retirada. Revisa la consola para más detalles.");
    }

  };


  // EL RETURN PARA EL RENDERIZADO DEL COMPONENTE
  return (

    <div className="marco-panel-principal">
      {/* Checks --> solo carga el menu si funciona el fetch y ETH */}
      {(cargando || isLoading) && <p>Cargando mercados inciales...</p>}
      {error && <p className="error-message">Error al cargar los mercados: {error.message}</p>}
      {!(cargando || isLoading || error) && (
        <>
          <h2>Panel de Control del Admin</h2>
          <nav className="barra-navegacion">
            {/* Nota gus:aqui tienes que poner las rutas absolutas porque si no se acopla */}
            <NavLink to="/admin/section1">Carga Inicial</NavLink>
            <NavLink to="/admin/section2">Edición de Mercados</NavLink>
            <NavLink to="/admin/section3">Visualizador de eventos</NavLink>
            <NavLink to="/admin/section4">Cierre y resolución de mercado</NavLink>
            <NavLink to="/admin/section5">Fondeo del contrato</NavLink>
            <NavLink to="/admin/section6">Retirada de fondos del contrato</NavLink>
          </nav>
          <Routes>

            {/* Seccion 1 - Carga Datos Iniciales*/}
            {/* Nota gus: aqui hay que poner rutas relativas para que funcione */}
            <Route path="section1" element={
              <div className="marco-celda">
                <h3>Cargar Mercados Iniciales</h3>
                <div>
                  <span className="contenedor-span">Criterio de selección de mercado: </span>
                  <select
                    name="resultado"
                    value={tipoMercado}
                    onChange={manejadorTipoEvento}
                    className="resultado-select"
                  >
                    {/* Opciones del menu desplegable */}
                    <option value="volume24hr">Volumen (24h)</option> {/* Opcion por defecto */}
                    <option value="volume1wk">Volumen (1 semana)</option>
                    <option value="volume1mo">Volumen (1 mes)</option>
                    <option value="volume1yr">Volumen (1 año)</option>
                    <option value="liquidityClob">Liquidez</option>
                  </select>
                </div>
                <div>
                  <button className="boton" onClick={handleCargarApuestasIniciales}>Carga de Mercados Iniciales (10)</button>
                </div>

                <div>
                  <button className="boton" onClick={handleLeerMercados}>Leer Mercados en el Contrato</button>
                </div>
                <div>
                  <textarea
                    value={resultadoCargaMercados}
                    readOnly
                    className="resultado-textarea"
                  />
                </div>
              </div>
            } />

            {/* Seccion 2 - Editar Mercado*/}
            <Route path="section2" element={
              < div className="marco-celda">
                <h3>Edicion de Apuestas</h3>
                <div className="grupo-inputs">
                  <label>ID mercado</label>
                  <input
                    type="number"
                    name="numeroID"
                    placeholder="ID del mercado (Numero entero)"
                    value={seccionEdicion.numeroID}
                    onChange={manejadorEdicion}
                  />
                </div>
                <div className="grupo-inputs">
                  <label>Nueva Descripción:</label>
                  <input
                    type="text"
                    name="textoDescripcion"
                    placeholder="Breve descripcion"
                    value={seccionEdicion.textoDescripcion}
                    onChange={manejadorEdicion}
                  />
                </div>
                <div className="grupo-inputs">
                  <label>Nueva cuota -Si-:</label>
                  <input
                    type="number"
                    name="numeroCuotaSi"
                    placeholder="Ratio cuota si"
                    value={seccionEdicion.numeroCuotaSi}
                    onChange={manejadorEdicion}
                  />
                </div>
                <div className="grupo-inputs">
                  <label>Nueva cuota -No-:</label>
                  <input
                    type="number" //en chrome funciona. En firefox no (la restriccion)
                    name="numeroCuotaNo"
                    placeholder="Ratio cuota no"
                    value={seccionEdicion.numeroCuotaNo}
                    onChange={manejadorEdicion}
                  />
                </div>
                <button className="boton" onClick={handleEditarMercado}>Editar apuesta</button>
              </div>
            } />


            {/* Seccion 3 - Lector de eventos*/}
            <Route path="section3" element={
              <div className="marco-celda">
                <h3>Lector de eventos emitidos</h3>
                <button className="boton" onClick={handleLeerEventosEmitidos}>Check eventos</button>
                <div>
                  <textarea
                    value={resultadoEventos}
                    readOnly
                    className="resultado-textarea"
                  />
                </div>
              </div>
            } />

            {/* Seccion 4 - Cierre y Resolucion de mercados*/}
            <Route path="section4" element={
              <div className="marco-celda">
                <h3>Cierre y resolucion de mercados</h3>

                <div className="grupo-inputs">
                  <label>ID del Evento/Mercado (Cierre)</label>
                  <input
                    type="number"
                    name="numeroMercado"
                    placeholder="ID del mercado (Numero entero)"
                    value={mercadoCierre}
                    onChange={manejadorCierreMercado}
                  />
                </div>
                <button className="boton" onClick={handleCierreApuestas}>Cierre de un mercado</button>

                <div className="grupo-inputs">
                  <label>ID del Evento/Mercado</label>
                  <input
                    type="number"
                    name="numeroMercado"
                    placeholder="ID del mercado (Numero entero)"
                    value={mercadoResolucion.numeroMercado}
                    onChange={manejadorResolucionApuestas}
                  />
                </div>
                <div className="grupo-inputs">
                  <label>Resultado:</label>
                  <select
                    name="resultado"
                    value={mercadoResolucion.resultado}
                    onChange={manejadorResolucionApuestas}
                    className="resultado-select"
                  >
                    {/* Opciones del menu desplegable */}
                    <option value="Nula">Selecciona un resultado</option> {/* Opcion por defecto */}
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <button className="boton" onClick={handleResolucionApuestas}>Resolver un mercado</button>

                <div className="grupo-output">
                  <label>Output:</label>
                  <textarea
                    value={resultadoMercado}
                    readOnly
                    className="resultado-textarea"
                  />
                </div>
              </div>
            } />

            {/* Seccion 5 - Bloque para el fondeo*/}
            <Route path="section5" element={
              <div className="marco-celda">
                <h3>Fondeo del contrato</h3>

                <button className="boton" onClick={handleCantidadFondeo}>Fondear el contrato</button>
                <div className="grupo-inputs">
                  <label>Cantidad del ETH fondeo:</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={cantidadFondeo}
                    onChange={manejadorCantidadFondeo}
                  />
                </div>
                <div className="output-group">
                  <label>Output:</label>
                  <textarea
                    value={resultadoFondeo}
                    readOnly
                    className="resultado-textarea"
                  />
                </div>
              </div>
            } />

            {/* Seccion 6 - Bloque para la retirada*/}
            <Route path="section6" element={
              <div className="marco-celda">
                <h3>Retirada de fondos del contrato</h3>

                <button className="boton" onClick={handleCantidadRetirada}>Retirar fondos</button>
                <div className="grupo-inputs">
                  <label>Cantidad de ETH para retirar:</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={cantidadRetirada}
                    onChange={manejadorCantidadRetirada}
                  />
                </div>
                <div className="output-group">
                  <label>Output:</label>
                  <textarea
                    value={resultadoRetirada}
                    readOnly
                    className="resultado-textarea"
                  />
                </div>
              </div>
            } />

          </Routes>
        </>)
      }

    </div >
  );
}

export default PanelControlAdmin;