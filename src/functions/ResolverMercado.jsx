// FUNCION PARA RESOLVER UN MERCADO

async function ResolverMercado(_betId, _resultadoSeleccionado, _contract) {

    // Comprobaciones de las entradas
    if (!_betId || parseInt(_betId) <= 0 ) {
        console.log("Por favor, introduce un ID de apuesta valido.");
        return 1;
    }
    if (_resultadoSeleccionado != 'Si' && _resultadoSeleccionado != 'No') {
        console.log("Por favor, selecciona un resultado (Si o No).");
        return 1;
    }

    console.log(`Resolviendo evento de apuesta ID ${_betId} con resultado ${_resultadoSeleccionado}...`);

    try {

        // Lo mapeo con la variable de solidity
        let resultadoEnum;
        if (_resultadoSeleccionado === 'Si') {
            resultadoEnum = 1; 
        } else if (_resultadoSeleccionado === 'No') {
            resultadoEnum = 2; 
        } else {
            console.log("Resultado seleccionado inválido.");
            return 1;
        }

        // Llamar a la funcion resolverEventoDeApuesta del contrato
        const tx = await _contract.resolverEventoDeApuesta(parseInt(_betId), resultadoEnum);

        console.log("Transacción de resolución enviada. Esperando confirmación...");
        await tx.wait(); // Esperar a que la transaccion sea minada

        console.log(`¡Evento de apuesta ID ${_betId} resuelto con éxito como ${_resultadoSeleccionado}!`);
        return 0; //Exito
    } catch (err) {
        console.error("Error al resolver el evento de apuesta.", err);
        return 1; //Fracaso
    }

};

export default ResolverMercado;