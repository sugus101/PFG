// 0.0 Importa las librerias
import { useState } from 'react';
import { ethers } from 'ethers';
// 0.1 Importa los estilos
import './CuadroAcciones.css';
// 0.2 Importa el contexto
import { datosEthers } from '../contexts/ContextoEthereum.jsx';


const CuadroAcciones = () => {

  // 1 Declaro las variables de estado y cargo el contexto
  const [resultado, setResultado] = useState('');
  const { provider, signer, contract, account, isLoading } = datosEthers();

  // 2 Manejador para mostrar el resultado
  const mostrarResultado = async () => {

    // 2.1 Declaro variables de estado y el array para cargar las apuestas
    setResultado('Cargando apuestas individuales...');
    let apuestasEncontradas = []; // Array para almacenar los detalles de todas las apuestas individuales

    // 2.2 Bloque de conexión con la red ethereum
    try {

      // A Recupero el numero de apuesta ya hechas
      const proximoIdBigNumber = await contract.proximoBetId(); //Accedo a la variable para contar el numero de apuestas disponibles
      const totalEventosExistentes = proximoIdBigNumber.toNumber() - 1;

      // B Compruebo por si acaso no hay apuestas
      if (totalEventosExistentes == 0) {
        setResultado("No se ha creado ningún evento de apuesta aun");
        console.log("No se ha creado ningún evento de apuesta aun");
        setCargando(false);
        return;
      }

      // C Iterar a traves de cada evento de apuesta (desde ID 1)
      for (let betId = 1; betId <= totalEventosExistentes; betId++) {

        // Obtener el numero de apuestas individuales para este evento
        const eventoData = await contract.obtenerEstadoEventoDeApuesta(betId);
        const numeroDeApuestasIndividuales = eventoData.numeroDeApuestasIndividuales.toNumber(); //Recibe un string

        // Si hay apuestas en ese evento 
        apuestasEncontradas.push("\n"); //Salto de linea para que no se peguen
        if (numeroDeApuestasIndividuales > 0) {
          apuestasEncontradas.push(`--- Evento ID: ${betId} (${eventoData.descripcion}) ---`); //Meto la cabecera

          // Itero a traves de cada apuesta individual dentro de este evento
          for (let i = 0; i < numeroDeApuestasIndividuales; i++) {
            const apuestaIndividual = await contract.obtenerDetallesApuestaIndividual(betId, i);

            apuestasEncontradas.push(
              ` Apuesta #${i + 1}:` +
              ` Apostante: ${apuestaIndividual.apostante}` +
              ` Montante: ${ethers.utils.formatEther(apuestaIndividual.montante)} ETH` +
              ` Elección: ${apuestaIndividual.eleccion == 1 ? "Si" : "No"}` +
              ` Pagado: ${apuestaIndividual.pagado ? 'Si' : 'No'}`
            );
          }
        } else {
          apuestasEncontradas.push(`--- Evento ID: ${betId} (${eventoData.descripcion}) --- \n No tiene apuestas individuales`);
        }

      }

      //Lo convierto en string y se lo paso a la variable de estado
      if (apuestasEncontradas.length > 0) {
        setResultado(apuestasEncontradas.join('\n'));
      } else {
        setResultado("No se encontraron apuestas individuales en ningún evento.");
      }

    } catch (error) {
      console.error("Error al barrer apuestas individuales:", error);
      setResultado(`Error al consultar: ${error.message || error.toString()}`);
    }

  };

  return (
    <div className="contenedor-menu">
      <h2 className="titulo-menu">Consulta de Apuestas</h2>

      <button onClick={mostrarResultado} className="boton-resultado">
        Mostrar Resultado
      </button>

      <textarea
        value={resultado}
        readOnly
        className="cuadro-resultado"
      />
    </div>
  );
};

export default CuadroAcciones;