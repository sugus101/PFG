import { ethers } from 'ethers';
import { DIRECCION_CONTRATO } from '../contexts/ConstantesGlobales.jsx';


async function FondearContrato(_cantidadString, _signer) {

    // Compruebo las entradas
    if (isNaN(parseFloat(_cantidadString)) || parseFloat(_cantidadString) <= 0) {
        console.log("Por favor, introduce una cantidad válida y mayor que cero para fondear.");
        return 1;
    }

    console.log(`Intentando fondear el contrato con ${_cantidadString} Ether...`);

    try {

        const cantidadEnWei = ethers.utils.parseEther(_cantidadString); // Lo paso a WEIs

        const tx = await _signer.sendTransaction({
            to: DIRECCION_CONTRATO,
            value: cantidadEnWei
        });

        console.log("Transacción de fondeo enviada. Esperando confirmación...");
        await tx.wait();

        console.log(`¡Contrato fondeado con ${_cantidadString} Ether con éxito!`); // Usamos el string original
        return 0;
    } catch (err) {
        console.error( "Error al fondear el contrato", err);
        return 1;
    }

};

export default FondearContrato;