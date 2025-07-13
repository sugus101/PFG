// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ApuestasDistribuidas {

// .........................................0 DECLARACIONES e INIT.................................

    // -------------------------------
    // 0.0 - DECLARACION VARIABLES y TIPOS
    // -------------------------------
    enum EleccionApuesta { //Enum para la eleccion de la apuesta
        Nula,
        Si,
        No
    } // Nula = 0 ; Si = 1 ; No = 2

    struct ApuestaIndividual { //Struct para una apuesta individual
        address payable apostante;
        uint montante;
        EleccionApuesta eleccion;
        bool pagado; // Flag para saber si esta pagada o no
    }

    struct EventoDeApuesta { //Struct para un evento / mercado (incluye las apuestas)
        string descripcion;
        uint cuotaSi; // Cuota que se guarda como factor*1e4
        uint cuotaNo; // Cuota que se guarda como factor*1e4
        uint fechaLimiteApuestas;
        bool estaAbierta; //Para ver si se puede seguir apostando
        bool estaResuelta; //Para ver si el pago se ha hecho o no
        EleccionApuesta resultadoGanador; //Resultado
        uint montanteTotalApostadoASi;
        uint montanteTotalApostadoANo;
        ApuestaIndividual[] apuestasActuales; // Array de todas las apuestas realizadas en este evento
    }

    address public propietario; //El dueno del contrato
    uint public proximoBetId; //Marca el numero de mercados
    mapping(uint => EventoDeApuesta) public detallesEventoDeApuesta; //Mapeo los eventos con un uint

    // -------------------------------
    // 0.1 - DECLARCION DE LOS EVENTOS
    // -------------------------------
    event EventoDeApuestaCreado(
        uint indexed betId,
        string descripcion,
        uint cuotaSi,
        uint cuotaNo,
        uint fechaLimite,
        address creador);
    event EventoApuestaRealizada(
        uint indexed betId,
        address indexed apostante,
        uint montante,
        EleccionApuesta eleccion);
    event EventoMercadoCerrado(uint indexed betId, uint cerradaEn);
    event EventoMercadoResuelto(
        uint indexed betId,
        EleccionApuesta resultadoGanador,
        uint montanteTotalPagado);
    event EventoFondosRetirados(address indexed beneficiario, uint montante);
    event EventoContratoFondeado(address indexed fondeador, uint montante);
    event EventoDeApuestaEditado(
        uint indexed betId,
        string nuevaDescripcion,
        uint nuevaCuotaSi,
        uint nuevaCuotaNo);


    // -------------------------------
    // 0.2 - MODIFICADOR PARA EL OWNER
    // -------------------------------
    modifier soloPropietario() { //Esto es solo para limitar determinadas funciones al owner
        require(msg.sender == propietario,
            "Solo el propietario puede llamar esta funcion"); 
        _;
    }

    // -------------------------------
    // 0.3 - CONSTRUCTOR
    // -------------------------------
    constructor(address creador) payable {  //Lo pongo payable para inciar el contrato con un balance inicial (lo indico en el deploy_my_contract)
        propietario = creador;
        proximoBetId = 1; // Iniciar los IDs de apuesta desde 1
    }

    // -------------------------------
    // 0.4 - FONDEADOR
    // -------------------------------
    receive() external payable {
        emit EventoContratoFondeado(msg.sender, msg.value);
    }

