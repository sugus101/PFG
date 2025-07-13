// ---------------------------------------
// Contexto para cargar los mercados de polymarket
// ---------------------------------------


import { useState, useEffect } from 'react';


//Se crea el provider
export function FetchMercados() {
  const [mercados, setMercados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerMercados = async () => {
      try {
        setCargando(true);
        setError(null);
        const respuesta = await fetch('/api/markets?active=true&archived=false&closed=false&limit=10&end_date_max=2025-12-31&start_date_min=2025-01-01');
        if (!respuesta.ok) {
          throw new Error(`HTTP error! status: ${respuesta.status}`);
        }
        const data = await respuesta.json();
        console.log('Lista de mercados obtenida:', data);
        setMercados(data);
        console.log('Mercados:', mercados);
      } catch (error) {
        setError(error);
        setCargando(false);
      } finally {
        setCargando(false);
      }
    };

    obtenerMercados();

  }, []);

  return { mercados, cargando, error };

}


export default FetchMercados;
