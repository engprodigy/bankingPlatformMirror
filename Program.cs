using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace TheCoreBanking.Customer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                 #if DEBUG
                .UseUrls("http://localhost:2289")
                 #endif
                .UseStartup<Startup>()
                .Build();
    }
}