using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace URBANMOVE_Proyecto.Server.Services
{
    public sealed class EmailOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; }
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }
    public sealed class EmailService
    {
        private readonly EmailOptions _options;

        public EmailService(IOptions<EmailOptions> options)
        {
            _options = options.Value;
        }

        public async Task SendAsync(
            string to,
            string subject,
            string body,
            bool isHtml = true
            )
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_options.Username),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            message.To.Add(to);

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                Credentials = new NetworkCredential(
                    _options.Username,
                    _options.Password),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }
    }
}
