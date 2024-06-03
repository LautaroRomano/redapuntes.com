import React from 'react';

const Privacy = () => {
  return (
    <div className="container mx-auto p-4 overflow-y-scroll max-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidad</h1>
      <p>Última actualización: 03/06/2024</p>
      <p>
        Esta Política de Privacidad describe nuestras políticas y procedimientos sobre la
        recopilación, uso y divulgación de su información cuando utiliza el servicio y le
        informa sobre sus derechos de privacidad y cómo la ley le protege.
      </p>

      <h2 className="text-xl font-semibold mt-4">Recopilación y Uso de su Información Personal</h2>
      <p>
        Recopilamos varios tipos de información para diversos fines para proporcionar y mejorar
        nuestro servicio.
      </p>

      <h3 className="text-lg font-semibold mt-2">Tipos de Datos Recopilados</h3>
      <p><strong>Información Personal</strong></p>
      <p>
        Mientras usa nuestro servicio, podemos solicitarle que nos proporcione cierta información
        de identificación personal que puede usarse para contactarlo o identificarlo. La información
        de identificación personal puede incluir, entre otros:
      </p>
      <ul className="list-disc list-inside ml-4">
        <li>Dirección de correo electrónico</li>
        <li>Nombre y apellido</li>
        <li>Información de la cuenta</li>
        <li>Archivos subidos (apuntes, PDFs)</li>
      </ul>

      <h3 className="text-lg font-semibold mt-2">Uso de Datos</h3>
      <p>Usamos los datos recopilados para diversos fines:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Para proporcionar y mantener nuestro servicio</li>
        <li>Para notificarle sobre cambios en nuestro servicio</li>
        <li>Para permitirle participar en funciones interactivas de nuestro servicio</li>
        <li>Para proporcionar soporte al cliente</li>
        <li>Para recopilar análisis o información valiosa para que podamos mejorar nuestro servicio</li>
      </ul>

      <h3 className="text-lg font-semibold mt-2">Seguridad de sus Datos</h3>
      <p>
        La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de
        transmisión a través de Internet o método de almacenamiento electrónico es 100% seguro.
      </p>

      <h3 className="text-lg font-semibold mt-2">Cambios en esta Política de Privacidad</h3>
      <p>
        Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier
        cambio publicando la nueva Política de Privacidad en esta página.
      </p>

      <p className="mt-4">
        Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos por correo electrónico a info.repositorio.universitario@gmail.com.
      </p>
    </div>
  );
};

export default Privacy;
