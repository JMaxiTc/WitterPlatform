export const initializeSelfXSSWarning = (): void => {
  // Evitamos que se ejecute en entornos de desarrollo local o testing
  //if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
   // return;
 // }

  const warningTitleCSS = `
    color: white;
    background-color: #d32f2f;
    font-size: 35px;
    font-weight: bold;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    padding: 10px 25px;
    border-radius: 8px;
    border: 3px solid #b71c1c;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    line-height: 1.5;
  `;

  const warningBodyCSS = `
    color: #333333;
    font-size: 16px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    padding-top: 10px;
  `;

const dangerTextCSS = `
    color: #d32f2f;
    font-size: 18px;
    font-weight: 900;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding-top: 5px;
  `;

  // Limpiamos la consola por si hay logs residuales antes de lanzar el mensaje
  console.clear();

  console.log('%c⚠️ DETENTE ⚠️', warningTitleCSS);
  console.log(
    '%cEsta función del navegador está pensada únicamente para desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función oculta de la plataforma, liberar un pago en Escrow o "hackear" una cuenta, se trata de un fraude que les dará acceso a tu sesión y a tus datos.',
    warningBodyCSS
  );
  console.log(
    '%cNo pegues ningún código aquí.',
    dangerTextCSS
  );
};