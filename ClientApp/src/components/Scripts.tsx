
import * as React from "react";
import { Panel } from "react-bootstrap";

const script = `
# Get the IP and MAC Address for this computer
$data = (Get-WmiObject -Class Win32_NetworkAdapterConfiguration | where {$_.DefaultIPGateway -ne $null}) | Select-Object -first 1
$macAddess = $data.MACAddress
$ipv4Addess = $data.IPAddress | Select-Object -First 1

$compOS = Get-WmiObject -Class Win32_OperatingSystem

# Call WebAPI to create computer record
$url = "$baseUrl/api/computer"

$params = @{
    Name = $env:COMPUTERNAME; 
    Description = $compOS.Description 
    IPAddress = $ipv4Addess
    MACAddress = $macAddess
    User = $env:USERNAME 
}

Invoke-WebRequest $url -Method Post -Body $params -UseBasicParsing`;

export class Scripts extends React.Component<any, any> {

    renderAddComputerPowershellScript(): JSX.Element[] {

        const line1 = `$baseUrl = "${window.location.origin}"\n`;
        const modifiedScript = line1 + script;
        const scriptLines = modifiedScript.split("\n");
        return scriptLines.map((line, i) => {
            return (
                <div key={i}>
                    <code> {line} </code>
                </div>);
        });
    }

    render(): JSX.Element {

        return (

            <Panel bsStyle="primary">
                <Panel.Heading>
                    <h3>Add Computer Script</h3>
                    <p>This script creates a record for the computer on your Rouser server.</p>
                </Panel.Heading>
                <Panel.Body>
                    <pre>
                        {this.renderAddComputerPowershellScript()}
                    </pre>
                </Panel.Body>
            </Panel>
                
        );
    }
}
