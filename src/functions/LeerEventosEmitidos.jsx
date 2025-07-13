// FUNCION PARA LEER LOS EVENTOS QUE HA EMITIDO LA BLOCKCHAIN

async function LeerEventosExistentes(_contract) { //Nota Gus: una funcion async siempre devuelve un objeto promise!!!

    console.log('\nConsultando eventos históricos...');
    const eventosProcesados = []; // Array para almacenar los objetos de eventos procesados

    try {
        // Le pido los eventos emitidos al contrato
        const allEventos = await _contract.queryFilter(
            '*',        // todos los eventoss
            'earliest', // Bloque inicial
            'latest'    // Bloque final
        );

        // Ordeno los eventos para tener los mas recientes arriba (Si dos eventos están en el mismo bloque -> log index)
        allEventos.sort((a, b) => {
            if (b.blockNumber !== a.blockNumber) {
                return b.blockNumber - a.blockNumber; // Ordenar por bloque 
            }
            return b.logIndex - a.logIndex; // Ordenar por logIndex
        });

        console.log(`El numero de eventos encontrados son # (${allEventos.length}):`);

        // Iterar sobre los eventos y procesar sus argumentos
        var evento;
        for (var i = 0; i < allEventos.length; i++) {

            evento = allEventos[i];
            var datosEvento = '';

            // switch para catalogar cada evento
            // Nota gus: acuerdate de actualizar el ABI si modificas los eventos o salen undefined.
            switch (evento.event) {
                case 'EventoDeApuestaCreado':
                    datosEvento = `\n aMercado Creado - ID: ${evento.args.betId.toString()}, ` +
                        `\n Descripción: "${evento.args.descripcion}", ` + 
                        `\n Cuota Sí: ${(Number(evento.args.cuotaSi) / 10000).toFixed(2)}, ` + 
                        `\n Cuota No: ${(Number(evento.args.cuotaNo) / 10000).toFixed(2)}, ` + 
                        `\n Cierre: ${new Date(Number(evento.args.fechaLimite) * 1000).toLocaleString()}, ` + 
                        `\n Creador: ${evento.args.creador}` + 
                        "\n----";
                    break;
                case 'EventoApuestaRealizada':
                    datosEvento = `\n Apuesta Realizada - ID: ${evento.args.betId.toString()}, ` +
                        `\n Apostante: "${evento.args.apostante}", ` + 
                        `\n Montante: ${Number(evento.args.montante)}, ` +
                        `\n Eleccion: ${evento.args.eleccion}, ` +
                        "\n----";
                    break;
                case 'EventoMercadoCerrado':
                    datosEvento = `\n Mercado Cerrado - ID: ${evento.args.betId.toString()}, ` +
                        "\n----";
                    break;
                case 'EventoMercadoResuelto':
                    datosEvento = `\n Mercado Resuelto - ID: ${evento.args.betId.toString()}, ` +
                        `\n Resultado ganador: "${evento.args.resultadoGanador}", ` +
                        `\n Montante pagado: "${evento.args.montanteTotalPagado}", ` +
                        "\n----";
                    break;
                case 'EventoFondosRetirados':
                    datosEvento = `\n Fondos Retirados:, ` +
                        `\n Beneficiario: "${evento.args.beneficiario}", ` +
                        `\n Montante: "${evento.args.montante}", ` +
                        "\n----";
                    break;
                case 'EventoContratoFondeado':
                    datosEvento = `\n Contrato fondeado:, ` +
                        `\n Fondeador: "${evento.args.fondeador}", ` +
                        `\n Montante: "${evento.args.montante}", ` +
                        "\n----";
                    break;
                case 'EventoDeApuestaEditado':
                    datosEvento = `\n Apuesta Editada - ID: ${evento.args.betId.toString()}, ` +
                        `\n Nueva Descripción: "${evento.args.nuevaDescripcion}", ` +
                        `\n Nueva Cuota Sí: ${(evento.args.nuevaCuotaSi / 10000).toFixed(2)}, ` +
                        `\n Nueva Cuota No: ${(evento.args.nuevaCuotaNo / 10000).toFixed(2)}` +
                        "\n----";
                    break;
                default: //Uno Generico por si no coincide con ninguno de los anteriores
                    datosEvento = `\n Evento Desconocido "${evento.event}" - ` +
                        `\n Tx Hash: ${evento.transactionHash}, ` +
                        "\n----";
                    break;
            }
            eventosProcesados.push(datosEvento);
        }

        return eventosProcesados;


    } catch (error) {
        console.error('Error al consultar eventos historicos emitidos:', error);
        return [];
    }

}


export default LeerEventosExistentes;