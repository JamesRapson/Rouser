import * as React from "react";
import { Panel, Button, Glyphicon, FormGroup, Col, DropdownButton, MenuItem, Form } from "react-bootstrap";
import "../index.css";

const addComputerScript = `## Powershell ##

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
$url = "%baseUrl%/api/computer" 

$body = @{ 
    Name = $env:COMPUTERNAME;
    Description = $compOS.Description;
    User = $env:USERNAME;
    NetworkAdapters = $adapters
} 

Invoke-RestMethod -Uri $url -Method Post -UseDefaultCredential -Body (ConvertTo-Json $body)  -ContentType "application/json"
`;

const setPowerSchemeScript = `## Powershell ##

$monitor = %monitor-standby%
$standby = %computer-standby%
$dailySleepTime = %dailySleepTime%
$dailyWakeTime = %dailyWakeTime%
$sleepComputerTaskName = "Rouser - Sleep Computer"
$wakeComputerTaskName = "Rouser - Wake Computer"

### Set power scheme ###
if ($monitor -ne $null) {
    &powercfg -change monitor-timeout-ac $monitor
    &powercfg -change monitor-timeout-dc $monitor
}
if ($standby -ne $null) {
    &powercfg -change standby-timeout-ac $standby
    &powercfg -change standby-timeout-dc $standby
}

### Delete existing Scheduled Tasks ###
$taskExists = Get-ScheduledTask | Where-Object {$_.TaskName -like $sleepComputerTaskName }
if($taskExists) {
    Unregister-ScheduledTask -TaskName $sleepComputerTaskName -Confirm:$false
}

$taskExists = Get-ScheduledTask | Where-Object {$_.TaskName -like $wakeComputerTaskName }
if($taskExists) {
    Unregister-ScheduledTask -TaskName $wakeComputerTaskName -Confirm:$false
}

### Create a scheduled task to put computer to sleep ###
if ($dailySleepTime -ne $null) {
    $action = New-ScheduledTaskAction -Execute 'rundll32.exe' -Argument 'powrprof.dll,SetSuspendState 0,1,0'
    $trigger =  New-ScheduledTaskTrigger -Daily -At $dailySleepTime
    Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $sleepComputerTaskName -Description "Puts computer to sleep"
}

### Create a scheduled task wake the computer ###
if ($dailyWakeTime -ne $null) {
    $action = New-ScheduledTaskAction -Execute 'nothing'
    $trigger =  New-ScheduledTaskTrigger -Daily -At $dailyWakeTime
    $settings = New-ScheduledTaskSettingsSet -WakeToRun:$true -AllowStartIfOnBatteries:$false
    Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $wakeComputerTaskName -Description "Wakes computer" -Settings $settings
}
`;

interface DropdownOption {
    value: string|number;
    label: string;
}

