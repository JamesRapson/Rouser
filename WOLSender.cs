using System;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using Rouser.Model;

namespace Rouser
{
    public static class WolSender
    {

        public static async Task Send(string macAddress, string ipAddress, string subnetMask)
        {
            MACAddress.TryParse(macAddress, out var mac);
            Utils.TryExtractIPv4(ipAddress, out var ip);
            Utils.TryExtractIPv4(subnetMask, out var mask);
            await Send(mac, ip, mask);
        }

        /// <summary>
        /// Wakes up computer at the given ipAddress by send it a wake on lan packet (aka magic packet).
        /// The magic packet is sent
        /// 1. Directly to the given IP
        /// 2. As a global broadcast
        /// 3. As a subnet directed broadcast if the subnet mask is specified.
        /// </summary>
        /// <param name="macAddress"></param>
        /// <param name="ipAddress"></param>
        /// <param name="subnetMask"></param>
        public static async Task Send(MACAddress macAddress, IPAddress ipAddress, IPAddress subnetMask)
        {
            byte[] magicPacket = GenerateMagicPacket(macAddress);

            UdpClient client = new UdpClient();

            await client.SendAsync(magicPacket, magicPacket.Length, IPAddress.Broadcast.ToString(), 3);     // send to global broadcast address

            if (ipAddress != null)
            {
                System.Threading.Thread.Sleep(50);
                await client.SendAsync(magicPacket, magicPacket.Length, ipAddress.ToString(), 3); // send packet to target's IP address
            }
            
            if (subnetMask != null)
            { 
                IPAddress broadcastAddress = GetBroadcastAddress(ipAddress, subnetMask);

                System.Threading.Thread.Sleep(50);
                await client.SendAsync(magicPacket, magicPacket.Length, broadcastAddress.ToString(), 3);     // send packet to subnet broadcast address
            }
        }

        /// <summary>
        /// Construct a magic packet using the given MAC address.
        /// Magic Packet datagram bytes : [5 * 0xff][6 * MAC Address]
        /// </summary>
        /// <param name="macAddress"></param>
        /// <returns></returns>
        static byte[] GenerateMagicPacket(MACAddress macAddress)
        {
            byte[] datagram = new byte[102];

            for (int i = 0; i <= 5; i++)
                datagram[i] = 0xff;

            byte[] macBytes = macAddress.AddressBytes;

            const int start = 6;
            for (int i = 0; i < 16; i++)
            {
                for (int x = 0; x < 6; x++)
                    datagram[start + i * 6 + x] = macBytes[x];
            }

            return datagram;
        }

        /// <summary>
        /// Gets the subnet directed broadcast address for the given IP address and subnet mask
        /// </summary>
        /// <param name="address"></param>
        /// <param name="subnetMask"></param>
        /// <returns></returns>
        static IPAddress GetBroadcastAddress(IPAddress address, IPAddress subnetMask)
        {
            byte[] ipAddressBytes = address.GetAddressBytes();
            byte[] subnetMaskBytes = subnetMask.GetAddressBytes();

            if (ipAddressBytes.Length != subnetMaskBytes.Length)
                throw new ArgumentException("Lengths of IP address and subnet mask do not match.");

            byte[] broadcastAddress = new byte[ipAddressBytes.Length];
            for (int i = 0; i < broadcastAddress.Length; i++)
            {
                broadcastAddress[i] = (byte)(ipAddressBytes[i] | (subnetMaskBytes[i] ^ 255));
            }
            return new IPAddress(broadcastAddress);
        }

    }
}


