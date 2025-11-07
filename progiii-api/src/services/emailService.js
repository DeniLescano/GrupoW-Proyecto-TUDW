const nodemailer = require('nodemailer');

/**
 * Servicio para envío de emails
 * Configuración usando variables de entorno para producción
 */
class EmailService {
  constructor() {
    // Configurar transporter de email
    // En producción, usar variables de entorno
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER || 'tu_email@gmail.com',
        pass: process.env.SMTP_PASS || 'tu_password'
      }
    });

    // En desarrollo, usar nodemailer con ethereal (email de prueba)
    // Si no hay credenciales configuradas, usar ethereal
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'tu_email@gmail.com') {
      // Usar ethereal para desarrollo (emails de prueba)
      this.useEthereal = true;
    } else {
      this.useEthereal = false;
    }
  }

  /**
   * Inicializar transporter con ethereal (para desarrollo)
   */
  async initEthereal() {
    if (this.useEthereal && !this.etherealAccount) {
      this.etherealAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.etherealAccount.user,
          pass: this.etherealAccount.pass
        }
      });
    }
  }

  /**
   * Enviar email de confirmación de reserva
   * @param {string} email - Email del cliente
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise<Object>} Información del email enviado
   */
  async enviarConfirmacionReserva(email, reservaData) {
    try {
      await this.initEthereal();

      const { fecha_reserva, salon_titulo, salon_direccion, hora_desde, hora_hasta, tematica, importe_total, servicios } = reservaData;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .info-label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Reserva Confirmada</h1>
            </div>
            <div class="content">
              <p>Estimado/a cliente,</p>
              <p>Su reserva ha sido <strong>confirmada</strong> exitosamente. A continuación, los detalles:</p>
              
              <div class="info-box">
                <p><span class="info-label">Fecha:</span> ${fecha_reserva}</p>
                <p><span class="info-label">Salón:</span> ${salon_titulo}</p>
                <p><span class="info-label">Dirección:</span> ${salon_direccion}</p>
                <p><span class="info-label">Horario:</span> ${hora_desde} - ${hora_hasta}</p>
                ${tematica ? `<p><span class="info-label">Temática:</span> ${tematica}</p>` : ''}
                ${servicios && servicios.length > 0 ? `<p><span class="info-label">Servicios:</span> ${servicios.map(s => s.descripcion || s).join(', ')}</p>` : ''}
                <p><span class="info-label">Importe Total:</span> $${parseFloat(importe_total || 0).toFixed(2)}</p>
              </div>

              <p>Le esperamos en la fecha y hora acordadas. ¡Que disfrute su celebración!</p>
              
              <div class="footer">
                <p>Este es un email automático, por favor no responder.</p>
                <p>Sistema de Gestión de Reservas</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || `"Sistema de Reservas" <${this.transporter.options.auth.user}>`,
        to: email,
        subject: 'Reserva Confirmada - Sistema de Reservas',
        html: htmlContent,
        text: `Su reserva ha sido confirmada. Fecha: ${fecha_reserva}, Salón: ${salon_titulo}, Horario: ${hora_desde} - ${hora_hasta}, Importe: $${parseFloat(importe_total || 0).toFixed(2)}`
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Si es ethereal, mostrar URL de preview
      if (this.useEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 Email de prueba enviado. Preview URL:', previewUrl);
      }

      return { success: true, messageId: info.messageId, previewUrl: this.useEthereal ? nodemailer.getTestMessageUrl(info) : null };
    } catch (error) {
      console.error('❌ Error al enviar email de confirmación:', error);
      throw error;
    }
  }

  /**
   * Enviar email de cancelación de reserva
   * @param {string} email - Email del cliente
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise<Object>} Información del email enviado
   */
  async enviarCancelacionReserva(email, reservaData) {
    try {
      await this.initEthereal();

      const { fecha_reserva, salon_titulo, salon_direccion, hora_desde, hora_hasta, importe_total } = reservaData;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
            .info-label { font-weight: bold; color: #dc3545; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Reserva Cancelada</h1>
            </div>
            <div class="content">
              <p>Estimado/a cliente,</p>
              <p>Su reserva ha sido <strong>cancelada</strong>. A continuación, los detalles de la reserva cancelada:</p>
              
              <div class="info-box">
                <p><span class="info-label">Fecha:</span> ${fecha_reserva}</p>
                <p><span class="info-label">Salón:</span> ${salon_titulo}</p>
                <p><span class="info-label">Dirección:</span> ${salon_direccion}</p>
                <p><span class="info-label">Horario:</span> ${hora_desde} - ${hora_hasta}</p>
                <p><span class="info-label">Importe:</span> $${parseFloat(importe_total || 0).toFixed(2)}</p>
              </div>

              <p>Si tiene alguna consulta sobre esta cancelación, por favor contacte con nosotros.</p>
              
              <div class="footer">
                <p>Este es un email automático, por favor no responder.</p>
                <p>Sistema de Gestión de Reservas</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || `"Sistema de Reservas" <${this.transporter.options.auth.user}>`,
        to: email,
        subject: 'Reserva Cancelada - Sistema de Reservas',
        html: htmlContent,
        text: `Su reserva ha sido cancelada. Fecha: ${fecha_reserva}, Salón: ${salon_titulo}, Horario: ${hora_desde} - ${hora_hasta}, Importe: $${parseFloat(importe_total || 0).toFixed(2)}`
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Si es ethereal, mostrar URL de preview
      if (this.useEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 Email de prueba enviado. Preview URL:', previewUrl);
      }

      return { success: true, messageId: info.messageId, previewUrl: this.useEthereal ? nodemailer.getTestMessageUrl(info) : null };
    } catch (error) {
      console.error('❌ Error al enviar email de cancelación:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

