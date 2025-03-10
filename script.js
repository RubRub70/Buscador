// Cargar los datos del archivo JSON
fetch('placas.json')
  .then(response => response.json())
  .then(placas => {
    // Función de búsqueda
    function buscarPlaca() {
      const placaInput = document.getElementById('placa-input').value.trim().toUpperCase(); // Convertimos a mayúsculas
      const resultMessage = document.getElementById('result-message');
      const detailsContainer = document.getElementById('details');

      // Limitar a 8 caracteres
      if (placaInput.length > 8) {
        resultMessage.textContent = "La placa no puede tener más de 8 caracteres.";
        resultMessage.style.color = "red";
        detailsContainer.innerHTML = "";
        return;
      }

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
            1. <span style="color: ${sugerencias[0].color};">${sugerencias[0].estado} (${sugerencias[0].label})</span><br>
            2. <span style="color: ${sugerencias[1].color};">${sugerencias[1].estado} (${sugerencias[1].label})</span><br>
            3. <span style="color: ${sugerencias[2].color};">${sugerencias[2].estado} (${sugerencias[2].label})</span><br>
            4. <span style="color: ${sugerencias[3].color};">${sugerencias[3].estado} (${sugerencias[3].label})</span>
          `;
        } else {
          detailsContainer.innerHTML = "No se pudieron encontrar sugerencias para la placa.";
        }
      }
    }

    // Función para sugerir estados según las primeras 2 letras de la placa
    function sugerirEstados(placaInput, placas) {
      const prefijo = placaInput.substring(0, 2); // Solo tomamos los primeros 2 caracteres de la placa

      // Filtramos las placas que contienen los primeros 2 caracteres de la placa ingresada
      const coincidencias = placas.filter(placa => placa.Placa && placa.Placa.substring(0, 2).includes(prefijo));

      if (coincidencias.length === 0) {
        // Si no hay coincidencias, sugerimos cuatro estados más comunes basados en las primeras letras
        const estadosUnicos = [...new Set(placas.map(placa => placa['N. LETRAS']))];

        // Seleccionamos cuatro estados aleatorios
        const sugerenciasAleatorias = [];
        while (sugerenciasAleatorias.length < 4 && estadosUnicos.length > 0) {
          const index = Math.floor(Math.random() * estadosUnicos.length);
          sugerenciasAleatorias.push(estadosUnicos.splice(index, 1)[0]);
        }

        return sugerenciasAleatorias.map((estado, index) => ({
          estado,
          color: index === 0 ? "green" : index === 1 ? "orange" : index === 2 ? "yellow" : "red",
          label: index === 0 ? "Mayor coincidencia" : index === 1 ? "Coincidencia Promedio" : "Puedes intentarlo, pero no te aseguro nada"
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

      // Ordenamos por el número de coincidencias y retornamos las cuatro sugerencias más relevantes
      estados.sort((a, b) => b.count - a.count);

      // Limitar a las 4 sugerencias principales
      const sugerencias = estados.slice(0, 4);

      // Asignamos colores y etiquetas a las sugerencias
      return sugerencias.map((sug, index) => ({
        estado: sug.estado,
        color: index === 0 ? "green" : index === 1 ? "orange" : "red",
        label: index === 0 ? "Mayor coincidencia" : index === 1 ? "80% de coincidencia" : "Puedes intentarlo, pero no te aseguro nada"
      }));
    }

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Búsqueda en tiempo real mientras se escribe (sin presionar el botón)
    document.getElementById('placa-input').addEventListener('input', buscarPlaca);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
