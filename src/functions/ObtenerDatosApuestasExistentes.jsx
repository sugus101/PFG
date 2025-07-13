import { ethers } from 'ethers'; //para convertir los numeros por error en mac que no salia en windows

async function ObtenerDatosApuestaExistentes(contract) { //Nota Gus: una funcion async siempre devuelve un objeto promise!!!
    console.log('\nConsultando apuestas en la blockchain...');

    // 1 Declaracion de variables
    const mercadosEncontrados = [];

    // 2 Se conecta con la blockchain para obtener los mercados
    try {
        //Recorre los 10 primeros mercados de la blockchain
        for (let i = 1; i <= 10; i++) { //Nota gus: en solidity empieza a contar por el 1

            // A - Llama a la funcion del contrato
            const EventoDeApuesta = await contract.obtenerEstadoEventoDeApuesta(i);

            // B - Si el evento tiene contenido lo vuelca a la lista de mercados
            if (EventoDeApuesta && EventoDeApuesta.descripcion && EventoDeApuesta.descripcion !== "") {
                const cuotaSi = parseFloat(ethers.utils.formatUnits(EventoDeApuesta.cuotaSi, 4)); // "4" porque 10^4 = 10000
                const cuotaNo = parseFloat(ethers.utils.formatUnits(EventoDeApuesta.cuotaNo, 4)); 
                const apuestaObjeto = { // C- Creo un objeto con todo
                    id: i,
                    descripcion: EventoDeApuesta.descripcion,
                    cuotaSi: cuotaSi,
                    cuotaNo: cuotaNo,
                    fechaLimite: new Date(EventoDeApuesta.fechaLimiteApuestas * 1000).toISOString(), // Convertir timestamp a formato ISO
                    numeroApuestasIndividuales: EventoDeApuesta.numeroDeApuestasIndividuales.toNumber(), // Convertir BigNumber a número
                    estaAbierta: EventoDeApuesta.estaAbierta,
                    estaResuelta: EventoDeApuesta.estaResuelta,
                };
                // D -  Añade el objeto al array
                mercadosEncontrados.push(apuestaObjeto);
            }

        }
        return mercadosEncontrados;

    } catch (err) {
        console.warn(`No se pudo obtener el evento de apuesta:`, err.message);
 
    }
}


export default ObtenerDatosApuestaExistentes;