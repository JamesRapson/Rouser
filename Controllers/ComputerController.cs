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

namespace Rouser.Controllers
{
    [Route("api/[controller]")]
    public class ComputerController : Controller
    {
        private readonly ConfigSettings _settings;
        private readonly ILogger<ComputerController> _logger;
        private readonly ComputerListManager _computerListManager;

        public ComputerController(IOptions<ConfigSettings> settings, ILogger<ComputerController> logger,
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
                _logger?.LogError($"Failed to get list of commands. Error {ex}");
                throw;
            }
        }

        [HttpPost()]
        public IActionResult AddEdit(ComputerDetails computer)
        {
            try
            {
                if (!IPAddress.TryParse(computer.IPAddress, out _))
                    return StatusCode(StatusCodes.Status400BadRequest, "Invalid IP Address");
                
                if (!MACAddress.TryParse(computer.MacAddress, out _))
                    return StatusCode(StatusCodes.Status400BadRequest, "Invalid MAC Address");

                if (string.IsNullOrWhiteSpace(computer.Id))
                {
                    _computerListManager.AddComputer(computer);
                }
                else
                {
                    _computerListManager.UpdateComputer(computer);
                }

                return Ok();
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
                
                if (!IPAddress.TryParse(computer.IPAddress, out IPAddress ipAddress))
                    return StatusCode(StatusCodes.Status400BadRequest, "Computer has an invalid IP Address");

                if (!MACAddress.TryParse(computer.MacAddress, out MACAddress macAddress))
                    return StatusCode(StatusCodes.Status400BadRequest, "Computer has an invalid MAC Address");
            
                
                var subnetMasks = NetworkUtils.GetSubnetMasks();
                subnetMasks.ForEach(mask => WOLSender.Send(macAddress, ipAddress, mask));

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
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
    }
}
