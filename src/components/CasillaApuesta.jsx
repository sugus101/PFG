// 0.0 Importa las librerias
import { useState } from 'react';
import { ethers } from 'ethers';
// 0.1 Importa los estiloss
import './CasillaApuesta.css';
// 0.2 Importa el contexto
import { datosEthers } from '../contexts/ContextoEthereum.jsx';




const CasillaApuesta = (props) => { //En este vengo con props

  const [cantidad, setCantidad] = useState('');

  // Cargo el hook para los datos de ethers
  const { provider, signer, contract, account, isLoading } = datosEthers();


  // 1 Boton para apostar si
  const BotonApostarSi = async () => {

    // 1.0 Declara e init

    const eleccion = 1; // 1 para 'Sí' cmo lo tengo en solidity

    // 1.1 Checks
    if (!cantidad || parseFloat(cantidad) <= 0) { //No acepto ni vacio ni negativos
      console.log("Introduce una cantidad >0 para apostar.");
      return;
    }

    // 1.2 Convertir la cantidad a Wei (multiplica por 10^18) - Tienes que pasar por esta libreria porque si no da error
    const montanteWeis = ethers.utils.parseEther(cantidad.toString());

    // 1.3 Conexion con soldity para transferirle la apuesta
    try {

      // 1.4. Llamar a la función 'realizarApuesta' del contrato
      const tx = await contract.realizarApuesta(props.apuestaData.id, eleccion,
        { value: montanteWeis } // Esto se pode asi para poder mandar la pasta
      );

      await tx.wait(); // Esperar a ques e mine la transaccion


      console.log('Apuesta realizada:', {
        idApuesta: props.apuestaData.id,
        eleccion: 'Sí',
        cantidad: cantidad,
        txHash: tx.hash
      });


    } catch (error) {
      console.error("Error al realizar la apuesta 'Sí'.", error);
    } finally {
      setCantidad(''); //la pongo a cero de nuevo
    }

    console.log('Se ha apostado ', cantidad, 'ETH al si en el evento', props.apuestaData.id);
  };

  // 2 Boton para apostar no
  const BotonApostarNo = async () => {
    // 1.0 Declara e init

    const eleccion = 2; // 2 para 'No' cmo lo tengo en solidity

    // 1.1 Checks
    if (!cantidad || parseFloat(cantidad) <= 0) { //No acepto ni vacio ni negativos
      console.log("Introduce una cantidad >0 para apostar.");
      return;
    }

    // 1.2 Conexion con soldity para transferirle la apuesta
    try {

      // 1.2 Convertir la cantidad a Wei (multiplica por 10^18) - Tienes que pasar por esta libreria porque si no da error
      const montanteWeis = ethers.utils.parseEther(cantidad.toString());

      // 1.4. Llamar a la función 'realizarApuesta' del contrato
      const tx = await contract.realizarApuesta(props.apuestaData.id, eleccion,
        { value: montanteWeis } // Esto se pode asi para poder mandar la pasta
      );

      await tx.wait(); // Esperar a ques e mine la transaccion

      console.log('Apuesta realizada:', {
        idApuesta: props.apuestaData.id,
        eleccion: 'No',
        cantidad: cantidad,
        txHash: tx.hash
      });


    } catch (error) {
      console.error("Error al realizar la apuesta 'No'.", error);
    } finally {
      setCantidad(''); //la pongo a cero de nuevo
    }
    console.log('Acción ejecutada:', { cantidad });
  };

  return (
    <div className="contenedor-linea-entrada">
      <input
        type="number"
        placeholder="Cantidad (ETH)"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        className="input-cantidad"
        min="0"
        step="0.01"
      />
      <button onClick={BotonApostarSi} className="boton-si">
        {props.textoBoton1}
      </button>
      <button onClick={BotonApostarNo} className="boton-no">
        {props.textoBoton2}
      </button>
    </div>
  );
};

export default CasillaApuesta;
