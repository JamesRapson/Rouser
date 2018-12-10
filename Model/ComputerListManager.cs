using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Rouser.Model;

namespace Rouser.Model
{
    /// <summary>
    
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
            string data = Newtonsoft.Json.JsonConvert.SerializeObject(_computersList);
            File.WriteAllText(ComputersListFile, data);
        }

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
