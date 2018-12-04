using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Rouser.Configuration;
using Microsoft.Extensions.Logging;
using Rouser.Model;

namespace Rouser
{
    public class Startup
    {
        public Startup( IConfiguration configuration )
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration
        {
            get;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices( IServiceCollection services )
        {
            services.AddMvc().SetCompatibilityVersion( CompatibilityVersion.Version_2_1 );

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles( configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            } );

            services.AddLogging( logging => logging.AddDebug().SetMinimumLevel( LogLevel.Trace ) );

            services.Configure<ConfigSettings>( Configuration.GetSection("RouserSettings") );
            services.AddSingleton(new ComputerListManager());
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure( IApplicationBuilder app, IHostingEnvironment env,
            ILoggerFactory loggerFactory)
        {
            if ( env.IsDevelopment() )
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler( "/Error" );
                app.UseHsts();
            }

            //app.UseAuthentication();
            //app.UseHttpsRedirection();
            //app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseMvc( routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action}/{id?}" );
            } );

            app.UseSpa( spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                if ( env.IsDevelopment() )
                {
                    spa.UseReactDevelopmentServer( npmScript: "start" );
                }
            } );
        }
        
    }
}
