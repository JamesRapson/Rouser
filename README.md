# Rouser - Computer Wakeup Web Server.

This project is a web server that allows you to remoting wake a sleeping computer by sending it a WOL Magic Packet.
The primary purpose of this project is to allow desktop computers within a corporate environment to go into low power mode and still have a way to remotely wake these computers when a user needs to remotely commect to them.

In the office where I work we have a large number of desktop computers that staff use in their daily work. 
These staff also regularly remotely connect to their computers using the corporate VPN in order to do work. 
In order for staff to be able to remotely connect to their computers it needs to be awake and for this reason can't have a power scheme set to place the computer to sleep.

The Rouser web server allows users to wake their computers via a web page that they can access after they have connected to the corporate VPN

The website also provides scripts to populate the web server with information it requires to send WOL packets. 
and provides a script for setting a computer's power scheme and creating a schedule to put the computer into sleep mode.

The ultimate aim is to save energy/power, CO2 and money in the running cost of your desktop fleet


## TODO List
DONE On computer list page show previously woken computers at top of list
- Make UI responsive so it can be used from a mobile phone
DONE Provide a link to wake computer and open an RDP file
- Implement authentication (Think techture? Open ID) 
- Rate limit sending on WOLs such that website is not used to DOS on a network

