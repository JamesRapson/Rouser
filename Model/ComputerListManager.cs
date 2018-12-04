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

        public ComputerDetails AddComputer(ComputerDetails computer)
        {
            if (!string.IsNullOrWhiteSpace(computer.Id))
                throw new Exception("Id must NOT be specified");

            ComputerDetails newComp = new ComputerDetails( Guid.NewGuid().ToString(), computer );
            _computersList.Add(newComp);
            WriteComputersList();
            return newComp;
        }

        public void UpdateComputer(ComputerDetails computer)
        {
            if (string.IsNullOrWhiteSpace(computer.Id))
                throw new Exception("Id must be specified");

            _computersList.RemoveAll(comp => comp.Id == computer.Id);
            _computersList.Add(computer);
            WriteComputersList();

        }

        void WriteComputersList()
        {   
            using (var file = File.CreateText(ComputersListFile))
            {
                _computersList.ForEach(computer => computer.WriteTo(file) );
            }
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
                .Where(x => string.IsNullOrWhiteSpace(filterString) ||
                            x.Id.Contains(filterString) ||
                            (!string.IsNullOrWhiteSpace(x.Name) && x.Name.Contains(filterString)) ||
                            (!string.IsNullOrWhiteSpace(x.Description) && x.Description.Contains(filterString)) ||
                            (!string.IsNullOrWhiteSpace(x.User) && x.User.Contains(filterString)) ||
                            (!string.IsNullOrWhiteSpace(x.MacAddress) && x.MacAddress.Contains(filterString)) ||
                            (!string.IsNullOrWhiteSpace(x.IPAddress) && x.IPAddress.Contains(filterString)))
                .OrderByDescending(c => c.Name)
                .Take(100)
                .ToList();
        }

        void LoadComputers()
        { 
            if (!File.Exists(ComputersListFile))
                return;

            _computersList.Clear();

            using ( var file = File.OpenText(ComputersListFile) )
            {
                while ( !file.EndOfStream )
                {
                    var computer = ComputerDetails.ReadFrom( file );
                    if (computer != null)
                    {
                        if (_computersList.Any(c => c.Id == computer.Id))
                            continue;

                        _computersList.Add(computer);
                    }

                    // stop processing if we get a stupidly large number of items
                    if (_computersList.Count > 10000 )  
                        break;
                }
            }
        }

        public string ComputersListFile
        {
            get
            {
                if ( string.IsNullOrEmpty(_dataFolder) )
                    throw new Exception( "Folder must be specified" );
                return Path.Combine(_dataFolder, "ComputersList.txt" );
            }
        }
    }
}
