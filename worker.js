// worker.js

self.onmessage = function (e) {
  // Recibimos el mensaje con los datos del hilo principal (placas y placaInput)
  const { placaInput, placas } = e.data;

  // Convertimos el input de la placa a mayúsculas
  const placaInputUpper = placaInput.trim().toUpperCase();

  // Función para calcular la distancia de Levenshtein
  function calcularLevenshtein(a, b) {
    const tmp = [];
    let i, j;
    for (i = 0; i <= a.length; i++) {
      tmp[i] = [i];
    }
    for (j = 0; j <= b.length; j++) {
      tmp[0][j] = j;
    }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1, // Deletions
          tmp[i][j - 1] + 1, // Insertions
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // Substitutions
        );
      }
    }
    return tmp[a.length][b.length];
  }

  // Función para sugerir estados según las primeras 4 letras de la placa
  function sugerirEstados(placaInput, placas) {
    const prefijo = placaInput.substring(0, 4); // Solo tomamos los primeros 4 caracteres de la placa

    // Calculamos la distancia de Levenshtein para todas las placas en la base de datos
    const coincidencias = placas.map(placa => {
      const distance = calcularLevenshtein(placa.Placa.substring(0, 4), prefijo); // Calculamos la distancia entre el prefijo de la placa y el input
      return { placa, distance }; // Retornamos la placa con su distancia
    });

    // Filtramos las placas que tienen una distancia de Levenshtein razonable (menor a un umbral)
    const umbral = 3; // Si la distancia es menor a 3, consideramos que es una coincidencia aceptable
    const coincidenciasFiltradas = coincidencias.filter(coincidencia => coincidencia.distance <= umbral);

    if (coincidenciasFiltradas.length === 0) {
      // Si no hay coincidencias, sugerimos tres estados aleatorios
      const estadosUnicos = [...new Set(placas.map(placa => placa['N. LETRAS']))];

      // Seleccionamos tres estados aleatorios
      const sugerenciasAleatorias = [];
      while (sugerenciasAleatorias.length < 3 && estadosUnicos.length > 0) {
        const index = Math.floor(Math.random() * estadosUnicos.length);
        sugerenciasAleatorias.push(estadosUnicos.splice(index, 1)[0]);
      }

      return sugerenciasAleatorias.map((estado, index) => ({
        estado,
        color: index === 0 ? "green" : index === 1 ? "orange" : "gray",
        label: index === 0 ? "Mayor coincidencia" : index === 1 ? "80% de coincidencia" : "Puedes intentarlo, pero no te aseguro nada",
        ejemplo: "Ejemplo de placa: " + placas.find(p => p['N. LETRAS'] === estado).Placa
      }));
    }

    // Ordenamos las coincidencias por la distancia de Levenshtein (de menor a mayor)
    coincidenciasFiltradas.sort((a, b) => a.distance - b.distance);

    // Limitar a las 3 mejores sugerencias
    const sugerencias = coincidenciasFiltradas.slice(0, 3);

    // Asignamos colores, etiquetas y ejemplos a las sugerencias
    return sugerencias.map((sug, index) => ({
      estado: sug.placa['N. LETRAS'],
      color: index === 0 ? "green" : index === 1 ? "orange" : "red",
      label: index === 0 ? "Mayor coincidencia" : index === 1 ? "80% de coincidencia" : "Puedes intentarlo, pero no te aseguro nada",
      ejemplo: "Ejemplo de placa: " + sug.placa.Placa
    }));
  }

  // Intentamos encontrar una placa exacta
  const placaEncontrada = placas.find(p => p.Placa === placaInputUpper);

  if (placaEncontrada) {
    // Si encontramos una coincidencia exacta, la devolvemos al hilo principal
    postMessage(placaEncontrada);
  } else {
    // Si no hay coincidencia exacta, buscamos sugerencias
    const sugerencias = sugerirEstados(placaInputUpper, placas);
    postMessage(sugerencias); // Enviamos las sugerencias de vuelta al hilo principal
  }
};