const sleepDurationOptions: DropdownOption[] = [
    { value: "$null", label: "never" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hr" },
    { value: 120, label: "2 hrs" },
    { value: 180, label: "3 hrs" },
    { value: 240, label: "4 hrs" }
];

let sleepTimeOptions: DropdownOption[] = [];


export class Scripts extends React.Component<any, any> {

    addComputerScriptTextArea: HTMLTextAreaElement = null;
    setPowerSchemeScriptTextArea: HTMLTextAreaElement = null;

    constructor(props: any) {
        super(props);

        if (sleepTimeOptions.length === 0) {

            sleepTimeOptions.push({ value: "$null", label: "never" });

            for (let hour = 1; hour <= 12; hour++) {
                sleepTimeOptions.push({ value: `\"${hour}am\"`, label: `${hour}:00 am` });
            }
            for (let hour = 1; hour <= 12; hour++) {
                sleepTimeOptions.push({ value: `\"${hour}pm\"`, label: `${hour}:00 pm` });
            }
        }

        this.state = {
            monitorStandby: 60,
            computerStandby: 120,
            dailySleepTime: sleepTimeOptions[0].value,
            dailyWakeTime :sleepTimeOptions[0].value
        };
        
    }

    copyAddComputerScriptToClipboard(): void {
        this.addComputerScriptTextArea.select();
        document.execCommand("Copy");
    }

    copySetPowerSchemeScriptToClipboard(): void {
        this.setPowerSchemeScriptTextArea.select();
        document.execCommand("Copy");   
    }

    getTitleForDropdownList(selectedValue: string|number, options: DropdownOption[]): string {

        const selected = options.filter(x => x.value === selectedValue);
        if (selected && selected.length > 0)
            return selected[0].label;
        return null;
    }

    renderSetPowerSchemeScript(): JSX.Element {

        let modifiedSetPowerSchemeScript = setPowerSchemeScript.replace("%monitor-standby%", this.state.monitorStandby);
        modifiedSetPowerSchemeScript = modifiedSetPowerSchemeScript.replace("%computer-standby%", this.state.computerStandby);
        modifiedSetPowerSchemeScript = modifiedSetPowerSchemeScript.replace("%dailySleepTime%", this.state.dailySleepTime);
        modifiedSetPowerSchemeScript = modifiedSetPowerSchemeScript.replace("%dailyWakeTime%", this.state.dailyWakeTime);

        return (
            <Panel bsStyle="primary">
                <Panel.Heading>
                    <h3>Set Power Scheme Script</h3>
                    <p>This script sets the Sleep power scheme for your computer.</p>
                </Panel.Heading>
                <Panel.Body>
                    <div>
                        <Form horizontal>
                            <FormGroup>
                                <Col sm={3}>Monitor Standby : </Col>
                                <Col sm={3}>
                                    <DropdownButton
                                        title={this.getTitleForDropdownList(this.state.monitorStandby, sleepDurationOptions)}
                                        bsStyle="default"
                                        id="drpMonitorStandby"
                                        onSelect={(val: any) => this.setState({ monitorStandby: val })} >
                                        {sleepDurationOptions.map((option) =>
                                            (<MenuItem key={option.value} eventKey={option.value}>{option.label}</MenuItem>)
                                        )}
                                    </DropdownButton>

                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Computer Standby : </Col>
                                <Col sm={3}>
                                    <DropdownButton
                                        title={this.getTitleForDropdownList(this.state.computerStandby, sleepDurationOptions)}
                                        bsStyle="default"
                                        id="drpComputerStandby"
                                        onSelect={(val: any) => this.setState({ computerStandby: val })} >
                                        {sleepDurationOptions.map((option) =>
                                            (<MenuItem key={option.value}  eventKey={option.value}>{option.label}</MenuItem>)
                                        )}
                                    </DropdownButton>
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Scheduled Sleep Time : </Col>
                                <Col sm={3}>
                                    <DropdownButton
                                        title={this.getTitleForDropdownList(this.state.dailySleepTime, sleepTimeOptions)}
                                        bsStyle="default"
                                        id="drpDailySleepTime"
                                        onSelect={(val: any) => this.setState({ dailySleepTime: val })}
                                        key={this.state.dailySleepTime} >
                                        {sleepTimeOptions.map((option) =>
                                            (<MenuItem key={option.value} eventKey={option.value}>{option.label}</MenuItem>)
                                        )}
                                    </DropdownButton>
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Scheduled Wakeup Time : </Col>
                                <Col sm={3}>
                                    <DropdownButton
                                        title={this.getTitleForDropdownList(this.state.dailyWakeTime, sleepTimeOptions)}
                                        bsStyle="default"
                                        id="drpDailySleepTime"
                                        onSelect={(val: any) => this.setState({ dailyWakeTime: val })}
                                        key={this.state.dailyWakeTime} >
                                        {sleepTimeOptions.map((option) =>
                                            (<MenuItem key={option.value} eventKey={option.value}>{option.label}</MenuItem>)
                                        )}
                                    </DropdownButton>
                                </Col>
                            </FormGroup>
                        </Form>
                    </div>
                    <div className="scriptBlockContainer">
                        <textarea className="scriptBlock"
                            ref={(textarea) => this.setPowerSchemeScriptTextArea = textarea}
                            value={modifiedSetPowerSchemeScript}
                        />
                        <Button onClick={() => this.copySetPowerSchemeScriptToClipboard()} className="clipboardBtn">
                            <Glyphicon glyph="copy" /> Copy
                        </Button>
                    </div>
                </Panel.Body>
            </Panel>);
    }

    renderAddComputerScript(): JSX.Element {

        const baseUrl = window.location.href.replace("scripts", "");
        const modifiedAddComputerScript = addComputerScript.replace("%baseUrl%", baseUrl);

        return (
            <Panel bsStyle="primary">
                <Panel.Heading>
                    <h3>Add Computer Script</h3>
                    <p>This script creates a record for the computer on your Rouser server.</p>
                </Panel.Heading>
                <Panel.Body>
                    <div className="scriptBlockContainer">
                        <textarea className="scriptBlock"
                            ref={(textarea) => this.addComputerScriptTextArea = textarea}
                            value={modifiedAddComputerScript}
                        />
                        <Button onClick={() => this.copyAddComputerScriptToClipboard()} className="clipboardBtn">
                            <Glyphicon glyph="copy" /> Copy
                        </Button>
                    </div>
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
