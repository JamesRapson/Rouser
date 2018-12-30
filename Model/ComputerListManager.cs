using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MoreLinq;
using Newtonsoft.Json;


namespace Rouser.Model
{
    /// <summary>
    /// Very very simply persistent of the list of computers.
    /// </summary>
    public class ComputerListManager
    {
        private readonly string _dataFolder;
        private readonly List<ComputerDetails> _computersList = new List<ComputerDetails>();

        public ComputerListManager(string dataFolder = ".")
        {
            if (string.IsNullOrEmpty(dataFolder))
                throw new Exception("Folder must be specified");

            _dataFolder = dataFolder;

            if (!Directory.Exists(_dataFolder))
                Directory.CreateDirectory(_dataFolder);

            LoadComputers();
        }


        /// <summary>
        /// Use the MAC Address to find a matching computer
        /// </summary>
        /// <param name="macAddresses"></param>
        /// <returns></returns>
        public string FindByMACAddress(IEnumerable<MACAddress> macAddresses)
        {
            foreach (MACAddress macAddress in macAddresses)
            {
                var matched = _computersList.FirstOrDefault(comp =>
                    comp.NetworkAdapters.Any(a =>
                    {
                        MACAddress.TryParse(a.MacAddress, out var mac1);
                        return macAddress.Equals(mac1);
                    }));

                if (matched != null)
                    return matched.Id;
            }
            return null;
        }

        /// <summary>
        /// Adds computer record to list or replaces existing record it match is found.
        /// Match is performed using the Id field if this is specified, otherwise the match is
        /// performed using the MAC Address(s). 
        /// </summary>
        /// <param name="computer"></param>
        /// <returns></returns>
        public ComputerDetails AddUpdateComputer(ComputerDetails computer)
        {
            if (!string.IsNullOrWhiteSpace(computer.Id))
            {
                // Update an existing record matched by Id
                _computersList.RemoveAll(comp => comp.Id == computer.Id);
            }
            else
            {
                var macAddresses = computer.NetworkAdapters
                    .Select(x => MACAddress.Parse(x.MacAddress));
                
                var matchedCompId = FindByMACAddress(macAddresses);
                if (matchedCompId != null)
                {
                    _computersList.RemoveAll(comp => comp.Id == matchedCompId);
                    computer.Id = matchedCompId;
                }
                else
                {
                    computer.Id = Guid.NewGuid().ToString();
                }
            }

            _computersList.Add(computer);
            WriteComputersList();
            return computer;
        }
        
        public void Delete(string id)
        {
            _computersList.RemoveAll(x => x.Id == id);
            WriteComputersList();
        }
        
        public ComputerDetails GetById(string id)
        {
            return _computersList.FirstOrDefault(x => x.Id == id);
        }
        
        /// <summary>
        /// Returns the list of computer records where any field on the record matches the 
        /// <paramref name="filterString"/> parameter
        /// </summary>
        /// <param name="filterString"></param>
        /// <returns></returns>
        public ICollection<ComputerDetails> GetByFilter(string filterString = null)
        {
            return _computersList
                .Where(comp => string.IsNullOrWhiteSpace(filterString) ||
                    comp.Id.Contains(filterString) ||
                    (!string.IsNullOrWhiteSpace(comp.Name) && comp.Name.Contains(filterString)) ||
                    (!string.IsNullOrWhiteSpace(comp.Description) && comp.Description.Contains(filterString)) ||
                    (!string.IsNullOrWhiteSpace(comp.User) && comp.User.Contains(filterString)) ||
                     comp.NetworkAdapters.Any(adapter =>
                        (!string.IsNullOrWhiteSpace(adapter.IPAddress) && adapter.IPAddress.Contains(filterString)) ||
                        (!string.IsNullOrWhiteSpace(adapter.Subnet) && adapter.Subnet.Contains(filterString)) ||
                        (!string.IsNullOrWhiteSpace(adapter.MacAddress) && adapter.MacAddress.Contains(filterString))))
                .OrderByDescending(c => c.Name)
                .Take(100)
                .ToList();
        }

        public IEnumerable<ComputerDetails> GetByName(string[] names)
        {
            return _computersList.Where(comp => names.Contains(comp.Name));
        }

        void LoadComputers()
        { 
            if (!File.Exists(ComputersListFile))
                return;

            _computersList.Clear();

            string data = File.ReadAllText(ComputersListFile);
            var list = Newtonsoft.Json.JsonConvert.DeserializeObject<ComputerDetails[]>(data);
            _computersList.AddRange(list);
        }

        void WriteComputersList()
        {
            string data = Newtonsoft.Json.JsonConvert.SerializeObject(_computersList, Formatting.Indented);
            File.WriteAllText(ComputersListFile, data);
        }

        /// <summary>
        /// Returns the full path of the file used to store the list of computer records
        /// </summary>
        public string ComputersListFile
        {
            get
            {
                if ( string.IsNullOrEmpty(_dataFolder) )
                    throw new Exception( "Folder must be specified" );
                return Path.Combine(_dataFolder, "ComputersList.json" );
            }
        }
    }
}
