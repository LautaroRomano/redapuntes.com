const tiempoTranscurrido = (fecha) => {
  const fechaActual = new Date();
  const fechaDadaUTC = new Date(fecha);

  // Convertir fecha UTC a la zona horaria local
  const offset = fechaDadaUTC.getTimezoneOffset();
  const fechaDada = new Date(fechaDadaUTC.getTime() - offset * 60 * 1000);

  const diferencia = fechaActual - fechaDada;

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
  const anio = Math.floor(meses / 12);

  if (segundos < 60) {
    return `${segundos} segundos`;
  } else if (minutos < 60) {
    return `${minutos} minutos`;
  } else if (horas < 24) {
    return `${horas} horas`;
  } else if (dias <= 30) {
    return `${dias} días`;
  } else if (meses <= 12) {
    return `${dias} meses`;
  } else {
    return `${anio} años`;
  }
};

export { tiempoTranscurrido };
