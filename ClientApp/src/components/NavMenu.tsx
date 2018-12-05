import * as React from "react";
import { Link } from "react-router-dom";
import { Glyphicon, Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./NavMenu.css";

export class NavMenu extends React.Component<any, any> {

  render() {
    return (
      <Navbar inverse fixedTop fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to={"/computerwake"}>Computer Power Rouser</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to={"/computerwake"}>
                <NavItem>
                    <Glyphicon glyph="th-list" /> Computer Wake
                </NavItem>
            </LinkContainer>
            <LinkContainer to={"/scripts"} exact>
              <NavItem>
                  <Glyphicon glyph="info-sign" /> Scripts
              </NavItem>
            </LinkContainer>
        </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
