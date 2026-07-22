using System.Reflection;
using System.Text;
using System.Xml.Serialization;

namespace URBANMOVE_Proyecto.Server.Services
{
    public static class ExportHelper
    {
        public static byte[] ToCsvBytes<T>(IEnumerable<T> datos)
        {
            var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var sb = new StringBuilder();
            sb.Append(string.Join(";", props.Select(p => p.Name)));
            sb.Append("\r\n");

            foreach (var item in datos)
            {
                var valores = props.Select(p =>
                {
                    var valor = p.GetValue(item)?.ToString() ?? "";
                    if (valor.Contains(';') || valor.Contains('"') || valor.Contains('\n'))
                        valor = $"\"{valor.Replace("\"", "\"\"")}\"";
                    return valor;
                });
                sb.Append(string.Join(";", valores));
                sb.Append("\r\n");
            }

            var preamble = Encoding.UTF8.GetPreamble();
            var content = Encoding.UTF8.GetBytes(sb.ToString());
            return [.. preamble, .. content];
        }

        public static string ToXml<T>(List<T> datos, string rootName)
        {
            var serializer = new XmlSerializer(typeof(List<T>), new XmlRootAttribute(rootName));
            using var sw = new StringWriter();
            var ns = new XmlSerializerNamespaces();
            ns.Add("", "");
            serializer.Serialize(sw, datos, ns);
            return sw.ToString();
        }
    }
}
