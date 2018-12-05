using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Rouser.Model
{
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
            MacAddress = computer.MacAddress;
            IPAddress = computer.IPAddress;
        }

        public ComputerDetails(string id, string name, string description, string user, string macAddress, string ipAddress)
        {
            Id = id;
            Name = name;
            Description = description;
            User = user;
            MacAddress = macAddress;
            IPAddress = ipAddress;
        }

        public ComputerDetails(string name, string description, string user, string macAddress, string ipAddress)
        {
            Name = name;
            Description = description;
            User = user;
            MacAddress = macAddress;
            IPAddress = ipAddress;
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

        
        public string MacAddress
        {
            get; set;
        }

        public string IPAddress
        {
            get; set;
        }

        public void WriteTo( StreamWriter writer )
        {
            writer.WriteLine( $"{Id}\t{Name}\t{Description}\t{User}\t{MacAddress}\t{IPAddress}" );
        }

        public static ComputerDetails ReadFrom( StreamReader reader )
        {
            string line = reader.ReadLine();
            if (line == null)
                return null;
            var parts = line.Split( new char[] { '\t' } );

            if ( parts.Length < 5 )
                return null;

            return new ComputerDetails(
                id : parts[0],
                name : parts[1],
                description : parts[2],
                user : parts[3],
                macAddress : parts[4],
                ipAddress : parts[5]
            );
        }

        public override bool Equals(object obj)
        {
            if (obj is ComputerDetails comp)
            {
                return comp.Name == Name &&
                       comp.Description == Description &&
                       comp.IPAddress == IPAddress &&
                       comp.MacAddress == MacAddress &&
                       comp.User == User;
            }
            return base.Equals(obj);
        }
    }
}
