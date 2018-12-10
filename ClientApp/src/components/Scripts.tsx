
import * as React from "react";
import { Panel } from "react-bootstrap";
import "../index.css";

const addComputerScript = `
## Powershell ##
# Get the IP and MAC Address for all adapters
$adapters = @();
$wmiAdapterConfig = Get-WmiObject -Class Win32_NetworkAdapterConfiguration  | where {$_.MACAddress -ne $null} 
foreach($config in $wmiAdapterConfig)
{
    $adapters += 
        @{
            MACAddress = $config.MACAddress;
            IPAddress = $config.IPAddress;
            Subnet = $config.IPSubnet
        }
}

$compOS = Get-WmiObject -Class Win32_OperatingSystem 
  
# Call WebAPI to create computer record 
$url = "$baseUrl/api/computer" 

$body = @{ 
    Name = $env:COMPUTERNAME;
    Description = $compOS.Description;
    User = $env:USERNAME;
    NetworkAdapters = $adapters
} 

Invoke-RestMethod -Uri $url  -Method Post -UseDefaultCredential  -Body (ConvertTo-Json $body)  -ContentType "application/json"
`;

const setPowerSchemeScript = `
## Powershell ##
&powercfg -change monitor-timeout-ac 60
&powercfg -change monitor-timeout-dc 60
&powercfg -change standby-timeout-ac 120
&powercfg -change standby-timeout-dc 120
`;

export class Scripts extends React.Component<any, any> {

    renderSetPowerSchemeScript(): JSX.Element {

        return (
            <Panel bsStyle="primary">
                <Panel.Heading>
                    <h3>Set Power Scheme Script</h3>
                    <p>This script sets the Sleep power scheme for your computer.</p>
                </Panel.Heading>
                <Panel.Body>
                    <div>
                    </div>
                    <pre>
                    <code>
                        {setPowerSchemeScript}
                    </code>
                </pre>
                </Panel.Body>
            </Panel>);
    }

    renderAddComputerScript(): JSX.Element {

        const baseUrl = window.location.href.replace("scripts", "");
        const line1 = `$baseUrl = "${baseUrl}"\n`;
        const modifiedScript = line1 + addComputerScript;

        return (

            <Panel bsStyle="primary">
                <Panel.Heading>
                    <h3>Add Computer Script</h3>
                    <p>This script creates a record for the computer on your Rouser server.</p>
                </Panel.Heading>
                <Panel.Body>
                    <pre>
                        <code>
                            {modifiedScript}
                        </code>
                    </pre>
                </Panel.Body>
            </Panel>
        );
    }

    render(): JSX.Element {
        return (
            <div>
                {this.renderAddComputerScript()}
                {this.renderSetPowerSchemeScript()}
            </div>);
    }
}
