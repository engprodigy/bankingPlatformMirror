using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using TheCoreBanking.Retail.Data;
using TheCoreBanking.Retail.Data.Contracts;

namespace TheCoreBanking.Customer
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .AddMvc()
                .AddJsonOptions(
                    options => options.SerializerSettings.ReferenceLoopHandling
                        = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            services
                .AddAuthentication(options =>
                {
                    options.DefaultScheme = "Retail.Cookies";
                    options.DefaultChallengeScheme = "oidc";
                    options.DefaultAuthenticateScheme = "oidc";
                })
                .AddCookie("Retail.Cookies")
                .AddOpenIdConnect("oidc", options =>
                {
                    //options.Authority = "http://bankingplatform:8042";
                    options.Authority = "http://localhost:2289";
                    options.RequireHttpsMetadata = false;
                    options.ClientId = "TheCoreBanking.Retail";
                    options.SignInScheme = "Retail.Cookies";
                    options.ResponseType = "code id_token";
                    options.Scope.Clear();
                    options.Scope.Add("openid");
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                    options.Scope.Add("roles");
                    options.GetClaimsFromUserInfoEndpoint = true;
                    options.SaveTokens = true;
                    options.ClientSecret = "secret";
                    options.Events = new OpenIdConnectEvents()
                    {
                        OnTokenValidated = tokenValidatedContext =>
                        {
                            return Task.FromResult(0);
                        },
                        OnUserInformationReceived = (context) =>
                        {
                            ClaimsIdentity claimsId = context.Principal.Identity as ClaimsIdentity;
                            try
                            {

                                dynamic userClaim = JObject.Parse(context.User.ToString());
                                var roles = userClaim.role;
                                foreach (string role in roles)
                                {
                                    claimsId.AddClaim(new Claim("role", role));
                                }
                            }
                            catch (Exception)
                            {
                                //Users does not have roles
                            }
                            return Task.FromResult(0);
                        }

                    };

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = JwtClaimTypes.Name,
                        RoleClaimType = JwtClaimTypes.Role
                    };
                })
                ;
            //services
            //    .AddDbContext<RetailContext>(
            //        options => options.UseSqlServer(
            //            Configuration.GetConnectionString("TheCoreBanking")
            //        )
            //    );
            services.AddScoped<IRetailUnitOfWork, RetailUnitOfWork>();
            services.AddScoped<Retail.Data.Helpers.IRepositoryProvider, Retail.Data.Helpers.RepositoryProvider>();
            services.AddSingleton<Retail.Data.Helpers.RepositoryFactories>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseAuthentication();
            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Setup}/{action=Index}/{id?}");
            });
        }
    }
}