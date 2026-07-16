namespace URBANMOVE_Proyecto.Server.Middlewares
{
    public class NetworkMiddleware
    {
        private const int METHOD_BLOCK_SPACE = 7;
        private const int TIME_BLOCK_SPACE = 6;
        private readonly RequestDelegate _next;

        public NetworkMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var watch = System.Diagnostics.Stopwatch.StartNew();

            await _next(context);

            watch.Stop();

            var elapsedMs = watch.ElapsedMilliseconds;

            switch (context.Request.Method.ToUpper())
            {
                case "GET":
                    Console.ForegroundColor = ConsoleColor.Green;
                    break;
                case "POST":
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    break;
                case "PUT":
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    break;
                case "DELETE":
                    Console.ForegroundColor = ConsoleColor.Red;
                    break;
                case "PATCH":
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    break;
                case "OPTIONS":
                    Console.ForegroundColor = ConsoleColor.Gray;
                    break;
                case "HEAD":
                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    break;
                default:
                    Console.ForegroundColor = ConsoleColor.White;
                    break;
            }

            string head = $"[{context.Request.Method}]";

            if (head.Length < METHOD_BLOCK_SPACE)
            {
                head = head.PadRight(METHOD_BLOCK_SPACE);
            }

            string timeBlock = $"{elapsedMs}ms";

            if (timeBlock.Length <= TIME_BLOCK_SPACE)
            {
                timeBlock = timeBlock.PadRight(TIME_BLOCK_SPACE);
            }

            Console.WriteLine($">> {head} {timeBlock} {context.Response.StatusCode} - {context.Request.Path}");

            Console.ResetColor();

        }
    }
}
