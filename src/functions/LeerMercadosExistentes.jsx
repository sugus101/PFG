// FUNCION PARA LEER LOS MERCADOR QUE YA ESTAN EN LA BLOCKCHAIN

async function LeerMercadosExistentes(_contract) { //Nota Gus: una funcion async siempre devuelve un objeto promise!!!
    
    console.log('\nConsultando apuestas en la blockchain...');
    var estadoEventosApuesta = '';

    try {
        // Obtiene del contrato el ultimo mercado que se ha cargado
        const numeroDeEventosMax = await _contract.proximoBetId();
        for (let i = 1; i < numeroDeEventosMax.toNumber(); i++) { // empieza en el 1 porque en solidity tengo un elemento nulo en el 0
            
            // Obtiene los datos de cada mercado
            const EventoDeApuesta = await _contract.obtenerEstadoEventoDeApuesta(i);
            if (EventoDeApuesta) {
                var cSi = EventoDeApuesta.cuotaSi / 10000; //Como guardo 1e4, lo divido para tener la cuota real
                var cNo = EventoDeApuesta.cuotaNo / 10000;

                //Genero la es string con los datos del mercado para plotearlo
                estadoEventosApuesta = estadoEventosApuesta +
                    "--- Evento de Apuesta ---" +
                    "\nID: " + i +
                    "\nDescripción: " + EventoDeApuesta.descripcion +
                    "\nCuota Sí: " + cSi +
                    "\nCuota No: " + cNo +
                    "\nFecha Límite: " + new Date(EventoDeApuesta.fechaLimiteApuestas * 1000).toLocaleString() +
                    "\nNum apuestas individuales: " + EventoDeApuesta.numeroDeApuestasIndividuales +
                    "\nAbierta: " + (EventoDeApuesta.estaAbierta ? "Si" : "No") + 
                    "\nResuelta: " + (EventoDeApuesta.estaResuelta ? "Si" : "No") +
                    "\n-------------------\n";

            }
        }

        return estadoEventosApuesta;


    } catch (error) {
        console.error('Error al consultar los mercados que hay en la blockchain:', error);

    }

}


export default LeerMercadosExistentes;