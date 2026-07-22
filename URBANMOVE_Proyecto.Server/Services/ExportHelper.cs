using System.Reflection;
using System.Text;
using System.Xml.Serialization;

namespace URBANMOVE_Proyecto.Server.Services
{
    public static class ExportHelper
    {
        public static string ToCsv<T>(IEnumerable<T> datos)
        {
            var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var sb = new StringBuilder();
            sb.AppendLine(string.Join(",", props.Select(p => p.Name)));

            foreach (var item in datos)
            {
                var valores = props.Select(p =>
                {
                    var valor = p.GetValue(item)?.ToString() ?? "";
                    if (valor.Contains(',') || valor.Contains('"') || valor.Contains('\n'))
                        valor = $"\"{valor.Replace("\"", "\"\"")}\"";
                    return valor;
                });
                sb.AppendLine(string.Join(",", valores));
            }

            return sb.ToString();
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
