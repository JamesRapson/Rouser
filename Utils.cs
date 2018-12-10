using System;
using System.Collections.Generic;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;

namespace Rouser
{
    public static class Utils
    {

        public static bool TryExtractIPv4(string str, out IPAddress ipv4Address)
        {
            ipv4Address = null;
            string[] parts = str.Split(',', ' ');
            foreach (string part in parts)
            {
                if (part.Split(".").Count() != 4)
                    continue;

                if (!IPAddress.TryParse(part, out IPAddress temp))
                    continue;

                if (temp.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    ipv4Address = temp;
                    return true;
                }
            }

            return false;
            ;
        }
    }
}