// .........................................1 GENERACION.................................
    
    // -------------------------------
    // 1.1 CREAR EVENTO DE APUESTA (UN MERCADO) - SOLO PROPIETARIO
    // -------------------------------    
    function crearEventoDeApuesta(string memory _descripcion, uint _cuotaSi, uint _cuotaNo, uint _duracionApuestasEnSegundos) public soloPropietario { //Nota gus: en string le pongo memeory al ser tipo complejo y no necesitarlo despues de ej la funcion
        
        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(_cuotaSi > 10000, "La cuota para -Si- debe ser mayor que 1x (10000%)"); //como era uint recibe las cuotas *1e4
        require(_cuotaNo > 10000, "La cuota para -No- debe ser mayor que 1x (10000%)");
        require(_duracionApuestasEnSegundos > 0,"La duracion de las apuestas debe ser positiva");

        uint idActual = proximoBetId;

        EventoDeApuesta storage nuevaApuesta = detallesEventoDeApuesta[idActual]; // "Creo" un evento nuevo que lo guardo como storage

        nuevaApuesta.descripcion = _descripcion;
        nuevaApuesta.cuotaSi = _cuotaSi;
        nuevaApuesta.cuotaNo = _cuotaNo;
        nuevaApuesta.fechaLimiteApuestas = block.timestamp + _duracionApuestasEnSegundos; //El timestamp es para obtener el tiempo en secs de ahora.
        nuevaApuesta.estaAbierta = true;
        nuevaApuesta.estaResuelta = false;
        nuevaApuesta.resultadoGanador = EleccionApuesta.Nula; //Le asigno el nulo

        proximoBetId++; //pongo el contador a 1 mas para el mercado siguiente

        //Emito un evento
        emit EventoDeApuestaCreado(idActual, _descripcion, _cuotaSi, _cuotaNo, nuevaApuesta.fechaLimiteApuestas, msg.sender);
    }

    // -------------------------------
    // 1.2 CREAR UNA APUESTA
    // -------------------------------  
    function realizarApuesta(uint _betId,EleccionApuesta _eleccion) public payable {

        EventoDeApuesta storage eventoActual = detallesEventoDeApuesta[_betId]; //Nota gus: storage para que leugo puedas modificarlo

        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(eventoActual.estaAbierta, "Las apuestas para este evento no estan abiertas");
        require(block.timestamp < eventoActual.fechaLimiteApuestas, "La fecha limite para apostar en este evento ya paso");
        require(!eventoActual.estaResuelta, "Este evento ya ha sido resuelto");
        require(msg.value > 0, "El montante de la apuesta debe ser mayor que cero");
        require(_eleccion == EleccionApuesta.Si || _eleccion == EleccionApuesta.No, "Eleccion de apuesta invalida");

        // Creo una nueva apuesta y se la meto a las apuestas actuales
        eventoActual.apuestasActuales.push(ApuestaIndividual(payable(msg.sender), msg.value, _eleccion, false));

        //Actualizo los montantes apostados en total
        if (_eleccion == EleccionApuesta.Si) {
            eventoActual.montanteTotalApostadoASi += msg.value;
        } else {
            eventoActual.montanteTotalApostadoANo += msg.value;
        }

        //emito un evento
        emit EventoApuestaRealizada(_betId, msg.sender, msg.value, _eleccion);
    }

// .........................................2 EDICION.................................

    // -------------------------------
    // 2.1 EDITAR UN EVENTO / MERCADO - SOLO PROPIETARIO
    // -------------------------------  
    function editarEventoDeApuesta(uint _betId, string memory _nuevaDescripcion, uint _nuevaCuotaSi, uint _nuevaCuotaNo ) public soloPropietario {

        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(_betId > 0 && _betId < proximoBetId, "ID de apuesta invalido");

        EventoDeApuesta storage eventoAEditar = detallesEventoDeApuesta[_betId];

        // BLOQUE DE REQUIRES PARA EL EVENTO SELECCIONADO
        require(!eventoAEditar.estaResuelta,"No se puede editar un evento ya resuelto");
        require(_nuevaCuotaSi > 10000,"La nueva cuota para -Si- debe ser mayor que 1x (10000%)");
        require(_nuevaCuotaNo > 10000,"La nueva cuota para -No- debe ser mayor que 1x (10000%)");

        // Actualizo el evento
        eventoAEditar.descripcion = _nuevaDescripcion;
        eventoAEditar.cuotaSi = _nuevaCuotaSi;
        eventoAEditar.cuotaNo = _nuevaCuotaNo;

        // Emito un evento
        emit EventoDeApuestaEditado(_betId, _nuevaDescripcion, _nuevaCuotaSi, _nuevaCuotaNo);
    }

