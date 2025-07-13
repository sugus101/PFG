// FUNCION PARA CERRAR UN MERCADO

async function CerrarMercado(_betId, _contract) {

    // Compruebo las entradas otra vez 
    if (!_betId || parseInt(_betId) <= 0 ) {
        console.log("Por favor, introduce un ID de apuesta valido.");
        return 1;
    }

    console.log(`Cerrando evento de apuesta ID ${_betId} ...`);

    try {
        // Llamar a la funcion cerrarApuestasManualmente del contrato
        const tx = await _contract.cerrarApuestasManualmente(parseInt(_betId) );

        console.log("Transacción de resolución enviada. Esperando confirmación...");
        await tx.wait(); // Esperar a que la transaccion sea minada

        console.log(`¡Evento de apuesta ID ${_betId} cerrado con éxito!`);
        return 0; //Exito

    } catch (err) {

        console.error("Error al resolver el evento de apuesta.", err);
        return 1; //Fracaso
    }

};

export default CerrarMercado;