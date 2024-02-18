const API_URL = 'https://mindicador.cl/api/';

const obtenerTipoCambio = async (moneda) => {
  try {
    const respuesta = await fetch(`${API_URL}${moneda}`);
    const datos = await respuesta.json();
    return datos.serie[0].valor;
  } catch (error) {
    console.error(error);
    mostrarError('Error al obtener el tipo de cambio');
  }
};

const realizarConversion = (monto, tipoCambio) => {
  const resultado = monto / tipoCambio;
  return resultado.toFixed(2);
};

const mostrarConversion = (moneda, monto, resultado) => {
    const conversionEl = document.getElementById('conversion');
    conversionEl.innerHTML = `
        <span class="math-inline">${monto} pesos chilenos equivalen a <strong>${resultado} ${moneda}</strong></span>
    `;
};

let myChart; 

const mostrarGrafico = (moneda, historial) => {
  const canvasEl = document.getElementById('grafico');
  const ctx = canvasEl.getContext('2d');

  if (myChart) {
    myChart.destroy();
  }

  const labels = historial.map(dia => dia.fecha);
  const valores = historial.map(dia => dia.valor);

  const data = {
    labels,
    datasets: [{
      label: `Valor del ${moneda} en los últimos 10 días`,
      data: valores,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'line',
    data,
    options: {
      scales: {
        y: {
          suggestedMin: Math.min(...valores) - 10,
          suggestedMax: Math.max(...valores) + 10
        }
      }
    }
  };

  // Crear un nuevo gráfico
  myChart = new Chart(ctx, config);
};

  

const mostrarError = (mensaje) => {
  const resultadoEl = document.getElementById('conversion');
  resultadoEl.innerHTML = `<p class="error">${mensaje}</p>`;
};

const formularioEl = document.getElementById('conversor');
formularioEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const monto = parseFloat(e.target.querySelector('#monto').value);
  const moneda = e.target.moneda.value;

  const tipoCambio = await obtenerTipoCambio(moneda);
  if (!tipoCambio) return;

  const resultado = realizarConversion(monto, tipoCambio);
  mostrarConversion(moneda, monto, resultado);

  const historial = await obtenerHistorial(moneda);
  if (!historial) return;

  mostrarGrafico(moneda, historial);
});

const obtenerHistorial = async (moneda) => {
    try {
      const respuesta = await fetch(`${API_URL}${moneda}`);
      const datos = await respuesta.json();
      const historial = datos.serie.slice(-10);
      return historial;
    } catch (error) {
      console.error(error);
      mostrarError('Error al obtener el historial');
    }
  };
  
