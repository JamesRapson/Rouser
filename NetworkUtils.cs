using System;
using System.Collections.Generic;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;

namespace Rouser
{
    public class NetworkUtils
    {

        public static ICollection<IPAddress> GetSubnetMasks()
        {
            List<IPAddress> subnets = new List<IPAddress>();
            NetworkInterface[] interfaces = NetworkInterface.GetAllNetworkInterfaces();
            foreach (NetworkInterface Interface in interfaces)
            {
                if (Interface.NetworkInterfaceType == NetworkInterfaceType.Loopback)
                    continue;
                
                UnicastIPAddressInformationCollection unicastIPInfoCol = Interface.GetIPProperties().UnicastAddresses;
                subnets.AddRange(unicastIPInfoCol
                    .Where(x => !x.IPv4Mask.Equals(IPAddress.None))
                    .Where(x => !x.IPv4Mask.Equals(IPAddress.Any))
                    .Select(x => x.IPv4Mask));
            }

            return subnets;
        }
    }
}

