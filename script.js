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
            Ejemplo: <strong>${sugerencias[0].ejemplo}</strong><br>
            2. <span style="color: ${sugerencias[1].color};">${sugerencias[1].estado} (${sugerencias[1].label})</span><br>
            Ejemplo: <strong>${sugerencias[1].ejemplo}</strong><br>
            3. <span style="color: ${sugerencias[2].color};">${sugerencias[2].estado} (${sugerencias[2].label})</span><br>
            Ejemplo: <strong>${sugerencias[2].ejemplo}</strong>
          `;
        } else {
          detailsContainer.innerHTML = "No se pudieron encontrar sugerencias para la placa.";
        }
      }
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

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Búsqueda en tiempo real mientras se escribe (sin presionar el botón)
    document.getElementById('placa-input').addEventListener('input', buscarPlaca);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
