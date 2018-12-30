using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Rouser.Configuration;
using Rouser.Model;
using MoreLinq;
using System.Net;
using System.Text;

namespace Rouser.Controllers
{
    [Route("api/[controller]")]
    public class ComputerController : Controller
    {
        private readonly ConfigSettings _settings;
        private readonly ILogger<ComputerController> _logger;
        private readonly ComputerListManager _computerListManager;

        public ComputerController(
            IOptions<ConfigSettings> settings, 
            ILogger<ComputerController> logger,
            ComputerListManager computerListManager)
        {
            _settings = settings.Value;
            _logger = logger;
            _computerListManager = computerListManager;
        }

        [HttpGet("[action]/{filterStr?}")]
        public ICollection<ComputerDetails> List(string filterStr = null)
        {
            try
            {
                return _computerListManager
                    .GetByFilter(filterStr)
                    .OrderBy(x => x.Name)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError($"Failed to get list of computers. Error {ex}");
                throw;
            }
        }

        [HttpGet("[action]")]
        public ICollection<ComputerDetails> Recent()
        {
            try
            {
                var computersList = GetRecentComputerNames();
                if (computersList == null)
                    return new List<ComputerDetails>();

                return _computerListManager.GetByName(computersList).ToArray();
            }
            catch (Exception ex)
            {
                _logger?.LogError($"Failed to get recent computers. Error {ex}");
                throw;
            }
        }


        [HttpPost()]
        public IActionResult AddEdit([FromBody]ComputerDetails computer)
        {
            try
            {
                NetworkAdapterDetails.CheckAdapters(computer.NetworkAdapters);
                computer.NetworkAdapters = NetworkAdapterDetails.CombineAdapters(computer.NetworkAdapters);
                ComputerDetails newComputer = _computerListManager.AddUpdateComputer(computer);
                return Ok(newComputer);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("[action]/{computerId}")]
        public IActionResult Wake(string computerId)
        {
            try
            {
                var computer = _computerListManager.GetById(computerId);
                if (computer == null)
                    return StatusCode(StatusCodes.Status400BadRequest, "Unknown computer id specified");

                  NetworkAdapterDetails.CheckAdapters(computer.NetworkAdapters);
                
                computer.NetworkAdapters.ForEach(adapter =>
                    {
                        WOLSender.Send(adapter.MacAddress, adapter.IPAddress, adapter.Subnet);
                    });

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("[action]/{computerId}")]
        public IActionResult GetRDPFile(string computerId)
        {
            var computer = _computerListManager.GetById(computerId);
            if (computer == null)
                return StatusCode(StatusCodes.Status400BadRequest, "Unknown computer id specified");

            string fileContent = $"full address:s:{computer.Name}";
            return File(Encoding.UTF8.GetBytes(fileContent), "text/rdp", $"{computer.Name}.rdp");
        }

        [HttpDelete("{computerId}")]
        public IActionResult Delete(string computerId)
        {
            if (_computerListManager.GetById(computerId) == null)
                return StatusCode(StatusCodes.Status400BadRequest, "Unknown computer id specified");

            try
            {
                _computerListManager.Delete(computerId);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        string[] GetRecentComputerNames()
        {
            string recentComputers = Request.Cookies["recent-computers-list"];
            if (recentComputers == null)
                return new string[0];

            return recentComputers.Split('|');
        }

    }
}
