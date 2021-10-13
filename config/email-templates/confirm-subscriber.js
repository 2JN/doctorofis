module.exports = {
  subject: 'Bienvenido <%= firstName %>',
  text: '',
  html: `
    <p>
      Hola <%= firstName %> <%= lastName %>. Muchas gracias por confiar en nosotros para cuidar de tu salud y de tus seres queridos.<br />
      Para administrar tu cuenta por favor ingresa al sitio con tu correo y la siguiente contraseña <%= password %>
    </p>
  `,
}
