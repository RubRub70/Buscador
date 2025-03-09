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
        return;
      }

      // Buscar la placa en el JSON
      const placaEncontrada = placas.find(p => p.Placa === placaInput);

      if (placaEncontrada) {
        // Mostrar los resultados
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
        resultMessage.textContent = "Placa no encontrada en la base de datos.";
        resultMessage.style.color = "red";
        detailsContainer.innerHTML = ""; // Limpiar los detalles si no se encuentra la placa
      }
    }

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Permitir búsqueda también con la tecla Enter
    document.getElementById('placa-input').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        buscarPlaca();
      }
    });
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
