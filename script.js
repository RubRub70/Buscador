document.addEventListener('DOMContentLoaded', function () {
  // Cargar los datos del archivo JSON
  fetch('placas.json')
    .then(response => response.json())
    .then(placas => {
      // Función de búsqueda
      function buscarPlaca() {
        const placaInput = document.getElementById('placa-input').value.trim().toUpperCase(); // Convertir a mayúsculas
        const resultMessage = document.getElementById('result-message');
        const detailsContainer = document.getElementById('details');

        if (placaInput === "") {
          resultMessage.textContent = "Por favor ingresa una placa.";
          resultMessage.style.color = "red";
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
          resultMessage.textContent = "Placa no encontrada. Sugerencias:";
          resultMessage.style.color = "orange";

          // Sugerir posibles estados basados en las primeras letras
          const sugerencias = sugerirEstados(placaInput, placas);
          if (sugerencias.length > 0) {
            detailsContainer.innerHTML = `
              <strong>Posibles estados:</strong><br>
              1. ${sugerencias[0]}<br>
              2. ${sugerencias[1] ? sugerencias[1] : 'No hay más sugerencias.'}
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
        const coincidencias = placas.filter(placa => placa.Placa.substring(0, 3) === prefijo);

        // Extraemos los estados únicos
        const estados = [...new Set(coincidencias.map(placa => placa.Estado))];

        // Limitar las sugerencias a máximo dos estados
        return estados.slice(0, 2);
      }

      // Evento de búsqueda cuando el usuario escribe en el campo de entrada
      document.getElementById('placa-input').addEventListener('input', buscarPlaca);
    })
    .catch(error => console.error('Error al cargar el archivo JSON:', error));
});
