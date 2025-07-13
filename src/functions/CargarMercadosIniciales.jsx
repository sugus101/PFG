// Funcion para cargar los mercados iniciales


async function CargarMercadosIniciales(_descripcion, _cuotaSi, _cuotaNo, _duracion, _contract) {

    // 1.0 Recupera los valores de la funcion
    const descripcion = _descripcion;
    const cuotaSi = _cuotaSi * 10000; // Convertir a %10000
    const cuotaNo = _cuotaNo * 10000; // Convertir a %10000
    const duracion = _duracion > 0 ? _duracion : 3600 * 24; //Esto es porque a verces polymarket me devuelve alguna apuesta ya caducada. Le pongo duracion de un dia entonces    

    console.log("Evento a cargar: ", descripcion, cuotaSi, cuotaNo, duracion);

    try {

        // 2.0 le mando los datos al contrato
        const tx = await _contract.crearEventoDeApuesta(
            descripcion,
            parseInt(cuotaSi),
            parseInt(cuotaNo),
            parseInt(duracion)
        );

        // 2.1 Espero a que acabe el minado
        await tx.wait();
        console.log('Transacción minada con hash ', tx.hash);

    } catch (err) {
        console.error('Error al crear el evento:', err);
    }

}

export default CargarMercadosIniciales;