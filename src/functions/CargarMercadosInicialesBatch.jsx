// Funcion para cargar los mercados iniciales


async function CargarMercadosInicialesBatch(mercadosArray, contract) {

    // Miro que el array no este vacio
    if (!mercadosArray || mercadosArray.length == 0) {
        console.error("El array de mercados esta vacio.");
        return;
    }

    // 1.0 Recupero los valore del mercado
    const descripciones = mercadosArray.map(m => m.descripcion);
    const cuotasSi = mercadosArray.map(m => parseInt(m.cuotaSi * 10000));
    const cuotasNo = mercadosArray.map(m => parseInt(m.cuotaNo * 10000));
    const duraciones = mercadosArray.map(m => {
        return m.duracion > 0 ? parseInt(m.duracion) : parseInt(3600 * 24);
    }); //Esto es porque a verces polymarket me devuelve alguna apuesta ya caducada. Le pongo duracion de un dia entonces    

    console.log("Intentando cargar un batch de eventos...");

    try {

        // 2.0 le mando los datos al contrato
        const tx = await contract.crearEventosDeApuesta(descripciones, cuotasSi, cuotasNo, duraciones );

        // 2.1 Espero a que acabe el minado
        await tx.wait();
        console.log('Transaccion minada con hash ', tx.hash);

        console.log(`¡Se han creado ${mercadosArray.length} eventos en el contrato con exito!`);

        console.log('Transacción minada con hash ', tx.hash);

    } catch (err) {
        console.error('Error al crear el evento:', err);
    }

}

export default CargarMercadosInicialesBatch;