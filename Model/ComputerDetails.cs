using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MoreLinq;

namespace Rouser.Model
{
    /// <summary>
    /// Represents the details of a computer's network adapter that we need into order to send WOL
    /// </summary>
    public class NetworkAdapterDetails
    {
        public NetworkAdapterDetails()
        { }

        public NetworkAdapterDetails(NetworkAdapterDetails details)
        {
            MacAddress = details.MacAddress;
            Subnet = details.Subnet;
            IPAddress = details.IPAddress;
        }

        public NetworkAdapterDetails(string macAddress, string subnet, string ipAddress)
        {
            MacAddress = macAddress;
            Subnet = subnet;
            IPAddress = ipAddress;
        }


        public string MacAddress
        {
            get; set;
        }

        public string Subnet
        {
            get; set;
        }

        public string IPAddress
        {
            get; set;
        }

        /// <summary>
        /// Combines the list of network adapters based on the MAC Address.
        /// The implementation of this is not 100% correct, also this is just an optimisation that I don't think is adding any real value - consider removing it
        /// </summary>
        /// <param name="adapters">The list of adapters to combine</param>
        /// <returns></returns>
        public static List<NetworkAdapterDetails> CombineAdapters(List<NetworkAdapterDetails> adapters)
        {
            var groupedAdapters = adapters.GroupBy(
                a => a.MacAddress,
                a => a,
                (key, g) => new { MACAddress = key, Adapters = g.ToList() });

            var results = new List<NetworkAdapterDetails>();
            foreach (var group in groupedAdapters)
            {
                results.Add(
                    group.Adapters.Aggregate((current, accumulate) =>
                    {
                        if (string.IsNullOrWhiteSpace(accumulate.IPAddress) &&
                            !string.IsNullOrWhiteSpace(current.IPAddress))
                            accumulate.IPAddress = current.IPAddress;

                        if (string.IsNullOrWhiteSpace(accumulate.Subnet) &&
                            !string.IsNullOrWhiteSpace(current.Subnet))
                            accumulate.Subnet = current.Subnet;

                        return accumulate;
                    }));
            }

            return results;
        }

        /// <summary>
        /// Checks that the adapters details are correctly formatted such that we have the necessary information to send WOL packets
        /// </summary>
        /// <param name="adapters"></param>
        public static void CheckAdapters(List<NetworkAdapterDetails> adapters)
        {
            if (adapters.Count == 0)
                throw new Exception($"At least one Network Adapter must be specified.");

            foreach (NetworkAdapterDetails adapter in adapters)
            {                
                // Check IP Address
                if (!string.IsNullOrWhiteSpace(adapter.IPAddress))
                {
                    // If there are multiple IPs we are only interested in the ipv4 one
                    if (!Utils.TryExtractIPv4(adapter.IPAddress, out _))
                        throw new Exception($"IP Address '{adapter.IPAddress}' is invalid ");    
                }

                // Check MAC Address
                if (!string.IsNullOrWhiteSpace(adapter.MacAddress) &&
                    !MACAddress.TryParse(adapter.MacAddress, out _))
                {
                    throw new Exception($"MAC Address '{adapter.MacAddress}' is invalid ");
                }

                // Check Subnet 
                if (!string.IsNullOrWhiteSpace(adapter.Subnet))
                {
                    if (!Utils.TryExtractIPv4(adapter.Subnet, out _))
                        throw new Exception($"Subnet '{adapter.Subnet}' is invalid ");
                }
            }
        }
    }

    /// <summary>
    /// Represents the details of a computer
    /// </summary>
    public class ComputerDetails
    {
        public ComputerDetails()
        {

        }

        public ComputerDetails(string id, ComputerDetails computer)
        {
            Id = id;
            Name = computer.Name;
            Description = computer.Description;
            User = computer.User;
            var adapters= computer.NetworkAdapters.Select(x => new NetworkAdapterDetails(x));
            NetworkAdapters = new List<NetworkAdapterDetails>(adapters);
        }
       

        public string Id
        {
            get; set;
        }

        public string Name
        {
            get; set;
        }

        public string Description
        {
            get; set;
        }

        public string User
        {
            get; set;
        }

        /// <summary>
        /// The set of network adapters on this computer.
        /// </summary>
        public List<NetworkAdapterDetails> NetworkAdapters
        {
            get; set;
        }
    }
}
