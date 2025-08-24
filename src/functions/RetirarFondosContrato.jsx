import { ethers } from 'ethers';


async function RetirarFondosContrato(_cantidadString, _contract) {

    // Compruebo las entradas
    if (isNaN(parseFloat(_cantidadString)) || parseFloat(_cantidadString) <= 0) {
        console.log("Por favor, introduce una cantidad válida y mayor que cero para fondear.");
        return 1;
    }

    console.log(`Intentando retirar fondos del contrato con ${_cantidadString} Ether...`);

    try {

        const cantidadEnWei = ethers.utils.parseEther(_cantidadString); // Lo paso a WEIs

        const tx = await _contract.retirarFondosDelContrato(cantidadEnWei);

        console.log("Transacción de retiro enviada. Esperando confirmación...");
        await tx.wait();

        console.log(`¡Retiro de ${_cantidadString} Ether del contrato exitosamente!`);
        return 0;
    } catch (err) {
        console.error("Error al retirar fondos del contrato:", err);
        return 1;
    }

};

export default RetirarFondosContrato;