// .........................................3 CIERRE DE APUESTAS.................................

    // -------------------------------
    // 3.1 CERRAR UNA APUESTA f(TIEMPO) - Private
    // -------------------------------  
    function _verificarYCerrarApuestasAutomaticamente(uint _betId) private {

        // Selecciono la apuesta
        EventoDeApuesta storage eventoActual = detallesEventoDeApuesta[_betId];

        //Si esta abierta y se ha pasado el tiempo de la apuesta se cierra
        if (eventoActual.estaAbierta && block.timestamp >= eventoActual.fechaLimiteApuestas) {

            //La cierro y emito el evento
            eventoActual.estaAbierta = false;
            emit EventoMercadoCerrado( _betId,eventoActual.fechaLimiteApuestas);
        }

    }

    // -------------------------------
    // 3.2 CERRAR UNA APUESTA MANUAL - SOLO PROPIETARIO
    // -------------------------------  
    function cerrarApuestasManualmente(uint _betId) public soloPropietario {

        //Selecciono un evento
        EventoDeApuesta storage eventoActual = detallesEventoDeApuesta[_betId];
        
        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(eventoActual.estaAbierta, "Las apuestas para este evento ya estan cerradas o no inicializadas correctamente.");
        require(!eventoActual.estaResuelta,"No se puede cerrar un evento resuelto.");

        // La cierro y emito un evento
        eventoActual.estaAbierta = false;
        emit EventoMercadoCerrado(_betId, block.timestamp);
    }

    // -------------------------------
    // 3.3 RESOLUCION DE UNA APUESTA - SOLO PROPIETARIO
    // -------------------------------  
    function resolverEventoDeApuesta(uint _betId, EleccionApuesta _resultado) public soloPropietario {

        // Cargo el evento de la apuesta
        EventoDeApuesta storage eventoActual = detallesEventoDeApuesta[_betId];

        // Compruebo si esta pasado el tiempo de la apuesta (se cerraria automaticamente)
        _verificarYCerrarApuestasAutomaticamente(_betId); 

        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(!eventoActual.estaAbierta, "Las apuestas para este evento deben estar cerradas antes de resolver");
        require(!eventoActual.estaResuelta, "Este evento ya ha sido resuelto");
        require(_resultado == EleccionApuesta.Si ||_resultado == EleccionApuesta.No, "Resultado invalido para la resolucion");

        //Le pongo el resultado y la resuelvo
        eventoActual.resultadoGanador = _resultado;
        eventoActual.estaResuelta = true;

        // CALCULO CUANTO TENGO QUE PAGAR Y COMPRUEBO SI ES POSIBLE CON UN REQUIRE MAS!!
        uint montanteTotalAPagarEsteEvento = 0;
        for (uint i = 0; i < eventoActual.apuestasActuales.length; i++) { //recorro las apuestas actuales
            if (eventoActual.apuestasActuales[i].eleccion == _resultado) { //Selecciono las apuestas que coinciden con el resultado
                uint tasaDePago = (_resultado == EleccionApuesta.Si) ? eventoActual.cuotaSi : eventoActual.cuotaNo; //No divido aqui para que no me fastidie el entero y que se coma los decimales
                montanteTotalAPagarEsteEvento += (eventoActual.apuestasActuales[i].montante * tasaDePago)/10000; //Para ajustarlo al formato en el que lo envio que es 1e4
            }
        }
        require(address(this).balance >= montanteTotalAPagarEsteEvento,"Balance insuficiente en el contrato para los pagos de este evento.");

        //RECORRO LAS APUESTAS Y COMO HAY DINERO LAS PAGO
        for (uint i = 0; i < eventoActual.apuestasActuales.length; i++) {

            ApuestaIndividual storage apuestaDelApostante = eventoActual.apuestasActuales[i];

            if (!apuestaDelApostante.pagado && apuestaDelApostante.eleccion == _resultado) {

                uint tasaDePago = (_resultado == EleccionApuesta.Si) ? eventoActual.cuotaSi : eventoActual.cuotaNo; 
                uint montanteDePago = (apuestaDelApostante.montante * tasaDePago) /10000; //Para ajustarlo al formato en el que lo envio que es 1e4

                //Si me toca pagor se lo transfiero al apostante
                if (montanteDePago > 0) {
                    apuestaDelApostante.apostante.transfer(montanteDePago);
                    apuestaDelApostante.pagado = true;
                }
            }
        }

        // Emito un evento
        emit EventoMercadoResuelto(_betId, _resultado, montanteTotalAPagarEsteEvento);
    }


// ..........................................4 LECTURA.....................................


    // -------------------------------
    // 4.1 OBTERNER EL ESTADO DE UN EVENTO (MERCADO) - VIEW 
    // -------------------------------  
    function obtenerEstadoEventoDeApuesta(uint _betId) public view returns ( //Pongo view para no gastar GAS
            string memory descripcion, uint cuotaSi, uint cuotaNo, uint fechaLimiteApuestas, bool estaAbierta, bool estaResuelta,
            EleccionApuesta resultadoGanador, uint poolTotalSi, uint poolTotalNo,uint numeroDeApuestasIndividuales) {

        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(_betId > 0 && _betId < proximoBetId, "ID de apuesta no valido o no existe."); // Como el map si esta vacio me devulve una instancia por defecto pongo el require

        //Selecciono la apuesta en concreto
        EventoDeApuesta storage apuesta = detallesEventoDeApuesta[_betId]; 

        //Devuelvo la descripcion del evento
        return ( apuesta.descripcion, apuesta.cuotaSi, apuesta.cuotaNo, apuesta.fechaLimiteApuestas,
            apuesta.estaAbierta, apuesta.estaResuelta, apuesta.resultadoGanador, apuesta.montanteTotalApostadoASi, 
            apuesta.montanteTotalApostadoANo, apuesta.apuestasActuales.length
        );
    }

    // -------------------------------
    // 4.2 OBTENER DETALLES APUESTA INDIVIDUAL - VIEW
    // -------------------------------  
    function obtenerDetallesApuestaIndividual(uint _betId, uint _indiceApuesta) public view
        returns ( address apostante, uint montante, EleccionApuesta eleccion, bool pagado ) {

        // BLOQUE DE REQUIRES PARA QUE NO RECIBA DATOS ERRONEOS
        require(_indiceApuesta < detallesEventoDeApuesta[_betId].apuestasActuales.length, "Indice de apuesta individual fuera de rango");

        //Selecciono la apuesta
        ApuestaIndividual storage apuestaEspecifica = detallesEventoDeApuesta[_betId].apuestasActuales[_indiceApuesta];

        //Devuelco los datos de la apuesta
        return (apuestaEspecifica.apostante, apuestaEspecifica.montante, apuestaEspecifica.eleccion, apuestaEspecifica.pagado);
    }
}
