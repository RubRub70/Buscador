// Cargar los datos del archivo JSON
fetch('placas.json')
  .then(response => response.json())
  .then(placas => {
    // Función de búsqueda
    function buscarPlaca() {
      const placaInput = document.getElementById('placa-input').value.trim().toUpperCase();
      const resultMessage = document.getElementById('result-message');
      const detailsContainer = document.getElementById('details');

      if (placaInput === "") {
        resultMessage.textContent = "Por favor ingresa una placa.";
        resultMessage.style.color = "red";
        detailsContainer.innerHTML = ""; // Limpiar los detalles si el campo está vacío
        return;
      }

      // Buscar la placa en el JSON (verificando si existe una placa exacta)
      const placaEncontrada = placas.find(p => p.Placa === placaInput);

      if (placaEncontrada) {
        // Si la placa está en la base de datos, mostrar el estado correspondiente
        resultMessage.textContent = `La placa ${placaInput} pertenece al estado ${placaEncontrada['N. LETRAS']}.`;
        resultMessage.style.color = "green";

        // Mostrar solo el estado, eliminando las claves P1, P2, etc.
        detailsContainer.innerHTML = `
          <strong>Estado:</strong> ${placaEncontrada['N. LETRAS']} <br>
        `;
      } else {
        // Si la placa no está en la base de datos, sugerir posibles estados
        resultMessage.textContent = "Sugerencias de posibles estados:";
        resultMessage.style.color = "orange";

        // Forzar la búsqueda de sugerencias, incluso si no se encuentra una placa exacta
        const sugerencias = sugerirEstados(placaInput, placas);

        if (sugerencias.length > 0) {
          detailsContainer.innerHTML = `
            <strong>Posibles estados:</strong><br>
            1. <span style="color: ${sugerencias[0].color};">${sugerencias[0].estado}</span><br>
            2. <span style="color: ${sugerencias[1].color};">${sugerencias[1].estado}</span><br>
            3. <span style="color: ${sugerencias[2].color};">${sugerencias[2].estado}</span>
          `;
        } else {
          detailsContainer.innerHTML = "No se pudieron encontrar sugerencias para la placa.";
        }
      }
    }

    // Función para sugerir estados según los primeros 7 caracteres de la placa
    function sugerirEstados(placaInput, placas) {
      const prefijo = placaInput.substring(0, 7); // Tomamos los primeros 7 caracteres de la placa como referencia para las sugerencias

      // Filtramos las placas que contienen los primeros caracteres de la placa ingresada (no exactos, pero similares)
      const coincidencias = placas.filter(placa => placa.Placa && placa.Placa.substring(0, 7).includes(prefijo));

      if (coincidencias.length === 0) {
        // Si no hay coincidencias, sugerimos tres estados más comunes basados en las primeras letras
        const estadosUnicos = [...new Set(placas.map(placa => placa['N. LETRAS']))];

        // Seleccionamos tres estados aleatorios
        const sugerenciasAleatorias = [];
        while (sugerenciasAleatorias.length < 3 && estadosUnicos.length > 0) {
          const index = Math.floor(Math.random() * estadosUnicos.length);
          sugerenciasAleatorias.push(estadosUnicos.splice(index, 1)[0]);
        }

        return sugerenciasAleatorias.map((estado, index) => ({
          estado,
          color: index === 0 ? "green" : index === 1 ? "orange" : "yellow"
        }));
      }

      // Si encontramos coincidencias, calculamos la frecuencia de los estados
      const estadosCount = coincidencias.reduce((acc, placa) => {
        acc[placa['N. LETRAS']] = (acc[placa['N. LETRAS']] || 0) + 1;
        return acc;
      }, {});

      // Convertimos el objeto de conteo en un array
      const estados = Object.keys(estadosCount).map(estado => ({
        estado,
        count: estadosCount[estado]
      }));

      // Ordenamos por el número de coincidencias y retornamos las tres sugerencias más relevantes
      estados.sort((a, b) => b.count - a.count);

      // Limitar a las 3 sugerencias principales
      const sugerencias = estados.slice(0, 3);

      // Asignamos colores a las sugerencias
      return sugerencias.map((sug, index) => ({
        estado: sug.estado,
        color: index === 0 ? "green" : index === 1 ? "orange" : "yellow"
      }));
    }

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Búsqueda en tiempo real mientras se escribe (sin presionar el botón)
    document.getElementById('placa-input').addEventListener('input', buscarPlaca);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
