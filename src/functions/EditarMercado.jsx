// FUNCION PARA EDITAR UN MERCADO EXISTENTE EN LA BLOCKCHAIN

import { ethers } from 'ethers';

async function EditarMercado(betId, nuevaDescripcion, nuevaCuotaSi, nuevaCuotaNo, _contract) { //Nota Gus: una funcion async siempre devuelve un objeto promise!!!

    try {

        // Tomo los argumentos y los adapto
        const _nuevaCuotaSi = parseInt(parseFloat(nuevaCuotaSi) * 10000); // Convertir a %10000 que es como esta en la blockchain
        const _nuevaCuotaNo = parseInt(parseFloat(nuevaCuotaNo) * 10000); // Convertir a %10000
        const _betId = parseInt(betId);

        console.log('Datos a enviar para editar:', { _betId, nuevaDescripcion, _nuevaCuotaSi, _nuevaCuotaNo }); 

        // Llama a la funcion del smartcontract
        const tx = await _contract.editarEventoDeApuesta(_betId, nuevaDescripcion, _nuevaCuotaSi, _nuevaCuotaNo);
        await tx.wait(); 
        console.log('Transacción de edición minada:', tx);
        return;

    } catch (error) {
        console.error('Error al interactuar con el contrato:', error);
        return;
    }

}

export default EditarMercado;