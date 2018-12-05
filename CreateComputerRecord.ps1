# Get the IP and MAC Address for this computer
$data = (Get-WmiObject -Class Win32_NetworkAdapterConfiguration | where {$_.DefaultIPGateway -ne $null}) | Select-Object -first 1
$macAddess = $data.MACAddress
$ipv4Addess = $data.IPAddress | Select-Object -First 1

# Call WebAPI to create computer record
$url = "http://rnapt01/Rouser/api/computer"
$params = @{ 
    Name = $env:COMPUTERNAME; 
    Description = "$env:USERNAME's computer"
    IPAddress = $ipv4Addess
    MACAddress = $macAddess
    User = $env:USERNAME }


# Make API request, selecting JSON properties from response
Invoke-WebRequest $url -Method Post -Body $params -UseBasicParsing