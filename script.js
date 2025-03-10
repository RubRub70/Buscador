// Crear un nuevo Worker
const worker = new Worker('worker.js');

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

      // Enviar los datos al worker
      worker.postMessage({ placaInput, placas });

      // Mostrar mensaje de búsqueda
      resultMessage.textContent = "Buscando placa...";
      resultMessage.style.color = "orange";
      detailsContainer.innerHTML = ""; // Limpiar los detalles mientras se busca
    }

    // Recibir los resultados del worker
    worker.onmessage = function(e) {
      const resultMessage = document.getElementById('result-message');
      const detailsContainer = document.getElementById('details');
      const resultado = e.data;

      if (Array.isArray(resultado)) {
        // Si son sugerencias
        resultMessage.textContent = "Sugerencias de posibles estados:";
        resultMessage.style.color = "orange";

        detailsContainer.innerHTML = `
          <strong>Posibles estados:</strong><br>
          1. <span style="color: ${resultado[0].color};">${resultado[0].estado} (${resultado[0].label})</span><br>
          2. <span style="color: ${resultado[1].color};">${resultado[1].estado} (${resultado[1].label})</span><br>
          3. <span style="color: ${resultado[2].color};">${resultado[2].estado} (${resultado[2].label})</span><br>
          <small>Ejemplo de placa: ${resultado[0].ejemplo}</small>
        `;
      } else {
        // Si es una placa exacta
        resultMessage.textContent = `La placa ${resultado.Placa} pertenece al estado ${resultado['N. LETRAS']}.`;
        resultMessage.style.color = "green";
        
        detailsContainer.innerHTML = `
          <strong>Estado:</strong> ${resultado['N. LETRAS']} <br>
          <strong>Placa:</strong> ${resultado.Placa} <br>
        `;
      }
    };

    // Evento de búsqueda cuando el usuario presiona el botón
    document.getElementById('search-btn').addEventListener('click', buscarPlaca);

    // Búsqueda en tiempo real mientras se escribe (sin presionar el botón)
    document.getElementById('placa-input').addEventListener('input', buscarPlaca);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
