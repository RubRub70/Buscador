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

      // Buscar la placa en el JSON
      const placaEncontrada = placas.find(p => p.Placa === placaInput);

      if (placaEncontrada) {
        // Si la placa está en la base de datos, mostrar los resultados
        resultMessage.textContent = `La placa ${placaInput} pertenece a: ${placaEncontrada.Estado}`;
        resultMessage.style.color = "green";

        // Mostrar detalles adicionales
        detailsContainer.innerHTML = `
          <strong>Detalles:</strong><br>
          <strong>Estado:</strong> ${placaEncontrada.Estado} <br>
          <strong>N. LETRAS:</strong> ${placaEncontrada["N. LETRAS"]} <br>
          <strong>P1:</strong> ${placaEncontrada.P1} <br>
          <strong>P2:</strong> ${placaEncontrada.P2} <br>
          <strong>P3:</strong> ${placaEncontrada.P3} <br>
          <strong>P4:</strong> ${placaEncontrada.P4} <br>
          <strong>P5:</strong> ${placaEncontrada.P5} <br>
          <strong>P6:</strong> ${placaEncontrada.P6} <br>
          <strong>P7:</strong> ${placaEncontrada.P7} <br>
        `;
      } else {
        // Si la placa no está en la base de datos, sugerir posibles estados
        resultMessage.textContent = "Sugerencias de posibles estados:";
        resultMessage.style.color = "orange";

        // Sugerir posibles estados basados en las primeras letras
        const sugerencias = sugerirEstados(placaInput, placas);
        if (sugerencias.length > 0) {
          detailsContainer.innerHTML = `
            <strong>Posibles estados:</strong><br>
            1. <span style="color: ${sugerencias[0].color};">${sugerencias[0].estado}</span><br>
            2. <span style="color: ${sugerencias[1].color};">${sugerencias[1].estado}</span>
          `;
        } else {
          detailsContainer.innerHTML = "No se pudieron encontrar sugerencias para la placa.";
        }
      }
    }

    // Función para sugerir estados según la placa
    function sugerirEstados(placaInput, placas) {
      // Tomamos los primeros 3 caracteres de la placa como referencia para buscar coincidencias
      const prefijo = placaInput.substring(0, 3);

      // Filtramos las placas que comienzan con los mismos primeros 3 caracteres
      const coincidencias = placas.filter(placa => placa.Placa && placa.Placa.substring(0, 3) === prefijo);

      // Contar las ocurrencias de los estados en las coincidencias
      const estadosCount = coincidencias.reduce((acc, placa) => {
        acc[placa.Estado] = (acc[placa.Estado] || 0) + 1;
        return acc;
      }, {});

      // Convertir el objeto de conteo en un array de objetos con el estado y el número de coincidencias
      const estados = Object.keys(estadosCount).map(estado => ({
        estado,
        count: estadosCount[estado]
      }));

      // Ordenar los estados por el número de coincidencias (de mayor a menor)
      estados.sort((a, b) => b.count - a.count);

      // Limitar las sugerencias a los dos estados más comunes
      const sugerencias = estados.slice(0, 2);

      // Si hay sugerencias, destacamos el estado más común en verde y el segundo en naranja
      return sugerencias.map((sug, index) => ({
        estado: sug.estado,
        color: index === 0 ? "green" : "orange"  // El primer estado será verde (correcto)
      }));
    }

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Búsqueda en tiempo real mientras se escribe (sin presionar el botón)
    document.getElementById('placa-input').addEventListener('input', buscarPlaca);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
