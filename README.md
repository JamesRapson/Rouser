# Rouser - Computer Wakeup Web Server.

This project is a web server that allows you to remoting wake a sleeping computer by sending it a WOL Magic Packet.
The primary purpose of this project is to allow desktop computers within a corporate environment to go into low power mode and still have a way to remotely wake these computers when a user needs to remotely connect to them.

In the office where I work, we have many desktop computers that staff use in their daily work. 
These staff also regularly remotely connect to their computers using the corporate VPN when working at home or remotely.
For staff to remotely connect to their computers these computers need to be awake, and for this reason these computers can't have a power scheme set that would place them into sleep or hibernate low power modes.

The Rouser Web Server enables users to wake their computers from a sleep or hibernate mode using a web page that they can access once connected to the corporate VPN. 
This allows you to set power schemes on your computers that put them into a low power mode when not in use, saving you energy, CO2 emissions and money.

The website provides a script to easily populate the web server with the information it requires to send WOL packets to a computer. This script can be run manually or as part of a domain wide login script.
The website also provides a script that will set a computer's power scheme and can create a scheduled task to put the computer into sleep mode at a specified time

The ultimate aim is to save energy/power, CO2 and money in the running of your desktop fleet by making it very easy for a user to wake and remotely connect to their computer whenever they wish to, hence removing one of the inconveniences of using power schemes.

## Technical Details
This is a ASP.NET Core project with a SPA style client application using Typescript
Power Management scripts are currently in Powershell only, however the plan is to provide equivalent scripts for MAC OS and Linux.
WOL Magic packets are used to wake computers. These are sent as global and subnet directed broadcasts. 

## TODO List
- DONE On computer list page show previously woken computers at top of list
- DONE Make UI responsive so it can be used from a mobile phone
- DONE Provide a link to wake computer and open an RDP file
- DONE Rate limit sending on WOLs such that website is not used to DOS on a network
- Add OS type field
- Implement authentication (Think techture? Open ID) 
