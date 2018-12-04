using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rouser.Model
{
    public class ConfigDetails
    {
        public ConfigDetails(string userName, string userRole, string rigName, string grayLogBaseUrl, string grafanaBaseUrl )
        {
            UserName = userName;
            UserRole = userRole;
            RigName = rigName;
            GrayLogBaseUrl = grayLogBaseUrl;
            GrafanaBaseUrl = grafanaBaseUrl;
        }

        public string UserName
        {
            get;
        }

        public string UserRole
        {
            get;
        }

        public string RigName
        {
            get;
        }

        public string GrayLogBaseUrl
        {
            get;
        }

        public string GrafanaBaseUrl
        {
            get;
        }

    }
}
