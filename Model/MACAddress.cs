using System;
using System.Collections.Generic;
using System.Linq;
using MoreLinq;
using System.Threading.Tasks;

namespace Rouser.Model
{
    public class MACAddress
    {
        private readonly byte[] _macAddressBytes = new byte[6];

        public MACAddress()
        {

        }

        public MACAddress(byte[] macAddress)
        {
            if (macAddress.Length != 6)
                throw new Exception("Invalid MAC Address");
            macAddress.CopyTo(_macAddressBytes, 0);
        }

        public byte[] AddressBytes 
        {
            get
            {
                byte[] macBytes = new byte[6];
                _macAddressBytes.CopyTo(macBytes, 0);
                return macBytes;
            }
        }

        public override string ToString()
        {
            return string.Join('-', _macAddressBytes.Select(x => x.ToString()));
        }

        public static MACAddress Parse(string str)
        {
            if (MACAddress.TryParse(str, out var mac))
                return mac;

            throw new Exception("Invalid MAC Address");
        }

        public static bool TryParse(string str, out MACAddress macAddress)
        {
            macAddress = null;
            try
            {
                string[] macDigits = str.Split('-', ':');
                if (macDigits.Length != 6)
                    return false;

                byte[] macBytes = new byte[6];
                for (int i = 0; i < 6; i++)
                {
                    macBytes[i] = (byte) Convert.ToInt32(macDigits[i], 16);
                }

                macAddress = new MACAddress(macBytes);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public override bool Equals(object obj)
        {
            if (obj is MACAddress mac)
            {
                return mac.ToString() == ToString();
            }
            return base.Equals(obj);
        }
    }
}
