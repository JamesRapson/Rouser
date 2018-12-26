Rouser - Computer Wakeup Web Server.

This project is a web server that allows you to wake a sleeping computer by sending it a WOL Magic Packet.
The primary purpose of this project is to allow desktop computers within a corporate environment to go into low power mode and still have a way to remotely wake these computers when a user needs to RDP to them.

My work has a large number of desktop computers that staff use in their daily work. These staff also regularly remotely connect to their computers using the corporate VPN in order to do work. 
In order for staff to be able to remotely connect to their computers they need to be awake and for this reason can't have a power scheme set to place the computer to sleep.
This project allows staff to access a webpage after they have connected via VPN that allows them to wake their computer so that they can 
remote connect to it. 
The website also provides scripts to populate the web server with information it requires to send WOL packets. 
It also provides a script for setting a computer's power scheme and creating a schedule to put the computer into sleep mode.
